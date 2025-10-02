# Use Node 20 LTS (Alpine)
FROM node:20-alpine

# Install required libs for Prisma + NestJS
RUN apk add --no-cache openssl libc6-compat bash

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install
# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build NestJS app
RUN yarn build

# Expose app port
EXPOSE 8000

# Start app
CMD ["node", "dist/main.js"]
