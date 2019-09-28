FROM node:10-alpine

WORKDIR /opt/cah-backend

ENV PORT 80
ENV HOST 0.0.0.0

COPY . .

RUN npm install

CMD npm run prod