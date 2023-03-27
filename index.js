const express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs');
var  https = require('https');
const cors = require('cors')
const app = express();
const path = require('path')
const Barcode = require('aspose-barcode-cloud-node');

const config = new Barcode.Configuration(
"bad8dbe2-6fec-4286-8892-018609ac81e9",
"65438a072888a5f25be5d6e00a80b81e"
);
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
    const tempFilePath = path.join('./temp-image.jpg'); // use any suitable temporary file path
    fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
    const api = new Barcode.BarcodeApi(config);

    async function recognizeBarcode(api, fileName) {
        const request = new Barcode.PostBarcodeRecognizeFromUrlOrContentRequest();
        request.image = fs.readFileSync(fileName);
        request.type = Barcode.DecodeBarcodeType.Code128;
        request.preset = Barcode.PresetType.HighPerformance;
        request.fastScanOnly = false;
    
        const result = await api.postBarcodeRecognizeFromUrlOrContent(request);
    
        return result.body.barcodes;
    }
    
    recognizeBarcode(api,path.resolve(tempFilePath)).then(barcodes => {
        // console.log('Recognized barcodes are:');
        // console.log(barcodes);
        res.send(barcodes[0]);
        fs.unlink(path.resolve(tempFilePath), (err => {
            if (err) console.log(err);
            else {
              console.log("Deleted file successfully");
            }
          }));    })
        .catch(err => {
        console.error(JSON.stringify(err, null, 2));
        res.send(err)
        });


})


var server = https.createServer(options, app).listen(6003, async (req, res) => {
    console.log('server started on port 6003');
});
