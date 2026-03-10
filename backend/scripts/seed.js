// Database seed script
// Creates initial test data for development

import { db, query } from '../src/models/db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Create test users
    const users = [
      {
        phone: '+15145550101',
        username: 'clique_mtl',
        display_name: 'Montréal Élite',
        bio: 'Vivre pour l\'instant. 🥂',
        location: 'Montréal, QC',
        snap_score: 150,
        story_visibility: 'friends',
        allow_screenshots: false,
        ghost_mode: false
      },
      {
        phone: '+15145550102',
        username: 'clique_quebec',
        display_name: 'Québec City',
        bio: 'L\'histoire de l\'Élite. 🏰',
        location: 'Québec, QC',
        snap_score: 120,
        story_visibility: 'friends',
        allow_screenshots: false,
        ghost_mode: false
      },
      {
        phone: '+15145550103',
        username: 'clique_gatineau',
        display_name: 'Gatineau Élite',
        bio: 'Rive nord, rive sud. 🌉',
        location: 'Gatineau, QC',
        snap_score: 90,
        story_visibility: 'friends',
        allow_screenshots: false,
        ghost_mode: false
      }
    ];

    // Create users
    for (const user of users) {
      const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);
      
      await query(
        `INSERT INTO users (
          phone, username, display_name, bio, location,
          snap_score, story_visibility, allow_screenshots, ghost_mode,
          created_at, last_active_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (username) DO NOTHING`,
        [
          user.phone,
          user.username,
          user.display_name,
          user.bio,
          user.location,
          user.snap_score,
          user.story_visibility,
          user.allow_screenshots,
          user.ghost_mode
        ]
      );
      console.log(`✓ Created user: ${user.username}`);
    }

    // Create friendships
    const friendships = [
      ['clique_mtl', 'clique_quebec'],
      ['clique_mtl', 'clique_gatineau'],
      ['clique_quebec', 'clique_gatineau']
    ];

    for (const [userA, userB] of friendships) {
      await query(
        `INSERT INTO friendships (user_a, user_b, status, created_at)
         SELECT u1.id, u2.id, 'accepted', NOW()
         FROM users u1, users u2
         WHERE u1.username = $1 AND u2.username = $2
         ON CONFLICT (user_a, user_b) DO NOTHING`,
        [userA, userB]
      );
      console.log(`✓ Created friendship: ${userA} ↔ ${userB}`);
    }

    // Create sample cliques
    const cliques = [
      {
        name: 'Plateau Mont-Royal',
        slug: 'plateau-mont-royal',
        region: 'Montréal',
        neighborhood: 'Plateau-Mont-Royal',
        radius_meters: 2000
      },
      {
        name: 'Old Montreal',
        slug: 'old-montreal',
        region: 'Montréal',
        neighborhood: 'Vieux-Montréal',
        radius_meters: 1500
      },
      {
        name: 'Downtown Quebec City',
        slug: 'downtown-quebec',
        region: 'Québec',
        neighborhood: 'Vieux-Québec',
        radius_meters: 1000
      }
    ];

    for (const clique of cliques) {
      await query(
        `INSERT INTO cliques (name, slug, center, region, neighborhood, radius_meters, created_at)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint(-73.5673, 45.5017), 4326), $3, $4, $5, NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [clique.name, clique.slug, clique.region, clique.neighborhood, clique.radius_meters]
      );
      console.log(`✓ Created clique: ${clique.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Phone: +15145550101');
    console.log('Password: password123');
    console.log('\nYou can now run: npm run dev');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
