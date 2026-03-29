const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hkzyuhagnejxitldvuat:ie5C%3F%2CZ%2ChFaS%21b_@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
client.connect()
  .then(() => client.query("SELECT id, name FROM apis WHERE name LIKE '%Real Market Demo%' LIMIT 1"))
  .then(r => console.log(r.rows[0].id))
  .catch(e => console.error(e.message))
  .finally(() => client.end());
