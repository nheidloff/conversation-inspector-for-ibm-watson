FROM node:latest

ADD . /client-watson-conversation

WORKDIR /client-watson-conversation
RUN npm install
RUN npm install typings

expose 3000

CMD ["npm", "start"]
