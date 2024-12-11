FROM node:20-alpine

LABEL maintainer="Your Name"
LABEL description="Local Geocoder API Service"

WORKDIR /app

RUN apk add --no-cache \
    curl \
    unzip \
    jq \
    && rm -rf /var/cache/apk/*

RUN mkdir -p \
    /app/geonames_dump/admin1_codes \
    /app/geonames_dump/admin2_codes \
    /app/geonames_dump/all_countries \
    /app/geonames_dump/alternate_names \
    /app/geonames_dump/cities

COPY package*.json ./

# Install dependencies
RUN npm install express cors dotenv && \
    npm install --production

COPY . .

ENV NODE_ENV=production \
    PORT=5636 \
    HOST=0.0.0.0 \
    NODE_OPTIONS=--max-old-space-size=4096 \
    DOWNLOAD_GEONAMES=true \
    GEONAMES_DATA_PATH=/app/geonames_dump

EXPOSE 5636

CMD ["node", "app.js"]

