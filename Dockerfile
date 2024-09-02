# Nginx 이미지를 베이스로 사용
FROM nginx:latest

# Nginx 설정 파일을 컨테이너에 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 정적 파일을 컨테이너에 복사
COPY . /usr/share/nginx/html