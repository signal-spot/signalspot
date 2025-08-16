-- 전체 시그널 스팟 수
SELECT COUNT(*) AS total_spots FROM signal_spots;

-- 활성 상태 스팟 수
SELECT COUNT(*) AS active_spots FROM signal_spots WHERE is_active = true;

-- status가 ACTIVE인 스팟 수
SELECT COUNT(*) AS status_active_spots FROM signal_spots WHERE status = 'ACTIVE';

-- 만료되지 않은 스팟 수
SELECT COUNT(*) AS not_expired_spots FROM signal_spots WHERE expires_at > NOW();

-- 24시간 내 생성된 스팟 수
SELECT COUNT(*) AS recent_spots FROM signal_spots 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 트렌딩 조건을 모두 만족하는 스팟 수
SELECT COUNT(*) AS trending_eligible FROM signal_spots 
WHERE status = 'ACTIVE' 
  AND expires_at > NOW() 
  AND created_at >= NOW() - INTERVAL '24 hours';

-- 트렌딩 조건을 만족하는 스팟 상세 (상위 5개)
SELECT 
  id,
  content,
  status,
  is_active,
  like_count,
  reply_count,
  share_count,
  created_at,
  expires_at,
  (like_count * 2 + reply_count * 3 + share_count * 4) AS engagement_score,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 AS hours_old
FROM signal_spots 
WHERE status = 'ACTIVE' 
  AND expires_at > NOW() 
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY engagement_score DESC
LIMIT 5;

-- 전체 스팟 중 상위 인기 스팟 (제한 없이)
SELECT 
  id,
  content,
  status,
  is_active,
  like_count,
  reply_count,
  share_count,
  created_at,
  expires_at
FROM signal_spots 
ORDER BY like_count DESC, reply_count DESC, share_count DESC
LIMIT 10;