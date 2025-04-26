# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . /usr/src/app

# Start development server
CMD ["npm", "start"]
