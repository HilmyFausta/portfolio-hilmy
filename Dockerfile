FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/index.html /usr/share/nginx/html/index.html
COPY dist/project.html /usr/share/nginx/html/project.html
COPY dist/assets/ /usr/share/nginx/html/assets/

EXPOSE 8080