
import express from "express";
import cors from "cors";
import Buffer from "buffer";
import path from 'path';
import { fileURLToPath } from 'url';
import { PublicKey, Connection, Transaction, TransactionInstruction, ComputeBudgetProgram, clusterApiUrl, } from "@solana/web3.js";
// import { SystemProgram } from "@solana/web3.js";
import { ACTIONS_CORS_HEADERS, MEMO_PROGRAM_ID, createPostResponse} from "@solana/actions";


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
        "href": "http://blink-forms.vercel.app/" + req.params.encoded,
        "parameters": convertedFields
      }
    ]
  }

  res.send(JSON.stringify(obj), { headers: ACTIONS_CORS_HEADERS });
});

app.post("/router_post/:encoded", async function (req, res) {

  const json = Buffer.Buffer.from(req.params.encoded, "base64").toString();
  const decoded = JSON.parse(json);


  let account;
  try {
    const body = await req.json();
    account = new PublicKey(body.account);
    console.log(account)
  } catch (err) {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  try {
    const transaction = new Transaction();
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("this is a simple memo message", "utf-8"),
        keys: [],
      })
    );

    transaction.feePayer = account;

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload = await createPostResponse({
      fields: {
        transaction,
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    return Response.json("An error occurred", { status: 400 });
  }
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
