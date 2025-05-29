-- Initial setup script for PostgreSQL
-- This script runs when the container starts for the first time

-- Create additional database for testing if needed
-- CREATE DATABASE prisma_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE prisma_learning TO admin;

-- Enable extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a simple function for demonstration
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql'; 