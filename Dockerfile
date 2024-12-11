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

# Copy all files needed for installation
COPY package*.json ./
COPY postinstall.js ./
COPY index.js ./

# Remove postinstall script temporarily
RUN cat package.json | \
    jq 'del(.scripts.postinstall)' > temp.json && \
    mv temp.json package.json

# Install ALL dependencies (including devDependencies where express is located)
RUN npm install && \
    npm install express cors --save

# Now copy the rest of the application
COPY . .

EXPOSE 5636

ENV NODE_ENV=production \
    PORT=5636 \
    HOST=0.0.0.0

CMD ["node", "app.js"]
