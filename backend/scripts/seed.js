import dotenv from 'dotenv';
import { connectDB } from '../db/connectDB.js';
import { seedData } from '../utils/seedData.js';

// Load environment variables
dotenv.config();

const dbUrl = process.env.DB_URL.replace(
  '<db_password>',
  process.env.DB_PASSWORD
);

const runSeed = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to database
    await connectDB(dbUrl);
    console.log('✅ Connected to database');
    
    // Run seeding
    await seedData();
    
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
