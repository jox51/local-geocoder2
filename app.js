'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const geocoder = require('./index.js');
const { countryMappings, stateMappings } = require('./mappings');
const { downloadGeonamesData } = require('./utils/downloadGeonames');

let isGeocodeInitialized = false;

// Helper function to check if data exists
function checkGeonamesDataExists(dataPath) {
  const requiredFiles = [
    'admin1_codes/admin1CodesASCII.txt',
    'admin2_codes/admin2Codes.txt',
    'all_countries/allCountries.txt',
    'alternate_names/alternateNames.txt',
    'cities/cities500.txt'
  ];

  return requiredFiles.every(file => 
    fs.existsSync(path.join(dataPath, file))
  );
}

// Initialize function
async function initializeGeocoder() {
  console.log('Initializing Geocoder…');

  try {
    if (process.env.DOWNLOAD_GEONAMES === 'true') {
      console.log('Starting Geonames data download...');
      await downloadGeonamesData(
        process.env.GEONAMES_DATA_PATH || '/app/geonames_dump'
      );
      console.log('Geonames data download complete!');
    }

    // Initialize geocoder with the data - with reduced data loading
    return new Promise((resolve, reject) => {
      geocoder.init(
        {
          dumpDirectory: process.env.GEONAMES_DATA_PATH || '/app/geonames_dump',
          load: {
            admin1: true,
            admin2: true,
            admin3And4: false,  // Reduce memory usage
            alternateNames: false  // Reduce memory usage
          },
          countries: process.env.GEOCODER_COUNTRIES?.split(',') || [] // Limit to specific countries if needed
        },
        function(err) {
          if (err) {
            console.error('Failed to initialize geocoder:', err);
            reject(err);
            return;
          }
          isGeocodeInitialized = true;
          console.log('Geocoder initialized successfully!');
          resolve();
        }
      );
    });
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

app.use(cors());

app.get('/healthcheck', function (req, res) {
  return res.status(200).send('OK');
});

app.get('/deep-healthcheck', function (req, res) {
  if (isGeocodeInitialized) {
    return res.status(200).send('OK');
  } else {
    return res.status(503).send('Not ready yet.');
  }
});

app.get('/reverse-geocode', function (req, res) {
  if (!isGeocodeInitialized) {
    return res.status(503).send('Not ready yet.');
  }

  var lat = req.query.latitude || false;
  var lon = req.query.longitude || false;
  var maxResults = req.query.maxResults || 1;
  if (!lat || !lon) {
    return res.status(400).send('Bad Request');
  }
  var points = [];
  if (Array.isArray(lat) && Array.isArray(lon)) {
    if (lat.length !== lon.length) {
      return res.status(400).send('Bad Request');
    }
    for (var i = 0, lenI = lat.length; i < lenI; i++) {
      points[i] = { latitude: lat[i], longitude: lon[i] };
    }
  } else {
    points[0] = { latitude: lat, longitude: lon };
  }
  geocoder.reverseLookup(points, maxResults, function (err, addresses) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.send(addresses);
  });
});

app.get('/geocode', function (req, res) {
  if (!isGeocodeInitialized) {
    res.status(503).send('Not ready yet.');
    return;
  }

  const location = req.query.location || '';
  const maxResults = Number(req.query.maxResults || 1);

  console.log('Location query:', location);

  if (!location) {
    res.status(400).send('Bad Request');
    return;
  }

  // Split the location string into parts
  const parts = location.split(',').map((part) => part.trim());

  // Helper function to convert country names to codes
  const getCountryCode = (country) => {
    return countryMappings[country.toLowerCase()] || country.toUpperCase();
  };

  // Helper function to convert state names to codes
  const getStateCode = (state) => {
    return stateMappings[state.toLowerCase()] || state.toUpperCase();
  };

  // Create the search criteria object based on number of parts
  let searchCriteria = { name: parts[0] };

  if (parts.length === 2) {
    // Check if second part is a country or state
    const secondPart = parts[1].toLowerCase();
    if (countryMappings[secondPart]) {
      searchCriteria.countryCode = getCountryCode(parts[1]);
    } else {
      searchCriteria.admin1Code = getStateCode(parts[1]);
    }
  } else if (parts.length === 3) {
    searchCriteria.admin1Code = getStateCode(parts[1]);
    searchCriteria.countryCode = getCountryCode(parts[2]);
  }

  console.log('Search criteria:', searchCriteria);

  geocoder.lookup(searchCriteria, maxResults, function (err, addresses) {
    if (err) {
      console.error('Lookup error:', err);
      res.status(500).send(err);
      return;
    }
    res.send(addresses);
  });
});

// Start the server and initialize
const PORT = process.env.PORT || 5636;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  initializeGeocoder();
});
