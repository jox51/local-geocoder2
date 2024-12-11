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

RUN cat package.json | \
    jq '.dependencies = (.dependencies + .devDependencies) | del(.devDependencies)' > temp.json && \
    mv temp.json package.json

RUN npm install --production=false

COPY . .

EXPOSE 5636

ENV NODE_ENV=production \
    PORT=5636 \
    HOST=0.0.0.0 \
    NODE_OPTIONS="--max-old-space-size=4096"

CMD ["node", "app.js"]

