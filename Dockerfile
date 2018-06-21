FROM node:9.11.2-alpine

ENV HUB_PORT=80

ADD . /interdb-hub
WORKDIR /interdb-hub

RUN npm install --production

CMD ["npm", "start", "--prefix /interdb-hub"]