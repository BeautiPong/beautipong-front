# /bin/sh

# 인증서 정보 설정
COUNTRY="KR" # 국가 코드
STATE="Seoul" # 주/도
LOCALITY="Gangnam-gu" # 시/구/군
ORGANIZATION="42 Seoul" # 조직 이름
ORG_UNIT="IT Department" # 조직 단위 이름
COMMON_NAME="example.com" # 일반 이름 (도메인 이름)
EMAIL="admin@example.com" # 이메일 주소

# openssl req -new -x509 -key /etc/nginx/ssl/myserver.key -out /etc/nginx/ssl/myserver.crt -days 365 \
# -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORG_UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL"

openssl req -new -x509 -nodes -keyout /etc/nginx/ssl/myserver.key -out /etc/nginx/ssl/myserver.crt -days 365 \
-subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORG_UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL"

exec "$@"
