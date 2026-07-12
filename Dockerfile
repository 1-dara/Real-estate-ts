# Use official Node.js image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3002

# Start the app
CMD ["npm", "start"]
