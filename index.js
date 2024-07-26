const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const url = require('url');
const Buffer = require('buffer').Buffer;
import mcbuild from './src/mcbuild.js';

const app = express();
const port = 8000;

// Enable CORS
app.use(cors());

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

app.post("/roter_post/:encoded", async function (req, res) {

  const json = Buffer.from(req.params.encoded, "base64").toString();
  const decoded = JSON.parse(json);


  const MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // usdc mint address
  const TO_WALLET = new PublicKey(decoded.wallet);
  const SOLANA_CONNECTION = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const FROM_WALLET = new PublicKey(req.body.account);
  const lamportsToSend = 10;

  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toKeypair.publicKey,
      lamports: lamportsToSend,
    })
  );

  await transferTransaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true },
      ],
      data: Buffer.from("Data to send in transaction", "utf-8"),
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    })
  );

  // check if the recipient wallet needs a usdc ata
  let createATA = false;
  await splToken.getAccount(SOLANA_CONNECTION, toTokenAccount, 'confirmed', splToken.TOKEN_PROGRAM_ID)
    .then(function (response) { createATA = false; })
    .catch(function (error) {
      if (error.name == "TokenAccountNotFoundError") { createATA = true }
      else { return; }
    });


  // build transaction
  let _tx_ = {};
  _tx_.rpc = "https://api.devnet.solana.com";
  _tx_.account = req.body.account;
  _tx_.instructions = instructions;
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
