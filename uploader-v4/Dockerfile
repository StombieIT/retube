FROM gradle:8.5.0-jdk17 AS builder

WORKDIR /app

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle

RUN chmod +x gradlew

RUN ./gradlew dependencies --no-daemon || return 0

COPY . .

RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
