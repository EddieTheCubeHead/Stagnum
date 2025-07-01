FROM node:24-alpine3.21 as build

ARG VITE_BACKEND_URL
ARG VITE_FRONTEND_URL

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}

WORKDIR /app
COPY . /app

RUN yarn
RUN yarn build

FROM ubuntu as serve
RUN apt-get update
RUN apt-get install nginx -y
COPY --from=build /app/dist /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]