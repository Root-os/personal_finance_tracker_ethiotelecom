FROM node:20-alpine

WORKDIR /app

# Install build dependencies if needed (e.g. for bcrypt)
RUN apk add --no-available --no-cache make gcc g++ python3

COPY package*.json ./

RUN npm install

COPY . .

# Ensure scripts are executable
RUN chmod +x scripts/*.js || true

EXPOSE 5000

CMD ["npm", "start"]
