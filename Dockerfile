# builder
FROM node:10-alpine as builder
WORKDIR /opt/cah-backend
COPY . .
RUN npm install
RUN npm run build:dist

# prod
FROM node:10-alpine AS prod
WORKDIR /opt/cah-backend
COPY --from=builder /opt/cah-backend/dist ./dist
COPY package* ./
RUN npm install --production
ENV PORT 80
ENV HOST 0.0.0.0
CMD npm run start:prod