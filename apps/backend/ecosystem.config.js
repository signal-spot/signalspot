module.exports = {
  apps: [
    {
      name: 'signalspot-api',
      script: 'dist/main.js',
      instances: 'max', // 또는 특정 숫자 (예: 2, 4)
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // 환경변수
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // 프로덕션 환경변수 (pm2 start ecosystem.config.js --env production)
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        
        // Database
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'postgres',
        DB_DATABASE: 'signalspot',
        // DB_PASSWORD는 .env.production에서 관리
        
        // Redis
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        // REDIS_PASSWORD는 .env.production에서 관리
        
        // JWT
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        
        // AWS S3
        AWS_REGION: 'ap-northeast-2',
        
        // 기타 설정
        CORS_ORIGIN: 'https://lettie-dating.co.kr',
        API_BASE_URL: 'https://lettie-dating.co.kr/signalspot',
      },
      
      // 로깅 설정
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 클러스터 모드 설정
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      
      // 헬스체크 설정
      health_check: {
        interval: 30000,
        timeout: 5000,
      },
      
      // 성능 모니터링
      instance_var: 'INSTANCE_ID',
      
      // Graceful shutdown
      wait_ready: true,
      
      // 재시작 전략
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
      
      // CPU 사용률 모니터링
      max_cpu_restart: '90',
      
      // 프로세스 신호 처리
      shutdown_with_message: true,
      
      // Node.js 옵션
      node_args: '--max-old-space-size=2048',
    },
  ],

  // 배포 설정 (선택사항)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'YOUR_EC2_IP',
      ref: 'origin/main',
      repo: 'https://github.com/signal-spot/signalspot.git',
      path: '/home/ubuntu/signalspot',
      'pre-deploy': 'git pull',
      'post-deploy': 'cd apps/backend && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no',
    },
  },
};