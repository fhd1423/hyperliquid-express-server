// src/index.js
import express, { Express, Request, Response } from "express";
import { main } from "./marketOrder";
import { getPosition, getPrices } from "../utils/assets";
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

  const type = req.body.type;
  if (type == "buy" || type == "sell") {
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        if (type == "buy") {
          await executeBuy(ticker);
        } else {
          await executeSell(ticker);
        }
        console.log(`Operation succeeded on attempt ${attempt}`);
        break; // Break out of the loop on success
      } catch (e) {
        console.log(`Attempt ${attempt} failed`);
        if (attempt < 10) {
          // Wait for 60 seconds before the next attempt, but only if not on the last attempt
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
      }
    }
  }

  res.send("Recived alert");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const executeBuy = async (ticker: string) => {
  let assetID = await getAssetID(ticker);
  let buyPrice = await getPrices(ticker);
  if (!assetID || !buyPrice) {
    console.error("Error fetching assetId and price");
    return;
  }
  buyPrice = parseFloat((buyPrice * 1.02).toFixed(4));
  if (ticker == "APT") buyPrice = parseFloat((buyPrice * 0.98).toFixed(2));

  let currentSize = await getPosition(ticker);
  if (currentSize) return;

  await main(assetID, true, buyPrice, Math.floor(5000 / buyPrice));
};

const executeSell = async (ticker: string) => {
  let assetID = await getAssetID(ticker);
  let sellPrice = await getPrices(ticker);
  if (!assetID || !sellPrice) {
    console.error("Error fetching assetId and price");
    return;
  }
  sellPrice = parseFloat((sellPrice * 0.98).toFixed(4));
  if (ticker == "APT") sellPrice = parseFloat((sellPrice * 0.98).toFixed(2));
  let currentSize = await getPosition(ticker);
  if (!currentSize) return;

  await main(assetID, false, sellPrice, currentSize);
};
