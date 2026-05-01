const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // 1. List tables
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log('\n=== TABLES ===');
    tables.rows.forEach(r => console.log(' -', r.table_name));

    // 2. List columns with types
    const cols = await pool.query(
      "SELECT table_name, column_name, data_type, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position"
    );
    console.log('\n=== COLUMNS ===');
    let currentTable = '';
    cols.rows.forEach(r => {
      if (r.table_name !== currentTable) {
        currentTable = r.table_name;
        console.log(`\n[${currentTable}]`);
      }
      console.log(`  ${r.column_name}: ${r.data_type} (default: ${r.column_default || 'none'})`);
    });

    // 3. Check existing data
    for (const t of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) FROM "${t.table_name}"`);
      console.log(`\n${t.table_name} row count: ${count.rows[0].count}`);
    }

    // 4. Sample users
    try {
      const users = await pool.query('SELECT id, email, role, api_key FROM users LIMIT 5');
      console.log('\n=== SAMPLE USERS ===');
      console.log(JSON.stringify(users.rows, null, 2));
    } catch (e) {
      console.log('Users query failed:', e.message);
    }

    // 5. Sample APIs  
    try {
      const apis = await pool.query('SELECT id, name, category, base_url FROM apis LIMIT 5');
      console.log('\n=== SAMPLE APIS ===');
      console.log(JSON.stringify(apis.rows, null, 2));
    } catch (e) {
      console.log('APIs query failed:', e.message);
    }

    // 6. Check if APIs have openapi_spec
    try {
      const specs = await pool.query('SELECT id, name, openapi_spec IS NOT NULL as has_spec, readme_markdown IS NOT NULL as has_docs FROM apis');
      console.log('\n=== API SPEC STATUS ===');
      console.log(JSON.stringify(specs.rows, null, 2));
    } catch (e) {
      console.log('Spec check failed:', e.message);
    }

    // 7. Test signup insert
    console.log('\n=== TEST SIGNUP INSERT ===');
    try {
      const testResult = await pool.query(
        "INSERT INTO users (email, password_hash, role, api_key) VALUES ($1, $2, $3, gen_random_uuid()) RETURNING id, email, role, api_key",
        ['test_check_db@test.com', 'fakehash', 'consumer']
      );
      console.log('INSERT SUCCESS:', JSON.stringify(testResult.rows[0]));
      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['test_check_db@test.com']);
      console.log('Cleanup done');
    } catch (e) {
      console.log('INSERT FAILED:', e.message);
      console.log('Error code:', e.code);
      console.log('Error detail:', e.detail);
    }

  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
