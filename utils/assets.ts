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

//getPrices("ALT");

//console.log(getAssetID("SUI"));
