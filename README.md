# Local Geocoder

This library provides a local geocoder for Node.js that is based on
[GeoNames](https://download.geonames.org/export/dump/) data. It is _local_ in
the sense that there are no calls to a remote service like the
[Google Maps API](https://developers.google.com/maps/documentation/javascript/geocoding#ReverseGeocoding),
and in consequence the gecoder is suitable for batch geocoding. It allows to do reverse lookup and by name lookup.

_Reverse lookup_ in the sense that you give it a (list of) point(s), _i.e._, a
latitude/longitude pair, and it returns the closest city to that point.
_By name lookup_ in the sense that you give it a (list of) terms, _i.e._, a
city name, and it returns the closest city match.

## Fork changes
- `lookUp()` was renamed to `reverseLookup()`
- Added `lookup()` method that executes a search by given term/name
- `/geocode` API now uses `lookup()` to search by term
- `/reverse-geocode` API uses `reverseLookup()` to search by latitude/longitude pair
## Installation

```bash
$ npm install local-geocoder
```

Or, with Yarn:

```bash
$ yarn add local-geocoder
```

## Docker

For usage with [Docker](https://www.docker.com/), a Dockerfile is available in
this project. It caches all the required files from GeoNames.

To build and run it:

```bash
$ docker build -t local-geocoder .
$ docker run -it -e PORT=3000 --rm local-geocoder
```

Or pull and run it:

```bash
$ docker run -it -e PORT=3000 --rm ghcr.io/tomayac/local-geocoder
```

## Usage in Node.js

### Init

You must initialize the geocoder prior to the first call to `lookUp()`. This
ensures that all files are loaded into the cache prior to making the first call.

```javascript
var geocoder = require('local-geocoder');

geocoder.init({}, function () {
  // geocoder is loaded and ready to run
});
```

Optionally `init()` also allows you to specify which files to load data from.
This reduces initialization time and the runtime memory footprint of the Node.js
process. By default, all files are loaded.

```javascript
var geocoder = require('local-geocoder');

geocoder.init(
  {
    citiesFileOverride: 'cities500', // one of 'cities500', 'cities1000', 'cities5000', 'cities15000' or null to keep the default city database (cities1000)
    load: {
      admin1: true,
      admin2: false,
      admin3And4: false,
      alternateNames: false,
    },
  },
  function () {
    // Ready to call lookUp
  }
);
```

Optionally `init()` allows you to specify the directory that GeoNames files are
downloaded and cached in, and a specific cities database to be used.

```javascript
var geocoder = require('local-geocoder');

geocoder.init({ dumpDirectory: '/tmp/geonames' }, function () {
  // Ready to call lookUp and all files will be downloaded to /tmp/geonames
});
```

### Look Up

```javascript
var geocoder = require('local-geocoder');

// With just one point
var point = { latitude: 42.083333, longitude: 3.1 };
geocoder.lookUp(point, function (err, res) {
  console.log(JSON.stringify(res, null, 2));
});

// In batch mode with many points
var points = [
  { latitude: 42.083333, longitude: 3.1 },
  { latitude: 48.466667, longitude: 9.133333 },
];
geocoder.lookUp(points, function (err, res) {
  console.log(JSON.stringify(res, null, 2));
});

// How many results to display at max
var maxResults = 5;

// With just one point
var point = { latitude: 42.083333, longitude: 3.1 };
geocoder.lookUp(point, maxResults, function (err, res) {
  console.log(JSON.stringify(res, null, 2));
});

// In batch mode with many points
var points = [
  { latitude: 42.083333, longitude: 3.1 },
  { latitude: 48.466667, longitude: 9.133333 },
];
geocoder.lookUp(points, maxResults, function (err, res) {
  console.log(JSON.stringify(res, null, 2));
});
```

## Usage of the Web Service

You can use the built-in Web service by running `node app.js` as follows.

```bash
$ curl "http://localhost:3000/geocode?latitude=48.466667&longitude=9.133333&latitude=42.083333&longitude=3.1&maxResults=2"
```

## Result Format

An output array that maps each point in the input array (or input object
converted to a single-element array) to the `maxResults` closest addresses.

The measurement units are used
[as defined by GeoNames](http://www.geonames.org/export/web-services.html), for
example, `elevation` is measured in meters. The `distance` value is dynamically
calculated based on the
[haversine distance](http://www.movable-type.co.uk/scripts/latlong.html) for the
input point(s) to each of the particular results points and is measured in
kilometers.

```javascript
[
  [
    {
      geoNameId: '2919146',
      name: 'Gomaringen',
      asciiName: 'Gomaringen',
      alternateNames: null,
      latitude: '48.45349',
      longitude: '9.09582',
      featureClass: 'P',
      featureCode: 'PPLA4',
      countryCode: 'DE',
      cc2: null,
      admin1Code: {
        name: 'Baden-Württemberg',
        asciiName: 'Baden-Wuerttemberg',
        geoNameId: '2953481',
      },
      admin2Code: {
        name: 'Tübingen Region',
        asciiName: 'Tuebingen Region',
        geoNameId: '3214106',
      },
      admin3Code: {
        name: 'Landkreis Tübingen',
        asciiName: 'Landkreis Tubingen',
        geoNameId: '2820859',
      },
      admin4Code: {
        name: 'Gomaringen',
        asciiName: 'Gomaringen',
        geoNameId: '6555939',
      },
      population: '8400',
      elevation: null,
      dem: '430',
      timezone: 'Europe/Berlin',
      modificationDate: '2011-04-25',
      alternateName: {
        de: {
          altName: 'Gomaringen',
          isPreferredName: true,
          isShortName: false,
          isColloquial: false,
          isHistoric: false,
        },
      },
      distance: 3.1302317076079285,
    },
    {
      geoNameId: '2814195',
      name: 'Wannweil',
      asciiName: 'Wannweil',
      alternateNames: null,
      latitude: '48.51667',
      longitude: '9.15',
      featureClass: 'P',
      featureCode: 'PPLA4',
      countryCode: 'DE',
      cc2: null,
      admin1Code: {
        name: 'Baden-Württemberg',
        asciiName: 'Baden-Wuerttemberg',
        geoNameId: '2953481',
      },
      admin2Code: {
        name: 'Tübingen Region',
        asciiName: 'Tuebingen Region',
        geoNameId: '3214106',
      },
      admin3Code: {
        name: 'Landkreis Reutlingen',
        asciiName: 'Landkreis Reutlingen',
        geoNameId: '3220792',
      },
      admin4Code: {
        name: 'Wannweil',
        asciiName: 'Wannweil',
        geoNameId: '6555933',
      },
      population: '5092',
      elevation: null,
      dem: '320',
      timezone: 'Europe/Berlin',
      modificationDate: '2011-04-25',
      distance: 5.694122211376861,
    },
  ],
  [
    {
      geoNameId: '3130634',
      name: 'Albons',
      asciiName: 'Albons',
      alternateNames: null,
      latitude: '42.10389',
      longitude: '3.08433',
      featureClass: 'P',
      featureCode: 'PPLA3',
      countryCode: 'ES',
      cc2: null,
      admin1Code: {
        name: 'Catalonia',
        asciiName: 'Catalonia',
        geoNameId: '3336901',
      },
      admin2Code: {
        name: 'Província de Girona',
        asciiName: 'Provincia de Girona',
        geoNameId: '6355230',
      },
      admin3Code: {
        name: 'Albons',
        asciiName: 'Albons',
        geoNameId: '6534005',
      },
      admin4Code: null,
      population: '558',
      elevation: '13',
      dem: '18',
      timezone: 'Europe/Madrid',
      modificationDate: '2012-03-04',
      distance: 2.626176210836868,
    },
    {
      geoNameId: '3118799',
      name: "la Tallada d'Empordà",
      asciiName: "la Tallada d'Emporda",
      alternateNames:
        "La Tallada,la Tallada,la Tallada d'Emporda,la Tallada d'Empordà",
      latitude: '42.0802',
      longitude: '3.05583',
      featureClass: 'P',
      featureCode: 'PPLA3',
      countryCode: 'ES',
      cc2: null,
      admin1Code: {
        name: 'Catalonia',
        asciiName: 'Catalonia',
        geoNameId: '3336901',
      },
      admin2Code: {
        name: 'Província de Girona',
        asciiName: 'Provincia de Girona',
        geoNameId: '6355230',
      },
      admin3Code: {
        name: "la Tallada d'Empordà",
        asciiName: "la Tallada d'Emporda",
        geoNameId: '6534150',
      },
      admin4Code: null,
      population: '0',
      elevation: null,
      dem: '16',
      timezone: 'Europe/Madrid',
      modificationDate: '2012-03-04',
      distance: 3.6618561653699846,
    },
  ],
];
```

## A Word on Accuracy

By design, _i.e._, due to the granularity of the available
[GeoNames data](http://download.geonames.org/export/dump/cities1000.zip), this
reverse geocoder is limited to city-level, so no streets or house numbers. In
many cases this is already sufficient, but obviously your actual mileage may
vary. If you need street-level granularity, you are better off with a service
like Google's
[reverse geocoding API](https://developers.google.com/maps/documentation/javascript/geocoding#ReverseGeocoding).
(Full disclosure: the author is currently employed by Google.)

## A Word on Initialization Speed

The initial lookup takes quite a while, as the geocoder has to download roughly
2GB(!) of data that it then caches locally (unzipped, this occupies about 1.3GB
of disk space). All follow-up requests are lightning fast.

### Downloading specific sets of countries

To reduce the time taken to initialize the data, you can manually configure it
to only download a specific set of countries from GeoNames. Do note that when
you add a country code into the array, it will disable the geocoder from
downloading all ~2.29GB(!) worth of data and only load the specified countries'
data. If you want to re-enable the geocoder to download all data, the countries
array needs to be empty.

#### Example of getting data for individual country

```javascript
const geocoder = require('local-geocoder');
geocoder.init(
  {
    load: {
      admin1: true,
      admin2: true,
      admin3And4: true,
      alternateNames: true,
    },
    // Comma-separated list of country codes. An empty array means all countries.
    countries: ['SG', 'AU'],
  },
  function () {
    // Ready to call lookUp
  }
);
```

### Post-install script

There's also the option of downloading the GeoNames files via a post-install
script.
The script is invoked automatically after installation, but won't download any
files without getting at least one of the init options in an env variable.
The options should be specified with a `GEOCODER_POSTINSTALL_` prefix.

#### Example of downloading the files via the post-install script

```js
export GEOCODER_POSTINSTALL_DUMP_DIRECTORY=/usr/src/app
export GEOCODER_POSTINSTALL_ADMIN1=true
export GEOCODER_POSTINSTALL_ADMIN2=true
export GEOCODER_POSTINSTALL_COUNTRIES=SG,AU
npm install local-geocoder

// As long as the app is started within the same day
// and uses the same options, the init call won't download any files.
```

## A Word on Data Freshness

By default, the local [GeoNames dump](http://download.geonames.org/export/dump/)
data gets refreshed each day, creating files such as
`admin1CodesASCII_YYYY-MM-DD.txt` in the cache directory. If you wish to reuse
the existing downloaded files, you can rename them to remove the date, such as
`admin1CodesASCII.txt`, which will suppress the download. If you don't
need admin1, admin2, admin3, admin4 or alternate names, you can turn them off in
a manual init call and decrease load time.

## A Word on Memory Usage

If you run into a
`FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`
issue, try running node with the
[V8 option](https://github.com/nodejs/node/issues/7937)
`--max-old-space-size=2000`.

## A Word on Debugging

To turn on debug logging add a DEBUG=local-geocoder environment variable
on the command line.

## License

Copyright 2017 Thomas Steiner (tomac@google.com)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

## Acknowledgements

This project was inspired by Richard Penman's Python
[reverse geocoder](https://github.com/richardpenman/reverse_geocode/). It uses
Ubilabs'
[k-d-tree implementation](https://github.com/ubilabs/kd-tree-javascript) that
was ported to Node.js by [Luke Arduini](https://github.com/luk-/node-kdt).

## Contributors

- [@chriskinsman](https://github.com/chriskinsman)
- [@bloodfire91](https://github.com/bloodfire91)
- [@yjwong](https://github.com/yjwong)
- [@RDIL](https://github.com/RDIL)
- [@tkafka](https://github.com/tkafka)
- [@helloitsm3](https://github.com/helloitsm3)

[![npm](https://nodei.co/npm/local-geocoder.png?downloads=true)](https://nodei.co/npm/local-geocoder/)
