-- PostGIS Extension 활성화
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 기본 스키마 생성
CREATE SCHEMA IF NOT EXISTS signalspot;

-- 성능 최적화를 위한 인덱스 설정
-- 위치 기반 쿼리 성능 향상
CREATE INDEX IF NOT EXISTS idx_signal_spot_location 
ON signal_spot USING GIST (ST_MakePoint(longitude, latitude));

-- 텍스트 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_signal_spot_message_trgm
ON signal_spot USING GIN (message gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_signal_spot_title_trgm
ON signal_spot USING GIN (title gin_trgm_ops);

-- 시간 기반 쿼리 성능 향상
CREATE INDEX IF NOT EXISTS idx_signal_spot_created_at
ON signal_spot (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signal_spot_expires_at
ON signal_spot (expires_at) WHERE expires_at IS NOT NULL;

-- 사용자별 쿼리 성능 향상
CREATE INDEX IF NOT EXISTS idx_signal_spot_creator_id
ON signal_spot (creator_id);

-- Spark 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_spark_location
ON sparks USING GIST (ST_MakePoint(longitude, latitude));

CREATE INDEX IF NOT EXISTS idx_spark_users
ON sparks (user1_id, user2_id);

CREATE INDEX IF NOT EXISTS idx_spark_status
ON sparks (status) WHERE status = 'pending';

-- 알림 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_user_read
ON notification (user_id, is_read) WHERE is_read = false;

-- 기본 데이터베이스 설정
ALTER DATABASE signalspot SET timezone TO 'Asia/Seoul';

-- 연결 풀 최적화 설정
ALTER DATABASE signalspot SET max_connections = 200;
ALTER DATABASE signalspot SET shared_buffers = '256MB';
ALTER DATABASE signalspot SET effective_cache_size = '1GB';
ALTER DATABASE signalspot SET maintenance_work_mem = '64MB';
ALTER DATABASE signalspot SET work_mem = '4MB';

-- 쿼리 최적화 설정
ALTER DATABASE signalspot SET random_page_cost = 1.1;
ALTER DATABASE signalspot SET effective_io_concurrency = 200;

-- 로깅 설정 (프로덕션에서는 필요시 조정)
ALTER DATABASE signalspot SET log_statement = 'mod';
ALTER DATABASE signalspot SET log_duration = on;
ALTER DATABASE signalspot SET log_min_duration_statement = 100;

GRANT ALL PRIVILEGES ON DATABASE signalspot TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA signalspot TO postgres;