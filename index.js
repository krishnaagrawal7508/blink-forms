const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const url = require('url');
const Buffer = require('buffer').Buffer;

const app = express();
const port = 8000;

// Enable CORS
app.use(cors());

app.use("/uploads", express.static("uploads"))

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Encoding, Accept-Encoding');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Content-Encoding', 'compress');
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.options("/*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

app.get('/', (req, res) => {
  res.send("Working");
})

app.get('/router_get/:encoded', (req, res) => {
  let name = "";
  let obj = {}

  const json = Buffer.from(req.params.encoded, "base64").toString();
  const decoded = JSON.parse(json)

  let id = decoded.id;

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = new url.URL('/uploads/BlinkForms_sq.png', baseUrl).toString();
  console.log(imageUrl);
  obj.icon = imageUrl;

  obj.title = decoded.title;
  obj.description = decoded.description;

  const fields = decoded.fields;
  console.log(fields)

  const address = decoded.wallet;
  console.log(address);

  const convertedFields = fields.map(field => ({
    name: field.value,
    label: field.value
  }));

  console.log(convertedFields)

  console.log("here!!")

  obj.links = {
    "actions": [
      {
        "label": "Send",
        "href": "http://localhost:8000/router_post/" + address,
        "parameters": convertedFields
      }
    ]
  }

  res.send(JSON.stringify(obj));
});

app.post("/roter_post/:address", (req, res) => {

})

app.get("/actions.json", (req, res) => {
  if (server_host == "http://localhost:8000/") {
    let rules = {
      "rules": [{
        "pathPattern": "/spl/*",
        "apiPath": "http://localhost:8000/"
      }]
    };
    res.send(JSON.stringify(rules), { headers: ACTIONS_CORS_HEADERS });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
