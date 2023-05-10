
FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./
RUN npm install

COPY . .

EXPOSE 3001

ENV NODE_ENV production

CMD ["npm", "start"]