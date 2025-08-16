#!/bin/bash

# SignalSpot Flutter 앱 환경변수 설정 스크립트

echo "🚀 SignalSpot 환경변수 설정"
echo "============================="

# .env 파일이 존재하는지 확인
if [ ! -f ".env" ]; then
    echo "📄 .env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다."
    echo ""
    echo "⚠️  .env 파일을 편집하여 실제 API 키를 입력해주세요:"
    echo "   - KAKAO_NATIVE_APP_KEY=실제_네이티브_키"
    echo "   - KAKAO_JAVASCRIPT_KEY=실제_자바스크립트_키"
    echo ""
else
    echo "✅ .env 파일이 이미 존재합니다."
fi

# .env 파일에서 환경변수 읽기
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "📋 현재 환경변수:"
    echo "   - KAKAO_NATIVE_APP_KEY: ${KAKAO_NATIVE_APP_KEY:-'설정되지 않음'}"
    echo "   - KAKAO_JAVASCRIPT_KEY: ${KAKAO_JAVASCRIPT_KEY:-'설정되지 않음'}"
    echo "   - API_BASE_URL: ${API_BASE_URL:-'설정되지 않음'}"
    echo ""
fi

echo "🛠️  Flutter 앱 실행 방법:"
echo "   1. 터미널에서 다음 명령어로 환경변수 로드:"
echo "      source setup_env.sh"
echo "   2. Flutter 앱 실행:"
echo "      flutter run"
echo ""
echo "⚡ 또는 한 번에 실행:"
echo "   source setup_env.sh && flutter run"