const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hkzyuhagnejxitldvuat:ie5C%3F%2CZ%2ChFaS%21b_@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });

async function listAll() {
  try {
    await client.connect();
    const res = await client.query("SELECT id, name, created_at FROM apis ORDER BY created_at DESC");
    console.log(JSON.stringify(r.rows, null, 2)); // Oops, used r instead of res
  } catch (e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}
// Fixing the typo in-place
const listAllFix = async () => {
    try {
        await client.connect();
        const res = await client.query("SELECT id, name, created_at FROM apis ORDER BY created_at DESC");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) { console.error(e.message); }
    finally { await client.end(); }
};

listAllFix();
