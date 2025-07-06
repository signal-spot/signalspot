-- Initialize SignalSpot database
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE signalspot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'signalspot')\gexec

-- Connect to the signalspot database
\c signalspot;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE signal_type AS ENUM ('spark', 'spot');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for common queries (will be created by MikroORM migrations as well)
-- These are just examples and will be managed by the ORM

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE signalspot TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Log initialization
\echo 'SignalSpot database initialized successfully' 