# Use an official Node.js runtime as the parent image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV NODE_ENV production

# Run app.js when the container launches
CMD ["npm", "start"]