FROM node:22-alpine

WORKDIR /app

# Ensure correct permissions
RUN mkdir -p /app && chown -R node:node /app

# Non-root user
# USER node

# In development we map the volume, but we still want to be able to install packages.
# Start command will handle dev server.
CMD npm install && npm run dev -- --host 0.0.0.0
