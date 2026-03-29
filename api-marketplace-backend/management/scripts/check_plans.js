const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hkzyuhagnejxitldvuat:ie5C%3F%2CZ%2ChFaS%21b_@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
client.connect()
  .then(() => client.query("SELECT * FROM plans WHERE api_id = '0abe192d-8ed5-4c56-4686-9041092750e5'"))
  .then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(e => console.error(e.message))
  .finally(() => client.end());
