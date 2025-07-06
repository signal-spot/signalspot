# React Native Mobile App Build Environment
FROM node:18-alpine AS base

# Install system dependencies for React Native
RUN apk add --no-cache \
    bash \
    git \
    curl \
    wget \
    python3 \
    make \
    g++ \
    openjdk11-jre \
    unzip

# Install Android SDK
FROM base AS android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/cmdline-tools/latest/bin

RUN mkdir -p ${ANDROID_HOME} && \
    cd ${ANDROID_HOME} && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip && \
    unzip commandlinetools-linux-8512546_latest.zip && \
    rm commandlinetools-linux-8512546_latest.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# React Native build stage
FROM android-sdk AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY shared/package.json ./shared/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Android APK
RUN cd apps/frontend && \
    npx react-native build-android --mode=release

# Final stage - extract APK
FROM alpine:latest AS apk-extractor
WORKDIR /output
COPY --from=builder /app/apps/frontend/android/app/build/outputs/apk/release/*.apk ./

# For development - Metro bundler
FROM base AS metro-dev
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY shared/package.json ./shared/
RUN npm ci

# Copy source code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start Metro bundler
CMD ["npx", "react-native", "start", "--reset-cache"]

# Production web server
FROM nginx:alpine AS web-runner
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 