const fs = require('fs');
const d3 = require('d3-geo');

const geojson = require('../public/indonesia-geojson.json');

// Fit the map into a 900x420 SVG
const projection = d3.geoMercator().fitSize([900, 420], geojson);
const pathGenerator = d3.geoPath().projection(projection);

const paths = geojson.features.map(feature => {
    return {
        name: feature.properties.Propinsi || feature.properties.NAME_1 || feature.properties.name,
        d: pathGenerator(feature)
    };
});

const output = `export const INDONESIA_PATHS = ${JSON.stringify(paths, null, 2)};`;
fs.writeFileSync('./src/components/public/IndonesiaMapPaths.ts', output);
console.log('Successfully generated IndonesiaMapPaths.ts');
