#!/bin/bash
# SignalSpot Production Environment Startup Script
# This script starts Docker services and the NestJS application

set -e  # Exit on error

echo "================================================"
echo "  Starting SignalSpot Production Environment"
echo "================================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production from .env.example"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
set -a
source .env.production
set +a

# Stop existing containers
echo "🔄 Stopping existing Docker containers..."
docker-compose -f docker-compose.production.yml down

# Start Docker services
echo "🚀 Starting Docker services (PostgreSQL, Redis)..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test PostgreSQL connection
echo "🔍 Testing PostgreSQL connection..."
max_retries=10
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USERNAME -d ${DB_DATABASE:-$DB_NAME} -c "SELECT 1" > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    else
        retry_count=$((retry_count + 1))
        echo "⏳ Waiting for PostgreSQL... (attempt $retry_count/$max_retries)"
        sleep 3
    fi
done

if [ $retry_count -eq $max_retries ]; then
    echo "❌ PostgreSQL connection failed after $max_retries attempts"
    docker-compose -f docker-compose.production.yml logs postgres
    exit 1
fi

# Test Redis connection
echo "🔍 Testing Redis connection..."
if redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
    echo "✅ Redis is ready!"
else
    echo "⚠️  Redis connection test failed, but continuing..."
fi

# Build NestJS application
echo "🔨 Building NestJS application..."
NODE_ENV=production npm run build

# Start application with PM2
echo "🚀 Starting NestJS application with PM2..."
pm2 delete signalspot-api 2>/dev/null || true
NODE_ENV=production pm2 start ecosystem.config.js --env production

# Show status
echo ""
echo "================================================"
echo "  ✅ SignalSpot Production Environment Ready!"
echo "================================================"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📌 Useful commands:"
echo "  • View logs:        pm2 logs signalspot-api"
echo "  • Monitor:          pm2 monit"
echo "  • Restart app:      pm2 reload signalspot-api"
echo "  • Stop all:         pm2 stop all && docker-compose -f docker-compose.production.yml down"
echo ""
echo "🌐 API is running at: http://localhost:${PORT:-3000}"
echo "================================================"