FROM node:10.15-jessie
ARG NPM_TOKEN
WORKDIR /app
COPY . ./
RUN yarn
RUN yarn build
EXPOSE 80
CMD yarn serve
