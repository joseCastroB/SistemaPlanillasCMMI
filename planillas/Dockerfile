# Etapa 1: Construcción
FROM gradle:jdk17 AS build
WORKDIR /app
COPY . .
# Ejecutamos la construcción del JAR omitiendo los tests para ganar velocidad
RUN gradle bootJar --no-daemon

# Etapa 2: Ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copiamos el archivo JAR generado en la etapa anterior
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]