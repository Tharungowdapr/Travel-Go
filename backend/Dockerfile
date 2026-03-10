# How its going to run
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

#env variables
ENV PORT=5000
EXPOSE 5000


# Start the application
CMD ["npm", "start"]