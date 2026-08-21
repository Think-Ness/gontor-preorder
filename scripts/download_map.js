const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.topojson';
const file = fs.createWriteStream('./public/indonesia-topo.json');

https.get(url, function(response) {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log('Download complete.');
    });
  } else {
    console.error('Failed to download: ' + response.statusCode);
    
    // Fallback URL if first fails
    const fallbackUrl = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/indonesia/indonesia-provinces.json';
    const fallbackFile = fs.createWriteStream('./public/indonesia-topo.json');
    https.get(fallbackUrl, (res) => {
        if (res.statusCode === 200) {
            res.pipe(fallbackFile);
            fallbackFile.on('finish', () => console.log('Fallback download complete.'));
        } else {
            console.error('Fallback failed too: ' + res.statusCode);
        }
    });
  }
}).on('error', function(err) {
  fs.unlink('./public/indonesia-topo.json', () => {});
  console.error('Error: ' + err.message);
});
