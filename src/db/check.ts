import { db } from './index';
import { messages } from './schema';

async function check() {
  try {
    const allMessages = await db.select().from(messages);
    console.log('Current messages in database:', allMessages);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

// Run the check function
check(); 