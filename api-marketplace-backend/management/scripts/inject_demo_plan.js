const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hkzyuhagnejxitldvuat:ie5C%3F%2CZ%2ChFaS%21b_@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
const API_ID = '0abe192d-91b6-4686-9041-092750e535c5';

async function inject() {
  try {
    await client.connect();
    // 1. Insert Plan
    const planRes = await client.query(
      "INSERT INTO plans (name, quota, price, api_id, type) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      ['Demo Free Tier', 1000, 0, API_ID, 'standard']
    );
    const planId = planRes.rows[0].id;
    console.log(`Plan Created: ${planId}`);

    // 2. Subscribe a consumer
    const consumerRes = await client.query("SELECT id, api_key FROM users WHERE role = 'consumer' LIMIT 1");
    const consumer = consumerRes.rows[0];
    
    await client.query(
      "INSERT INTO subscriptions (user_id, api_id, plan_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, api_id) DO UPDATE SET plan_id = $3",
      [consumer.id, API_ID, planId]
    );
    console.log(`Consumer Subscribed: ${consumer.api_key}`);

  } catch (e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}

inject();
