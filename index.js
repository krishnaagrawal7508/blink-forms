
import express from "express";
import cors from "cors";
import Buffer from "buffer";
import mcbuild from './views/mcbuild.js';
import path from 'path';
import { fileURLToPath } from 'url';
import * as splToken from "@solana/spl-token";

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

  const json = Buffer.Buffer.from(req.params.encoded, "base64").toString();
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

  const json = Buffer.Buffer.from(req.params.encoded, "base64").toString();
  const decoded = JSON.parse(json);


  // const TO_WALLET = new PublicKey(decoded.wallet);
  // const SOLANA_CONNECTION = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  // const FROM_WALLET = new PublicKey(req.body.account);
  // const lamportsToSend = 10;

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

  const decimals = 6; // usdc has 6 decimals
  const MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // usdc mint address
  const TO_WALLET = new PublicKey(decoded.wallet); // treasury wallet

  // connect : convert value to fractional units
  const SOLANA_CONNECTION = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const FROM_WALLET = new PublicKey(req.body.account);
  let amount = parseFloat(1);
  amount = amount.toFixed(decimals);
  const TRANSFER_AMOUNT = amount * Math.pow(10, decimals);

  // usdc token account of sender
  let fromTokenAccount = await splToken.getAssociatedTokenAddress(
    MINT_ADDRESS,
    FROM_WALLET,
    false,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // check if the recipient wallet is oncurve
  let oncurve = true;
  if (PublicKey.isOnCurve(TO_WALLET.toString())) { oncurve = false; }
  console.log("oncurve:", oncurve);

  // usdc token account of recipient
  let toTokenAccount = null;
  toTokenAccount = await splToken.getAssociatedTokenAddress(
    MINT_ADDRESS,
    TO_WALLET,
    oncurve,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // check if the recipient wallet needs a usdc ata
  let createATA = false;
  await splToken.getAccount(SOLANA_CONNECTION, toTokenAccount, 'confirmed', splToken.TOKEN_PROGRAM_ID)
    .then(function (response) { createATA = false; })
    .catch(function (error) {
      if (error.name == "TokenAccountNotFoundError") { createATA = true }
      else { return; }
    });

  // create new instructions array
  let instructions = [];

  // create and add recipient ata instructions to array if needed
  if (createATA === true) {
    let createATAiX = new splToken.createAssociatedTokenAccountInstruction(
      FROM_WALLET,
      toTokenAccount,
      TO_WALLET,
      MINT_ADDRESS,
      splToken.TOKEN_PROGRAM_ID,
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );
    instructions.push(createATAiX);
  }

  // create and add the usdc transfer instructions
  let transferInstruction = splToken.createTransferInstruction(fromTokenAccount, toTokenAccount, FROM_WALLET, TRANSFER_AMOUNT);
  instructions.push(transferInstruction);

  // build transaction
  let _tx_ = {};
  _tx_.rpc = "https://api.mainnet-beta.solana.com";
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

  res.send(JSON.stringify(tx), {headers: ACTIONS_CORS_HEADERS});

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
