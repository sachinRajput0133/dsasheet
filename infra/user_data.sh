#!/bin/bash
set -euxo pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

# ── 1. System update + core packages ─────────────────────────────────────────
dnf update -y
dnf install -y docker git aws-cli nginx certbot python3-certbot-nginx

# ── 2. Start Docker ───────────────────────────────────────────────────────────
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ── 3. Docker Compose v2 plugin ───────────────────────────────────────────────
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# ── 4. Fetch secrets from SSM → write .env ───────────────────────────────────
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
APP_DIR=/home/ec2-user/dsasheet
mkdir -p "$APP_DIR"

# Pull each param individually so the key name is clean
get_param() {
  aws ssm get-parameter --region "$REGION" --name "$1" --with-decryption \
    --query "Parameter.Value" --output text 2>/dev/null || echo ""
}

cat > "$APP_DIR/.env" <<EOF
API_PORT=3001
NODE_ENV=production
MONGODB_URI=$(get_param /dsasheet/MONGODB_URI)
JWT_ACCESS_SECRET=$(get_param /dsasheet/JWT_ACCESS_SECRET)
JWT_REFRESH_SECRET=$(get_param /dsasheet/JWT_REFRESH_SECRET)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=$(get_param /dsasheet/CORS_ORIGIN)
NEXT_PUBLIC_API_URL=https://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
EOF

chown ec2-user:ec2-user "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# ── 5. ECR login ──────────────────────────────────────────────────────────────
AWS_ACCOUNT=$(aws sts get-caller-identity --region "$REGION" --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Save ECR registry for deploy scripts
echo "ECR_REGISTRY=$ECR_REGISTRY" >> /home/ec2-user/.ec2-env
chown ec2-user:ec2-user /home/ec2-user/.ec2-env

# ── 6. Write docker-compose.yml ───────────────────────────────────────────────
cat > "$APP_DIR/docker-compose.yml" <<COMPOSE
version: '3.9'
services:
  api:
    image: ${ECR_REGISTRY}/dsasheet-api:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - "3001:3001"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    image: ${ECR_REGISTRY}/dsasheet-web:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - api
COMPOSE

chown ec2-user:ec2-user "$APP_DIR/docker-compose.yml"

# ── 7. Enable Nginx ───────────────────────────────────────────────────────────
# Nginx config will be deployed by CI/CD pipeline (scp from repo)
# For now, write a basic placeholder that proxies to the apps
cat > /etc/nginx/conf.d/dsasheet.conf <<'NGINX'
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

systemctl enable nginx
systemctl start nginx

# ── 8. ECR auto-refresh cron (so docker pull works after token expiry) ────────
cat > /etc/cron.d/ecr-login <<CRON
0 */6 * * * ec2-user aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
CRON

echo "=== Bootstrap complete — server ready for first CI/CD deployment ==="
