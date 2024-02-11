import axios from "axios";

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

//getPrices("ALT");

//console.log(getAssetID("SUI"));
