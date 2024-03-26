import express, { Express, Request, Response } from "express";
import { main } from "./marketOrder";
import { getPosition, getPrices } from "../utils/assets";
import { getAssetID } from "../utils/assets";

const app: Express = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let activeTickers: string[] = [];
let DIRECTION: "LONG" | "SHORT" = "SHORT";
let TRADE_AMOUNT = 5000;

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
    try {
      activeTickers.push(ticker);
      if (type == "buy") {
        await executeTrade(ticker, true);
      } else {
        await executeTrade(ticker, false);
      }
      res.send("Recived alert");
    } catch (e) {
      res.send("Error executing trade");
      console.log(e);
    }
  }
  if (type == "long" || type == "short") {
    await closeAllPositions();
    DIRECTION = type.toUpperCase() as "LONG" | "SHORT";
    res.send("Closed all positions and flipped to " + DIRECTION);
  }

  if (type == "amount") {
    TRADE_AMOUNT = Number(req.body.amount);
    res.send("Set trade amount to " + TRADE_AMOUNT);
  }

  if (type == "close") {
    await closeAllPositions();
    res.send("Closed all positions");
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const executeTrade = async (ticker: string, isBuy: boolean) => {
  const assetID = await getAssetID(ticker);
  const price = await getPrices(ticker);
  if (!assetID || !price) {
    console.error("Error fetching assetId and price");
    return;
  }

  const multiplier = isBuy ? 1.05 : 0.95;
  const currentSize = await getPosition(ticker);

  const isLong = DIRECTION === "LONG";
  const isShort = DIRECTION === "SHORT";

  // already long
  if (isLong && currentSize && currentSize > 0 && isBuy) return;

  // already short
  if (isShort && currentSize && currentSize < 0 && !isBuy) return;

  // new short when long only
  if (isLong && !currentSize && !isBuy) return;

  // new long when short only
  if (isShort && !currentSize && isBuy) return;

  const flipDirection =
    (isLong && currentSize && currentSize > 0 && !isBuy) ||
    (isShort && currentSize && currentSize < 0 && isBuy);

  const tradeSize = flipDirection
    ? Math.abs(currentSize ?? 0)
    : Math.floor(TRADE_AMOUNT / price);

  await main(assetID, isBuy, formatNumber(price, multiplier), tradeSize);
};

function formatNumber(price: number, multiplier: number) {
  let result = price * multiplier;

  let resultStr = result.toString();

  let decimalPos = resultStr.indexOf(".");

  if (decimalPos === -1) {
    let significantResult = Number(result.toPrecision(5));
    return significantResult;
  } else {
    let integerPart = resultStr.substring(0, decimalPos);
    let significantFigures = integerPart.length;

    if (significantFigures >= 5) {
      return Math.round(result);
    } else {
      let allowedDecimals = 5 - significantFigures;
      allowedDecimals = Math.min(allowedDecimals, 5);
      let formattedResult = result.toFixed(allowedDecimals);
      return parseFloat(formattedResult);
    }
  }
}

const closeAllPositions = async () => {
  for (let activeTicker of activeTickers) {
    DIRECTION == "LONG"
      ? await executeTrade(activeTicker, false)
      : await executeTrade(activeTicker, true);
  }
};
