# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS go-builder
WORKDIR /monkey
COPY . /monkey
RUN go build -o monkey-server .

FROM maven:3.9-eclipse-temurin-21 AS java-builder
WORKDIR /monkey-api
COPY monkey-api/ /monkey-api/
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

ENV PORT=8080

COPY --from=go-builder /monkey/monkey-server /app/monkey-server
COPY --from=java-builder /monkey-api/target/monkey-api-0.0.1-SNAPSHOT.jar /app/app.jar

RUN chmod +x /app/monkey-server

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
