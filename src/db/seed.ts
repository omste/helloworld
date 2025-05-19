import { db } from './index';
import { messages } from './schema';

async function seed() {
  try {
    // Clear existing messages
    await db.delete(messages);

    // Insert the default message
    await db.insert(messages).values({
      themessage: 'Hello, world!'
    });

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed(); 