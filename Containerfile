FROM ghcr.io/electron/build:latest

COPY . .
RUN npm ci --verbose \
&&  npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
