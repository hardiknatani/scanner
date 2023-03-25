const express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs');
var  https = require('https');
var CloudmersiveBarcodeapiClient = require('cloudmersive-barcodeapi-client');
const cors = require('cors')
const app = express();


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

    var defaultClient = CloudmersiveBarcodeapiClient.ApiClient.instance;
    
    // Configure API key authorization: Apikey
    var Apikey = defaultClient.authentications['Apikey'];
    Apikey.apiKey = '0615b6f5-a989-417b-8f86-55c707a6402e';
    
    var apiInstance = new CloudmersiveBarcodeapiClient.BarcodeScanApi();
        
    
    var callback = function(error, data, response) {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error")
      } else {
                console.log(data)
        if(data.Successful==true){
                res.send(data.RawText)
            }  else if(data.Successful==false){
                res.send("Invalid Image, Please Try again");
            }    
}
    };
    apiInstance.barcodeScanImage(imageBuffer, callback);




})


var server = https.createServer(options, app).listen(6003, async (req, res) => {
    console.log('server started on port 6003');
});
