const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hkzyuhagnejxitldvuat:ie5C%3F%2CZ%2ChFaS%21b_@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
client.connect()
  .then(() => client.query("SELECT api_key FROM users WHERE role = 'consumer' LIMIT 1"))
  .then(r => console.log(r.rows[0].api_key))
  .catch(e => console.error(e.message))
  .finally(() => client.end());
