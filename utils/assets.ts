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

async function tester() {
  console.log(await getInfo("SUI"));
} //getPrices("ALT");

//console.log(getAssetID("SUI"));

tester();

let example = {
  action: {
    twap: { a: 97, b: true, m: 10, r: false, s: "1290", t: false },
    type: "twapOrder",
  },
  isFrontend: true,
  nonce: 1712068799842,
  signature: {
    r: "0xf115941ec825efa46005d75c18705d0f96ce47ac375199d727c83c758f19b536",
    s: "0x20af2f3faf9f26076fb1159565241b3109c1bf7b993aa9be0912900436b2c2ae",
    v: 27,
  },
  vaultAddress: "0x2ef7f47942a299f0cd1b1c40f85eea4e6b49b6a7",
};
