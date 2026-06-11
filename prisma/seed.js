require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.marketingTask.deleteMany();
  await prisma.marketingPlan.deleteMany();
  await prisma.ePK.deleteMany();
  await prisma.gigApplication.deleteMany();
  await prisma.artistProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.gig.deleteMany();

  const user = await prisma.user.upsert({
    where: { email: 'artist@example.com' },
    update: {},
    create: {
      email: 'artist@example.com',
      passwordHash: 'hashed_password', // In a real app, this would be hashed
      role: 'ARTIST',
      artistProfile: {
        create: {
          name: 'Neon Soul',
          bio: 'Atmospheric synth-pop from the heart of London.',
          genre: 'Indie Pop',
          location: 'London, UK',
          socialLinks: {
            spotify: 'https://spotify.com',
            instagram: 'https://instagram.com',
            tiktok: 'https://tiktok.com'
          },
          epks: {
            create: {
              title: 'Neon Dreams EPK',
              slug: 'neon-soul',
              description: 'Official EPK for Neon Soul',
              musicLinks: { spotify: 'https://spotify.com/album/123' },
              videoLinks: { youtube: 'https://youtube.com/watch?v=123' },
              pressQuotes: [
                { text: 'A refreshing take on modern pop.', source: 'Indie Sound Blog' },
                { text: 'Hauntingly beautiful melodies.', source: 'The Music Review' }
              ],
              isPublic: true
            }
          },
          marketingPlans: {
            create: {
              title: 'Summer Tour Prep',
              strategy: 'Focus on playlist pitching and local gig booking.',
              goals: ['10k monthly listeners', 'Book 5 local gigs'],
              status: 'ACTIVE',
              tasks: {
                create: [
                  { title: 'Update EPK', description: 'Ensure latest press photos and links are in the EPK.', order: 1, week: 8, isCompleted: true },
                  { title: 'Pitch to Spotify Editorial', description: 'Submit the new single via Spotify for Artists.', order: 2, week: 4, isCompleted: false },
                  { title: 'Reach out to local venues', description: 'Email Camden venues for potential support slots.', order: 3, week: 3, isCompleted: false },
                  { title: 'Social Media Teaser', description: 'Post the 15-second teaser clip on TikTok.', order: 4, week: 2, isCompleted: false }
                ]
              }
            }
          }
        }
      }
    }
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
