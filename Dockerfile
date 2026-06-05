# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite app into static assets ----
FROM node:22-alpine AS build
WORKDIR /app

# Install against the committed lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# API base URL is inlined into the bundle by Vite at build time.
# Default targets the backend's host-published port: the SPA runs in the user's
# browser on the host, so it reaches the backend via localhost:5001 (the published
# port), not over the compose network. No backend contract is touched.
ARG VITE_API_URL=http://localhost:5001
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ---- Serve stage: static files behind nginx with SPA fallback ----
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# nginx:alpine already runs `nginx -g 'daemon off;'` as its default CMD
