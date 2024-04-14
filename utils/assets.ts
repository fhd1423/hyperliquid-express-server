import axios from "axios";
import dotenv from "dotenv";
import { Address } from "viem";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS as Address;

export const getAssetID = async (
  ticker: string
): Promise<number | undefined> => {
  try {
    let response = await axios.post(
      `https://api.hyperliquid.xyz/info`,
      { type: "meta" },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    let list = response.data.universe;

    for (let i = 0; i < list.length; i++) {
      const asset = list[i];
      if (asset.name == ticker) {
        return i;
      }
    }
  } catch (e) {
    console.log("Error:", e);
  }
  return undefined;
};

export const getPrices = async (
  ticker: string
): Promise<number | undefined> => {
  try {
    let response = await axios.post(
      `https://api.hyperliquid.xyz/info`,
      { type: "allMids" },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    let list = response.data;
    return list[ticker];
  } catch (e) {
    console.log("Error:", e);
  }
  return undefined;
};

export const getPosition = async (ticker: string) => {
  let response = await axios.post(
    `https://api.hyperliquid.xyz/info`,
    {
      type: "clearinghouseState",
      user: "0x2ef7f47942a299f0cd1b1c40f85eea4e6b49b6a7",
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  let positions = response.data.assetPositions;
  for (let i = 0; i < positions.length; i++) {
    if (positions[i].position.coin === ticker)
      return parseFloat(positions[i].position.szi);
  }
  return undefined;
};

export const getInfo = async (ticker: string): Promise<number | undefined> => {
  try {
    let response = await axios.post(
      `https://api.hyperliquid.xyz/info`,
      { type: "meta" },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    for (let x of response.data.universe) if (x.name === ticker) return x;
    return response.data;
  } catch (e) {
    console.log("Error:", e);
  }
  return undefined;
};

export const getExistingPosition = async (ticker: string) => {
  let response = await axios.post(
    `https://api.hyperliquid.xyz/info`,
    {
      type: "clearinghouseState",
      user: VAULT_ADDRESS,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  console.log(response.data.assetPositions);

  let positions = response.data.assetPositions;
  return positions.some((position: any) => position.position.coin === ticker);
};

export const getUnfilledOrders = async () => {
  let response = await axios.post(
    `https://api.hyperliquid.xyz/info`,
    {
      type: "openOrders",
      user: VAULT_ADDRESS,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;

  /* [
  {
    coin: 'OP',
    limitPx: '3.134',
    oid: 16683615901,
    origSz: '1595.0',
    side: 'B',
    sz: '1595.0',
    timestamp: 1712233444969
  }
] */
};

async function tester() {
  console.log(await getUnfilledOrders());
}

tester();
