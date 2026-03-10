// Subscription API - Freemium model for Clique
import { query } from '../models/db.js';

export default async function subscriptionRoutes(fastify, opts) {
  
  // Get current user's subscription status
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `SELECT 
        id, 
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancelled_at,
        created_at
       FROM subscriptions 
       WHERE user_id = $1 AND status IN ('active', 'trialing', 'past_due')
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    const subscription = result.rows[0];
    
    // Get plan details
    let plan = null;
    if (subscription) {
      const planResult = await query(
        'SELECT * FROM subscription_plans WHERE id = $1',
        [subscription.plan_id]
      );
      plan = planResult.rows[0];
    }
    
    // Get usage stats
    const usage = await query(
      `SELECT 
        (SELECT COUNT(*) FROM stories WHERE user_id = $1) as total_stories,
        (SELECT COUNT(*) FROM stories WHERE user_id = $1 AND created_at >= CURRENT_DATE) as daily_stories,
        (SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND ephemeral_mode = true AND created_at >= CURRENT_DATE) as daily_ephemeral_messages`,
      [userId]
    );
    
    const userUsage = usage.rows[0];
    
    // Get free tier limits
    const freeLimits = {
      dailyStories: 3,
      dailyEphemeralMessages: 5,
      maxCliques: 1,
      maxFriends: 100
    };
    
    return {
      subscription: subscription ? {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelledAt: subscription.cancelled_at,
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          features: plan.features
        }
      } : null,
      usage: {
        totalStories: parseInt(userUsage.total_stories),
        dailyStories: parseInt(userUsage.daily_stories),
        dailyEphemeralMessages: parseInt(userUsage.daily_ephemeral_messages)
      },
      limits: freeLimits,
      isPremium: subscription !== null
    };
  });
  
  // Get all available subscription plans
  fastify.get('/plans', async (request, reply) => {
    const result = await query(
      'SELECT * FROM subscription_plans WHERE active = true ORDER BY price ASC'
    );
    
    return {
      plans: result.rows.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        features: p.features,
        popular: p.popular
      }))
    };
  });
  
  // Create Stripe checkout session
  fastify.post('/checkout', async (request, reply) => {
    const userId = request.user.userId;
    const { planId } = request.body;
    
    // Verify plan exists
    const planResult = await query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND active = true',
      [planId]
    );
    
    if (planResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Plan not found' });
    }
    
    const plan = planResult.rows[0];
    
    // Check if user already has active subscription
    const existing = await query(
      `SELECT id FROM subscriptions 
       WHERE user_id = $1 AND status IN ('active', 'trialing')
       LIMIT 1`,
      [userId]
    );
    
    if (existing.rows.length > 0) {
      return reply.code(409).send({ 
        error: 'User already has active subscription',
        subscriptionId: existing.rows[0].id
      });
    }
    
    // In production, this would create a Stripe checkout session
    // For now, return mock data with Stripe publishable key
    const checkoutSession = {
      id: `cs_test_${Date.now()}`,
      url: `${process.env.FRONTEND_URL}/upgrade?plan=${planId}`,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      currency: plan.currency,
      successUrl: `${process.env.FRONTEND_URL}/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/cancel`
    };
    
    return checkoutSession;
  });
  
  // Webhook handler for Stripe events
  fastify.post('/webhook', async (request, reply) => {
    const signature = request.headers['stripe-signature'];
    const payload = request.body;
    
    // In production, verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Handle different event types
    switch (payload.type) {
      case 'checkout.session.completed':
        // Subscription created
        await query(
          `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '1 month')
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             plan_id = $2,
             status = 'active',
             current_period_start = NOW(),
             current_period_end = NOW() + INTERVAL '1 month',
             cancelled_at = NULL`,
          [payload.data.object.client_reference_id, payload.data.object.metadata.plan_id]
        );
        break;
        
      case 'customer.subscription.updated':
        // Subscription updated
        await query(
          `UPDATE subscriptions 
           SET status = $1, current_period_end = NOW() + INTERVAL '1 month'
           WHERE id = $2`,
          [payload.data.object.status, payload.data.object.metadata.subscription_id]
        );
        break;
        
      case 'customer.subscription.deleted':
        // Subscription cancelled
        await query(
          `UPDATE subscriptions 
           SET status = 'cancelled', cancelled_at = NOW()
           WHERE id = $1`,
          [payload.data.object.metadata.subscription_id]
        );
        break;
    }
    
    return { received: true };
  });
  
  // Cancel subscription
  fastify.delete('/me', async (request, reply) => {
    const userId = request.user.userId;
    
    const result = await query(
      `UPDATE subscriptions 
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE user_id = $1 AND status IN ('active', 'trialing')
       RETURNING id`,
      [userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'No active subscription found' });
    }
    
    return { message: 'Subscription cancelled', subscriptionId: result.rows[0].id };
  });
  
  // Upgrade to premium
  fastify.post('/upgrade', async (request, reply) => {
    const userId = request.user.userId;
    const { planId } = request.body;
    
    // Verify plan exists
    const planResult = await query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND active = true',
      [planId]
    );
    
    if (planResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Plan not found' });
    }
    
    // Check if user already has this plan
    const existing = await query(
      `SELECT id FROM subscriptions 
       WHERE user_id = $1 AND plan_id = $2 AND status = 'active'
       LIMIT 1`,
      [userId, planId]
    );
    
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Already on this plan' });
    }
    
    // Create or update subscription
    const result = await query(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
       VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '1 month')
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         plan_id = $2,
         status = 'active',
         current_period_start = NOW(),
         current_period_end = NOW() + INTERVAL '1 month',
         cancelled_at = NULL
       RETURNING *`,
      [userId, planId]
    );
    
    return { 
      message: 'Upgraded to premium',
      subscriptionId: result.rows[0].id
    };
  });
  
  // Check if user has premium access to specific feature
  fastify.get('/feature/:feature', async (request, reply) => {
    const userId = request.user.userId;
    const { feature } = request.params;
    
    // Check subscription status
    const subResult = await query(
      `SELECT plan_id FROM subscriptions 
       WHERE user_id = $1 AND status IN ('active', 'trialing')
       LIMIT 1`,
      [userId]
    );
    
    if (subResult.rows.length === 0) {
      return { hasAccess: false, isFreeTier: true };
    }
    
    // Check if feature is in plan
    const planResult = await query(
      'SELECT features FROM subscription_plans WHERE id = $1',
      [subResult.rows[0].plan_id]
    );
    
    const planFeatures = planResult.rows[0]?.features || [];
    const hasAccess = planFeatures.includes(feature) || planFeatures.includes('*');
    
    return { hasAccess, isFreeTier: !hasAccess };
  });
}
