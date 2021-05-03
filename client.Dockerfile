FROM node:latest

COPY client/ /client/

WORKDIR /client 

ARG API
ENV API=$API

RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]