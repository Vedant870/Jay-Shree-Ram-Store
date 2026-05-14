import dotenv from 'dotenv';
import { connectDB, Product } from './src/lib/database.js';
import { MOCK_PRODUCTS } from './src/mockData.js';

dotenv.config({ path: '.env.local' });

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert mock products - add timestamps
    const productsWithTimestamps = MOCK_PRODUCTS.map((product: any) => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await Product.insertMany(productsWithTimestamps as any);
    console.log('✅ Seeded products successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();