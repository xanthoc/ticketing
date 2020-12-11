FROM node:12-alpine

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --only=prod
COPY . .

CMD ["npm", "start"]