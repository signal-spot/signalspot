#!/bin/bash
# Nginx setup script for SignalSpot on EC2

echo "================================================"
echo "  Setting up Nginx for SignalSpot"
echo "================================================"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo yum update -y
    sudo yum install nginx -y
fi

# Copy nginx configuration
echo "Copying Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/signalspot

# Create sites-available and sites-enabled if they don't exist
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Create symbolic link
sudo ln -sf /etc/nginx/sites-available/signalspot /etc/nginx/sites-enabled/

# Update main nginx.conf to include sites-enabled
if ! grep -q "include /etc/nginx/sites-enabled/\*;" /etc/nginx/nginx.conf; then
    sudo sed -i '/http {/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
fi

# Test nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "Reloading Nginx..."
    sudo systemctl reload nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx setup complete!"
    echo ""
    echo "SignalSpot API will be available at:"
    echo "  http://lettie-dating.co.kr/signalspot"
    echo ""
    echo "WebSocket will be available at:"
    echo "  ws://lettie-dating.co.kr/signalspot/socket.io"
else
    echo "❌ Nginx configuration test failed"
    echo "Please check the configuration and try again"
    exit 1
fi