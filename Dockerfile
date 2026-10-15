# ==========================================
# Multi-Stage Dockerfile for SurGuess
# Builds React Frontend + Spring Boot Backend into a Single Self-Contained Image
# ==========================================

# Stage 1: Build React/Vite Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Package Spring Boot Backend with embedded Frontend static files
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
# Cache dependencies
RUN mvn dependency:go-offline -B || true
COPY backend/src ./src/
# Copy Vite distribution into Spring Boot resources/static
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Lightweight Runtime Image for Heroku Dyno
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/surguess-backend-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Xmx400m -jar app.jar"]
