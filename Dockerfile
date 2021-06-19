FROM loadimpact/k6:latest AS k6official
FROM node:15.12.0-alpine3.13
COPY --from=k6official /usr/bin/k6 /usr/bin/k6
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]