FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY libs ./libs
COPY src ./src
RUN mvn -q -Dmaven.test.skip=true package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
# Needed at runtime because org.vechain:devkit is a vendored systemPath jar
COPY --from=build /app/libs ./libs

EXPOSE 8080
ENTRYPOINT ["java", "-cp", "/app/app.jar:/app/libs/*", "org.springframework.boot.loader.launch.JarLauncher"]
