# Nginx 이미지를 베이스로 사용
FROM nginx:latest

# SSL 디렉토리 생성
RUN mkdir -p /etc/nginx/ssl

# Nginx 설정 파일을 컨테이너에 복사
COPY nginx.conf /etc/nginx/nginx.conf

COPY nginx.sh /usr/local/bin/nginx.sh
RUN chmod +x /usr/local/bin/nginx.sh

# 정적 파일을 컨테이너에 복사
COPY . /usr/share/nginx/html

ENTRYPOINT ["/bin/sh", "/usr/local/bin/nginx.sh"]
CMD ["nginx", "-g", "daemon off;"]

