
import 'dotenv/config';
import { db } from './src/db/client.ts';
import * as schema from './src/db/schema.ts';
import { sql } from 'drizzle-orm';

async function test() {
  try {
    const result = await db.execute(sql`SELECT version()`);
    console.log('DB SUCCESS: Postgres version verified.');
    
    const count = await db.select({ c: sql`count(*)` }).from(schema.users);
    console.log('DB SUCCESS: Users count =', count[0].c);
    
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR:', err.message);
    process.exit(1);
  }
}
test();
