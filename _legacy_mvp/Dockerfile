# Usamos una imagen ligera de Nginx
FROM nginx:alpine

# Copiamos los archivos estáticos de la aplicación al directorio por defecto de Nginx
COPY . /usr/share/nginx/html

# Exponemos el puerto 80 del contenedor (el puerto interno de nginx)
EXPOSE 80
