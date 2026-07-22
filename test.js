const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({path: '.env.local'});
fetch('https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=sewon', {
    headers: {
        'key': process.env.RAJAONGKIR_API_KEY
    }
}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d, null, 2))).catch(console.error);
