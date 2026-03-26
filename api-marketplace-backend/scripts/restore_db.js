const { pool } = require('../shared/config');

async function restore() {
    try {
        console.log('🔄 Initiating Standalone Schema Restoration...');
        
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";

            DROP TABLE IF EXISTS subscriptions CASCADE;
            DROP TABLE IF EXISTS plans CASCADE;
            DROP TABLE IF EXISTS apis CASCADE;
            DROP TABLE IF EXISTS users CASCADE;

            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'consumer',
                api_key UUID UNIQUE DEFAULT gen_random_uuid(),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE apis (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                base_url TEXT NOT NULL,
                logo_url TEXT,
                openapi_spec JSONB,
                readme_markdown TEXT,
                category TEXT DEFAULT 'General',
                visibility JSONB DEFAULT '{"status": "public"}',
                gateway_config JSONB DEFAULT '{"timeout": 5000}',
                monetization JSONB DEFAULT '{"mode": "free"}',
                mock_enabled BOOLEAN DEFAULT false,
                mock_response JSONB DEFAULT '{"status": 200, "body": {"message": "ApexHub Mock Response v1.0"}}',
                deployment_type TEXT DEFAULT 'hosted',
                external_gateway_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE plans (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                quota INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                api_id UUID REFERENCES apis(id) ON DELETE CASCADE,
                type TEXT NOT NULL DEFAULT 'standard',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE subscriptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                api_id UUID REFERENCES apis(id) ON DELETE CASCADE,
                plan_id UUID REFERENCES plans(id),
                usage_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, api_id)
            );
        `);
        console.log('✅ Restoration Complete: ApexHub Fabric Baseline Established');
        process.exit(0);
    } catch (err) {
        console.error('❌ Restoration Failed:', err);
        process.exit(1);
    }
}

restore();
