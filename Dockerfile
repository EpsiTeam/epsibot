# syntax=docker/dockerfile:1
FROM node:16.14.2-alpine

# Setting the workspace
WORKDIR /app

# Setting ENV
ENV NODE_ENV production

# Installing dependencies
COPY package.json package-lock.json .
RUN npm ci --only=production

# Copying the executables
COPY ormconfig.json .
COPY built ./built

# Running migrations
RUN npm run migrate

CMD ["npm", "run", "start:builded"]
