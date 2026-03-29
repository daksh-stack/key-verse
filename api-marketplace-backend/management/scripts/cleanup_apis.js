const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hkzyuhagnejxitldvuat:ie5C%3F%2CZ%2ChFaS%21b_@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });

async function removeBench() {
  try {
    await client.connect();
    await client.query("DELETE FROM apis WHERE name = 'Bench API'");
    console.log('Bench API Removed');
    await client.query("DELETE FROM apis WHERE name = 'Test API'");
    console.log('Test API Removed');
  } catch (e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}

removeBench();
