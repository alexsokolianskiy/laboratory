FROM node:18

WORKDIR /app

COPY client/package.json /app/

RUN npm install

COPY client /app

CMD ["npm", "run", "dev"]