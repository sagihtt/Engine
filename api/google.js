const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.text({ limit: "10mb" }));

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY ausente no .env");
}

app.post("/get", (req, res) => {
  const keys = Object.keys(req.query);

  if (keys.length !== 1) {
    return res.status(401).send("Query inválida");
  }

  const hashRecebido = keys[0];

  if (hashRecebido !== API_KEY) {
    return res.status(401).send("Chave inválida");
  }
  if (!req.body) {
    return res.status(400).send("Arquivo vazio");
  }

  console.log("Arquivo recebido:", req.body.length, "bytes");

  // NOVO CAMINHO: Sobe uma pasta (..) e entra em /data/arquivo.txt
  const caminhoDestino = path.join(__dirname, "..", "data", "registros.txt");

  fs.writeFile(
    caminhoDestino,
    req.body,
    { encoding: "utf8" },
    (err) => {
      if (err) {
        console.error("Erro ao salvar o arquivo:", err);
        return res.status(500).send("Erro ao salvar");
      }
      res.send("Recebido");
    }
  );
});

app.listen(3001, () => {
  console.log("API - Google Script | Online na porta 3001");
});
