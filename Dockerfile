FROM node:20-alpine AS build
WORKDIR /app


COPY apps/react-vite/package*.json ./apps/react-vite/

WORKDIR /app/apps/react-vite
RUN npm install --ignore-scripts  # --ignore-scripts bỏ qua prepare script

# Copy source code react-vite
COPY apps/react-vite/ .

# Build react-vite
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/apps/react-vite/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
