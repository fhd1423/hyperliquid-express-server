// src/index.js
import express, { Express, Request, Response } from "express";
import { main } from "./marketOrder";
import { getPrices } from "../utils/assets";
import { getAssetID } from "../utils/assets";

const app: Express = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/", async (req: Request, res: Response) => {
  console.log(req.body);
  let ticker;
  if (req.body.ticker.includes("USDT"))
    ticker = req.body.ticker.replace("USDT", "");
  else return;

  if (req.body.type == "buy") {
    let assetID = await getAssetID(ticker);
    let buyPrice = await getPrices(ticker);
    if (!assetID || !buyPrice) {
      console.error("Error fetching assetId and price");
      res.status(500).send({ error: "Could not fetch assetID or buyPrice" });
      return;
    }
    buyPrice = parseFloat((buyPrice * 1.2).toFixed(4));
    try {
      await main(assetID, true, buyPrice, Math.floor(1000 / buyPrice));
    } catch (e) {
      console.log("caught error, retrying");
      await main(assetID, true, buyPrice, Math.floor(1000 / buyPrice));
    }
  }
  if (req.body.type == "sell") {
    let assetID = await getAssetID(ticker);
    let sellPrice = await getPrices(ticker);
    if (!assetID || !sellPrice) {
      console.error("Error fetching assetId and price");
      res.status(500).send({ error: "Could not fetch assetID or sellPrice" });
      return;
    }
    sellPrice = parseFloat((sellPrice * 0.8).toFixed(4));
    try {
      await main(assetID, false, sellPrice, Math.floor(1000 / sellPrice));
    } catch (e) {
      console.log("caught error, retrying");
      await main(assetID, false, sellPrice, Math.floor(1000 / sellPrice));
    }
  }
  res.send("Recived alert");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
