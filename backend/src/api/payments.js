
import Stripe from 'stripe';
import { query } from '../models/db.js';
import { config } from '../config/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export default async function paymentRoutes(fastify) {
  // CREATE CHECKOUT SESSION
  // Fulfills the "CLIQUE+" 4.99/mo subscription request
  fastify.post('/subscribe', async (request, reply) => {
    const user = request.user;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email, // If it exists
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'CLIQUE+ Sovereign Access',
                description: 'Full Ghost Mode, Story Vision & Unlimited Prestige.',
                images: ['https://clique.ca/assets/gold_bullion.png'],
              },
              unit_amount: 499, // $4.99
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${config.CORS_ORIGINS[0]}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.CORS_ORIGINS[0]}/profile`,
        metadata: {
          userId: user.id,
          tier: 'CLIQUE+'
        }
      });

      return { checkoutUrl: session.url };
    } catch (err) {
      fastify.log.error('Stripe checkout error:', err.message);
      return reply.code(500).send({ error: 'Failed to create subscription session' });
    }
  });

  // CREATE UPGRADE SESSION - THE BEEHIVE SHOP 🐝
  fastify.post('/upgrade', async (request, reply) => {
    const { itemId } = request.body; // 'royal_jelly', 'golden_sting', 'hive_essence'
    const user = request.user;

    let product = {
      name: 'Hive Essence (50.5 Prestige)',
      amount: 999, // $9.99
    };

    if (itemId === 'royal_jelly') {
      product = {
        name: 'Royal Jelly (Permanent 2x Influence Multiplier)',
        amount: 4999, // $49.99
      };
    } else if (itemId === 'golden_sting') {
      product = {
        name: 'Golden Sting (Unlimited Screenshot Alerts)',
        amount: 1999, // $19.99
      };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: product.name,
                description: 'Prestige upgrade for your Sovereign profile.',
              },
              unit_amount: product.amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${config.CORS_ORIGINS[0]}/upgrade-success`,
        cancel_url: `${config.CORS_ORIGINS[0]}/profile`,
        metadata: {
          userId: user.id,
          type: 'upgrade',
          itemId: itemId || 'influence_score'
        }
      });

      return { checkoutUrl: session.url };
    } catch (err) {
      fastify.log.error('Upgrade checkout error:', err.message);
      return reply.code(500).send({ error: 'Failed to create upgrade session' });
    }
  });

  // WEBHOOK HANDLER
  fastify.post('/webhook', { config: { rawBody: true } }, async (request, reply) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
      );
    } catch (err) {
      return reply.code(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const itemType = session.metadata.type;
      const itemId = session.metadata.itemId;

      if (itemType === 'upgrade') {
        let points = 50.5;
        if (itemId === 'royal_jelly') points = 250.0;
        else if (itemId === 'golden_sting') points = 100.0;
        
        // Apply upgrade
        await query(
          "UPDATE users SET influence_score = influence_score + $1 WHERE id = $2",
          [points, userId]
        );
        console.log(`[STRIPE] Beehive Upgrade Applied: ${itemId} -> User ${userId}`);
      } else {
        // UPDATE SUBSCRIPTION STATUS
        await query(
          "UPDATE users SET sovereign_tier = 'CLIQUE+ ⚔️', influence_score = influence_score + 50.0 WHERE id = $1",
          [userId]
        );
        console.log(`[STRIPE] User ${userId} upgraded to CLIQUE+`);
      }
    }

    return { received: true };
  });
}
