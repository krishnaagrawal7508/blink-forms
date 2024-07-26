
import express from "express";
import cors from "cors";
import Buffer from "buffer";
import mcbuild from './views/mcbuild.js';
import path from 'path';
import { fileURLToPath } from 'url';

// const Buffer = require('buffer').Buffer;


const app = express();
const port = 8000;

// Enable CORS
app.use(cors());

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
app.use(express.static(__dirname + "uploads"));

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
  res.send("Server is UP!");
})

app.get('/router_get/:encoded', (req, res) => {
  let name = "";
  let obj = {}

  const json = Buffer.from(req.params.encoded, "base64").toString();
  const decoded = JSON.parse(json)

  let id = decoded.id;

  const imageUrl = "https://i.postimg.cc/c4rhZ2Vx/Blink-Forms-sq.png";
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
        "href": "https://blink-forms.vercel.app/router_post/" + req.params.encoded,
        "parameters": convertedFields
      }
    ]
  }

  res.send(JSON.stringify(obj));
});

app.post("/router_post/:encoded", async function (req, res) {

  const json = Buffer.from(req.params.encoded, "base64").toString();
  const decoded = JSON.parse(json);


  const TO_WALLET = new PublicKey(decoded.wallet);
  const SOLANA_CONNECTION = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const FROM_WALLET = new PublicKey(req.body.account);
  const lamportsToSend = 10;

  // const transferTransaction = new Transaction().add(
  //   SystemProgram.transfer({
  //     fromPubkey: FROM_WALLET,
  //     toPubkey: TO_WALLET,
  //     lamports: lamportsToSend,
  //   })
  // );

  // await transferTransaction.add(
  //   new TransactionInstruction({
  //     keys: [
  //       { pubkey: FROM_WALLET, isSigner: true, isWritable: true },
  //     ],
  //     data: Buffer.from("Data to send in transaction", "utf-8"),
  //     programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  //   })
  // );

  let donateIx = SystemProgram.transfer({fromPubkey:FROM_WALLET, lamports:lamportsToSend, toPubkey:TO_WALLET});


  // build transaction
  let _tx_ = {};
  _tx_.rpc = "https://api.devnet.solana.com";
  _tx_.account = FROM_WALLET;
  _tx_.instructions = [ donateIx ];
  _tx_.signers = false;
  _tx_.serialize = true;
  _tx_.encode = true;
  _tx_.table = false;
  _tx_.tolerance = 1.2;
  _tx_.compute = false;
  _tx_.fees = false;
  _tx_.priority = req.query.priority;
  let tx = await mcbuild.tx(_tx_);
  console.log(tx);

});

app.get("/actions.json", (req, res) => {
  if (server_host == "https://blink-forms.vercel.app/") {
    let rules = {
      "rules": [{
        "pathPattern": "/spl/*",
        "apiPath": "https://blink-forms.vercel.app/"
      }]
    };
    res.send(JSON.stringify(rules), { headers: ACTIONS_CORS_HEADERS });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
