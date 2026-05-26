# SereneMind AI - Deployment Guide

## Production Deployment

### Prerequisites
- Docker & Docker Compose installed
- PostgreSQL 14+
- API Keys: OpenAI, Murf, Gemini

### Option 1: Docker Compose (Recommended)

#### 1. Prepare Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with production values
nano .env

# Required variables:
DATABASE_URL=postgresql://user:password@postgres:5432/serene_mind_db
JWT_SECRET_KEY=your-production-secret-key-min-32-chars
OPENAI_API_KEY=sk-...
MURF_API_KEY=...
FRONTEND_URL=https://yourdomain.com
```

#### 2. Build & Deploy
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 3. Database Initialization
```bash
# Create database tables
docker-compose exec backend python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"
```

### Option 2: Vercel (Frontend Only)

#### 1. Connect Repository
- Sign up at [vercel.com](https://vercel.com)
- Connect your GitHub repository
- Select `/frontend` as root directory

#### 2. Set Environment Variables
In Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=SereneMind AI
```

#### 3. Deploy
```bash
vercel deploy --prod
```

### Option 3: Railway / Render (Backend)

#### Railway Setup
1. Create account at [railway.app](https://railway.app)
2. Create PostgreSQL service
3. Create Python service
4. Connect repository
5. Set environment variables
6. Deploy

#### Render Setup
1. Create account at [render.com](https://render.com)
2. Create PostgreSQL service
3. Create Python Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Deploy

### Option 4: AWS Deployment

#### ECS + RDS Setup
```bash
# Create RDS database
aws rds create-db-instance \
  --db-instance-identifier serene-mind-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password

# Push Docker image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag serene-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/serene-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/serene-backend:latest

# Deploy to ECS via CloudFormation or CDK
```

### Option 5: Self-Hosted VPS

#### Ubuntu 22.04 Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <repository-url>
cd MURF

# Start services
docker-compose up -d

# Setup Nginx reverse proxy
sudo apt install nginx -y

# Configure Nginx for HTTPS
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d yourdomain.com
sudo systemctl restart nginx
```

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Set strong `JWT_SECRET_KEY` (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring & alerting
- [ ] Regular security updates
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose config
```

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Clear cache
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 📊 Monitoring

### Logging
- Docker logs: `docker-compose logs -f`
- Application logs: Check `/var/log/serene-mind/`

### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusCake

### Performance Monitoring
- New Relic
- Datadog
- AWS CloudWatch

## 🔄 Backup Strategy

### Database Backups
```bash
# Daily backup
0 2 * * * pg_dump serene_mind_db | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Store in S3
aws s3 sync /backups s3://serene-mind-backups/
```

## 🚀 Scaling

### Load Balancing
- nginx load balancer
- AWS ELB
- HAProxy

### Caching
- Redis for sessions
- Cloudflare CDN
- Browser caching

### Database Optimization
- Connection pooling
- Query optimization
- Index creation
- Read replicas

## 📝 Post-Deployment

1. Setup monitoring dashboard
2. Configure automated backups
3. Setup alerting
4. Document deployment procedures
5. Create runbooks for common issues
6. Train team on deployment process
7. Regular security audits

## 🆘 Support

For deployment issues:
1. Check logs: `docker-compose logs [service]`
2. Verify environment variables
3. Test connectivity
4. Review documentation
5. Contact support team
