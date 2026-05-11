# === Build stage ===
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /build
COPY pom.xml .
COPY mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw
COPY src src
COPY libs ./libs
RUN ./mvnw clean package -DskipTests

# === Production stage ===
FROM eclipse-temurin:17-jre
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl procps \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r appgroup \
    && useradd -r -g appgroup -s /usr/sbin/nologin appuser
WORKDIR /app
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar
COPY --from=builder /build/libs ./libs

RUN chown -R appuser:appgroup /app
USER appuser

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health/readiness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -cp /app/app.jar:/app/libs/* org.springframework.boot.loader.launch.JarLauncher"]
