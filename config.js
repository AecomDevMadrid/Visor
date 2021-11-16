
const path = require('path');
//console.log(__dirname+process.env.NODE_ENV);
//let ruta=path.resolve(__dirname, process.env.NODE_ENV + '.env')
//let ruta=path.resolve(__dirname, process.env.NODE_ENV+'.env');
let ruta=path.resolve('/.env');
//console.log(ruta)
const result=require('dotenv').config('C:/Users/gomezM2/Desktop/ADIF/Forge/Visor/.env');
//console.log(result.parsed)

module.exports = {

    NODE_ENV: process.env.NODE_ENV,
    credentials: {
        CLIENT_ID:process.env.CLIENT_ID,
        CLIENT_SECRET:process.env.CLIENT_SECRET,
        callback_url: process.env.CALLBACK_URL
    },
    scopes: {
        // Required scopes for the server-side application
        internal: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
        // Required scope for the client-side viewer
        public: ['viewables:read']
    },
    users:process.env.USERS

};
