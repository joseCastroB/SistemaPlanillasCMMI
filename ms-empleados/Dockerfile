# Usamos una imagen ligera de Node.js
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar el caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install --production

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que configuramos en Express
EXPOSE 3001

# Comando para arrancar el servicio
CMD ["node", "index.js"]