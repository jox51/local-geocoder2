const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function downloadGeonamesData(dataPath) {
  console.log('Starting Geonames data download...');

  const downloads = [
    {
      name: 'admin1CodesASCII.txt',
      url: 'http://download.geonames.org/export/dump/admin1CodesASCII.txt',
      dir: 'admin1_codes'
    },
    {
      name: 'admin2Codes.txt',
      url: 'http://download.geonames.org/export/dump/admin2Codes.txt',
      dir: 'admin2_codes'
    },
    {
      name: 'allCountries.zip',
      url: 'http://download.geonames.org/export/dump/allCountries.zip',
      dir: 'all_countries'
    },
    {
      name: 'alternateNames.zip',
      url: 'http://download.geonames.org/export/dump/alternateNames.zip',
      dir: 'alternate_names'
    },
    {
      name: 'cities500.zip',
      url: 'http://download.geonames.org/export/dump/cities500.zip',
      dir: 'cities'
    }
  ];

  for (const download of downloads) {
    const dir = path.join(dataPath, download.dir);
    const filePath = path.join(dir, download.name);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading ${download.name}...`);
    await execAsync(`curl -L -o ${filePath} ${download.url}`);

    if (download.name.endsWith('.zip')) {
      console.log(`Extracting ${download.name}...`);
      await execAsync(`cd ${dir} && unzip -o ${download.name} && rm ${download.name}`);
    }
  }

  console.log('Geonames data download complete!');
}

module.exports = {
  downloadGeonamesData
};
