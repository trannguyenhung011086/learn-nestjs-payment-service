FROM node:14-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY src/ src/

RUN npm run build

RUN rm -r src

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
