const express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs');
var  https = require('https');
const cors = require('cors')
const app = express();
const DBR = require("dynamsoft-node-barcode");
DBR.BarcodeReader.license = 't0073oQAAABY7vfDu4Npf86Ja9h3GK3kmUwXPdZJC2uwHYYccxhJMt3L8ne2Pcufo/QcCySnjJnA7yGFtnVbMz9n/DIxz2RIA1WIiUA==';

var options = {
     key: fs.readFileSync('./ssl/code.key'),
     cert: fs.readFileSync('./ssl/code.crt'),
    };
    
app.use(function(req, res, next) {
        if (req.secure) {
            res.set({
                "X-Frame-Options": "SAMEORIGIN;",
                "X-Content-Type-Options": "nosniff",
                "X-XSS-Protection": "1; mode=block",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Content-Security-Policy": "script-src 'self'",
                "Content-Type": "application/json; charset=utf-8",
                "Strict-Transport-Security":"max-age=31536000; includeSubDomains; preload",
                "Referrer-Policy":"strict-origin; strict-origin-when-cross-origin;",
                "Permissions-Policy":"geolocation=(); midi=();notifications=();push=();sync-xhr=();accelerometer=(); gyroscope=(); magnetometer=(); payment=(); camera=(); microphone=();usb=(); xr=();speaker=(self);vibrate=();fullscreen=(self);"
              });
        }
        next();
        })

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}))
app.use(cors())

app.post('/scan', async (req, res) => {

    const { body } = req;

    const base64Image = body.data; // your base64-encoded image

    // remove data URL prefix and get only the base64-encoded string
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // create a buffer from the base64-encoded string
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const tempFilePath = './temp-image.jpg'; // use any suitable temporary file path
    fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));

    (async()=>{
        let reader = await DBR.BarcodeReader.createInstance();
        for(let result of await reader.decode(tempFilePath)){
            console.log(result.barcodeText);
        }
        reader.destroy();
        
        await DBR.BarcodeReader._dbrWorker.terminate();

    })();


})


var server = https.createServer(options, app).listen(6003, async (req, res) => {
    console.log('server started on port 6003');
});
