const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');

const { insertFile, list, remove, getById } = require('./controllers/record');
const { connect } = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());

exports.tcc_functions = functions.region('southamerica-east1').https.onRequest(async (req, res) => {
  await connect(process.env.MONGO_DB);
  app.post('/insert-file', insertFile);
  app.get('/records', list);
  app.get('/records/:id', getById);
  app.delete('/records/:id', remove);

  return app(req, res);
});
