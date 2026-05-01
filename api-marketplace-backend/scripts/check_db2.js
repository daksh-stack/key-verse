const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

const output = [];
const log = (...args) => output.push(args.join(' '));

(async () => {
  try {
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    log('=== TABLES ===');
    tables.rows.forEach(r => log(' -', r.table_name));

    const cols = await pool.query(
      "SELECT table_name, column_name, data_type, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position"
    );
    log('');
    log('=== COLUMNS ===');
    let currentTable = '';
    cols.rows.forEach(r => {
      if (r.table_name !== currentTable) {
        currentTable = r.table_name;
        log('[' + currentTable + ']');
      }
      log('  ' + r.column_name + ': ' + r.data_type + ' (default: ' + (r.column_default || 'none') + ')');
    });

    for (const t of tables.rows) {
      const count = await pool.query('SELECT COUNT(*) FROM "' + t.table_name + '"');
      log(t.table_name + ' rows: ' + count.rows[0].count);
    }

    try {
      const users = await pool.query('SELECT id, email, role FROM users LIMIT 3');
      log('');
      log('=== SAMPLE USERS ===');
      users.rows.forEach(r => log(JSON.stringify(r)));
    } catch (e) { log('Users query failed: ' + e.message); }

    try {
      const apis = await pool.query('SELECT id, name, base_url FROM apis LIMIT 3');
      log('');
      log('=== SAMPLE APIS ===');
      apis.rows.forEach(r => log(JSON.stringify(r)));
    } catch (e) { log('APIs query failed: ' + e.message); }

    try {
      const specs = await pool.query('SELECT id, name, (openapi_spec IS NOT NULL) as has_spec, (readme_markdown IS NOT NULL) as has_docs FROM apis');
      log('');
      log('=== API SPEC STATUS ===');
      specs.rows.forEach(r => log(JSON.stringify(r)));
    } catch (e) { log('Spec check failed: ' + e.message); }

    // Test signup
    log('');
    log('=== TEST SIGNUP ===');
    try {
      const testResult = await pool.query(
        "INSERT INTO users (email, password_hash, role, api_key) VALUES ($1, $2, $3, gen_random_uuid()) RETURNING id, email, role, api_key",
        ['test_diag_928374@test.com', 'fakehash', 'consumer']
      );
      log('INSERT OK: ' + JSON.stringify(testResult.rows[0]));
      await pool.query('DELETE FROM users WHERE email = $1', ['test_diag_928374@test.com']);
      log('Cleanup done');
    } catch (e) {
      log('INSERT FAILED: ' + e.message);
      log('Error code: ' + e.code);
      if (e.detail) log('Detail: ' + e.detail);
    }

  } catch (e) {
    log('ERROR: ' + e.message);
  } finally {
    await pool.end();
    fs.writeFileSync(path.join(__dirname, 'db_report.txt'), output.join('\n'), 'utf8');
    console.log('Report written to scripts/db_report.txt');
  }
})();
