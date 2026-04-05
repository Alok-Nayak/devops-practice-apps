FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && cp -r src/public dist/public
EXPOSE 3000
CMD ["npm", "start"]
