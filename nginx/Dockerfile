FROM nginx:1.27-alpine

# Remove the default site so only our configuration applies (avoids 404 for /health)
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom reverse proxy configuration
COPY conf.d /etc/nginx/conf.d

# Healthcheck is defined in docker-compose.
