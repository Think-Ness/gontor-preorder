const fs = require('fs');
const d3 = require('d3-geo');
const geojson = require('../public/indonesia-geojson.json');

// 1. Setup projection
const projection = d3.geoMercator().fitSize([900, 420], geojson);
const pathGenerator = d3.geoPath().projection(projection);

// 2. Map paths
const paths = geojson.features.map(feature => {
    return pathGenerator(feature);
});

// 3. 38 Provinces coordinates (Longitude, Latitude)
const PROVINCES = {
    'Aceh': [96.7, 4.7],
    'Sumatera Utara': [99.1, 2.1],
    'Sumatera Barat': [100.3, -0.7],
    'Riau': [101.5, 0.5],
    'Kepulauan Riau': [104.2, 3.9],
    'Jambi': [102.4, -1.6],
    'Bengkulu': [102.3, -3.8],
    'Sumatera Selatan': [104.0, -3.3],
    'Lampung': [105.2, -4.6],
    'Bangka Belitung': [106.5, -2.7],
    'DKI Jakarta': [106.8, -6.2],
    'Jawa Barat': [107.6, -7.0],
    'Banten': [106.1, -6.4],
    'Jawa Tengah': [110.2, -7.2],
    'DI Yogyakarta': [110.4, -7.8],
    'Jawa Timur': [112.5, -7.5],
    'Bali': [115.1, -8.3],
    'Nusa Tenggara Barat': [117.4, -8.7],
    'Nusa Tenggara Timur': [121.5, -9.0],
    'Kalimantan Barat': [109.5, 0.1],
    'Kalimantan Tengah': [113.5, -2.0],
    'Kalimantan Selatan': [115.5, -3.0],
    'Kalimantan Timur': [116.4, 1.0],
    'Kalimantan Utara': [116.8, 3.1],
    'Sulawesi Utara': [124.8, 0.7],
    'Gorontalo': [122.4, 0.7],
    'Sulawesi Tengah': [121.0, -1.4],
    'Sulawesi Barat': [119.5, -2.8],
    'Sulawesi Selatan': [120.0, -3.7],
    'Sulawesi Tenggara': [122.5, -4.0],
    'Maluku Utara': [127.8, 1.5],
    'Maluku': [130.0, -3.2],
    'Papua Barat': [133.2, -1.3],
    'Papua Barat Daya': [132.0, -3.0],
    'Papua Pegunungan': [138.0, -4.5],
    'Papua Selatan': [137.0, -7.0],
    'Papua Tengah': [135.5, -4.0],
    'Papua': [138.5, -4.0],
};

// Map each province to its [x, y] coordinates in the SVG using D3 projection
const provinceCoords = {};
for (const [name, [lon, lat]] of Object.entries(PROVINCES)) {
    const [x, y] = projection([lon, lat]);
    provinceCoords[name] = [Math.round(x), Math.round(y)];
}

const output = `// Auto-generated from GeoJSON using d3-geo

export const INDONESIA_ISLAND_PATHS = ${JSON.stringify(paths, null, 2)};

export const PROVINCE_COORDS: Record<string, [number, number]> = ${JSON.stringify(provinceCoords, null, 2)};

export const PROVINCES_LIST = Object.keys(PROVINCE_COORDS).sort();
`;

fs.writeFileSync('./src/components/public/IndonesiaMapData.ts', output);
console.log('Successfully generated IndonesiaMapData.ts');
