// import modules
import { Connection, Transaction, Keypair, PublicKey, SystemProgram, ComputeBudgetProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import fs from 'fs';
import mcbuild from './src/mcbuild.js';
import open from 'open';
import http from 'http';
import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

let port = 9000; // try 8444 for prod
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));


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

// usdc donation blink config
app.get('/router_get:id', (req, res) => {
    let obj = {}
    console.log("inside !!!")
    let id = req.params.id;

    

    obj.icon = "/upload/" + req.body.image;
    obj.title = req.body.title;
    obj.description = req.body.description;
    obj.links = {
        "actions": [
            {
                "label": "Send",
                "href": "https://localhost:8000/router_post/" + id ,
            }
        ]
    }
    res.send(JSON.stringify(obj));
});

// tnx
app.post('/router_post', async function (req, res) {


});

app.get("/actions.json", (req, res) => {
    const payload = {
        rules: [
            {
                "pathPattern": "/",
                "apiPath": "/"
            }
        ]
    }

    res.send(JSON.stringify(payload), { headers: ACTIONS_CORS_HEADERS });
});

