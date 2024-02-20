FROM node:21
WORKDIR /usr/src/app

RUN apt-get update \
&&  apt-get install -y --no-install-suggests --no-install-recommends \
    git \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxtst6 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    libdrm2 \
    libgbm \
&&  apt-get clean \
&&  rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm ci --verbose \
&&  npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
