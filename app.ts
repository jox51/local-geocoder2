import express, { Request, Response } from 'express';
import cors from 'cors';
import geocoder, { PointsEntry } from './index.js';

type SearchCriteria = {
  name: string;
  admin1Code?: string;
  countryCode?: string;
};

const app = express();
let isGeocodeInitialized = false;

app.use(cors());

app.get('/healthcheck', function (req, res) {
  res.status(200).send('OK');
});

app.get('/deep-healthcheck', function (req, res) {
  if (isGeocodeInitialized) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('Not ready yet.');
  }
});

app.get('/reverse-geocode', function (req, res) {
  if (!isGeocodeInitialized) {
    res.status(503).send('Not ready yet.');
    return;
  }

  const lat = req.query.latitude || false;
  const lon = req.query.longitude || false;
  const maxResults = +(req.query.maxResults || 1);

  const points: Array<PointsEntry> = [];
  if (Array.isArray(lat) && Array.isArray(lon)) {
    if (
      lat.length !== lon.length ||
      lat.some((entry) => typeof entry !== 'string') ||
      lon.some((entry) => typeof entry !== 'string')
    ) {
      res.status(400).send('Bad Request');
      return;
    }

    for (let i = 0, lenI = lat.length; i < lenI; i++) {
      points[i] = { latitude: lat[i] as string, longitude: lon[i] as string };
    }
  } else {
    if (typeof lat !== 'string' || typeof lon !== 'string') {
      res.status(400).send('Bad Request');
      return;
    }

    points.push({ latitude: lat, longitude: lon });
  }

  geocoder.reverseLookup(points, maxResults, function (err, addresses) {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.send(addresses);
  });
});

app.get('/geocode', function (req: Request, res: Response) {
  if (!isGeocodeInitialized) {
    res.status(503).send('Not ready yet.');
    return;
  }

  const location = req.query.location;
  const maxResults = +(req.query.maxResults || 1);

  console.log('Location query:', location);

  if (!location) {
    res.status(400).send('Bad Request');
    return;
  }

  const terms: Array<string> = [];
  if (Array.isArray(location)) {
    // Handle array of locations
    if (location.length === 0) {
      res.status(400).send('Bad Request');
      return;
    }
    for (let i = 0, lenI = location.length; i < lenI; i++) {
      if (typeof location[i] === 'string') {
        terms[i] = location[i] as string;
      }
    }
  } else {
    // Handle single location
    const locationStr = String(location);
    if (locationStr.length === 0) {
      res.status(400).send('Bad Request');
      return;
    }

    terms.push(locationStr);
  }

  // Split the first term into parts for processing
  const parts = terms[0].split(',').map((part) => part.trim());

  // Create the search criteria object
  let searchCriteria: SearchCriteria = { name: parts[0] };

  if (parts.length === 2) {
    searchCriteria = {
      ...searchCriteria,
      admin1Code: parts[1].toUpperCase(),
    };
  } else if (parts.length === 3) {
    searchCriteria = {
      ...searchCriteria,
      admin1Code: parts[1].toUpperCase(),
      countryCode: parts[2].toUpperCase(),
    };
  }

  console.log('Search criteria:', searchCriteria);

  geocoder.lookup(terms, maxResults, function (err, addresses) {
    if (err) {
      console.error('Lookup error:', err);
      res.status(500).send(err);
      return;
    }
    res.send(addresses);
  });
});

const port = Number(process.env.PORT || 5636);
app.listen(port, function () {
  console.log('Local reverse geocoder listening on port ' + port);
  console.log('Initializing Geocoder…');
  console.log(
    '(This may take a long time and will download ~2.29GB worth of data by default.)'
  );

  geocoder.init(
    {
      citiesFileOverride: 'cities500',
      load: {
        admin1: true,
        admin2: true,
        admin3And4: true,
        alternateNames: true,
      },
      countries: [],
    },
    function () {
      console.log('Geocoder initialized and ready.');
      console.log('Endpoints:');
      console.log(`- http://localhost:${port}/healthcheck`);
      console.log(`- http://localhost:${port}/deep-healthcheck`);
      console.log(`- http://localhost:${port}/reverse-geocode`);
      console.log(`- http://localhost:${port}/geocode`);
      console.log('Examples:');
      console.log(
        `- http://localhost:${port}/reverse-geocode?latitude=54.6875248&longitude=9.7617254`,
        `- http://localhost:${port}/geocode?location=London`
      );
      isGeocodeInitialized = true;
    }
  );
});
