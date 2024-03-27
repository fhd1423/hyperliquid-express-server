import axios from "axios";
import { Address, Hex, keccak256, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS as Address;
if (!PRIVATE_KEY) throw new Error("Private Key not defined");
export const account = privateKeyToAccount(PRIVATE_KEY as Hex);
import { encodeAbiParameters, hexToSignature } from "viem";

const run = async (
  assetId: number,
  limitPx: number,
  size: number,
  nonce: number,
  signature: Hex,
  vaultAddress: Address,
  isBuy: boolean
) => {
  const action = {
    type: "order",
    grouping: "na",
    orders: [
      {
        a: assetId,
        b: isBuy,
        p: String(limitPx),
        s: String(size),
        r: false,
        t: { limit: { tif: "Gtc" } },
      },
    ],
  };

  let response = await axios.post(
    `https://api.hyperliquid.xyz/exchange`,
    {
      action,
      nonce,
      vaultAddress,
      signature: {
        ...hexToSignature(signature),
        v: Number(hexToSignature(signature).v),
      },
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.data.status || response.data.status !== "ok")
    throw new Error("Error executing trade");

  //console.log(JSON.stringify(action));
  //console.log(action.orders[0].p);
  //console.log(response.data);
  //console.log(response.data.response.data.statuses);
};

const generateSignature = async (
  assetId: number,
  isBuy: boolean,
  limitPx: number,
  size: number,
  vaultAddress: Address,
  nonce: number
): Promise<Hex | undefined> => {
  try {
    const signature = await account.signTypedData({
      domain: {
        chainId: 1337n,
        name: "Exchange",
        verifyingContract: "0x0000000000000000000000000000000000000000",
        version: "1",
      },
      types: {
        Agent: [
          { name: "source", type: "string" },
          { name: "connectionId", type: "bytes32" },
        ],
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
      },
      primaryType: "Agent",
      message: {
        source: "a", // b for testnet
        connectionId: createConnectionHash(
          assetId,
          isBuy,
          limitPx,
          size,
          vaultAddress,
          BigInt(nonce)
        ),
      },
    });
    return signature;
  } catch (e) {
    console.log(e);
  }
  return undefined;
};

export const main = async (
  assetId: number,
  isBuy: boolean,
  limitPx: number,
  size: number
) => {
  let nonce = new Date().getTime();
  let signature = await generateSignature(
    assetId,
    isBuy,
    limitPx,
    size,
    VAULT_ADDRESS,
    nonce
  );

  if (signature) {
    if (isBuy) {
      await run(assetId, limitPx, size, nonce, signature, VAULT_ADDRESS, true);
    } else {
      await run(assetId, limitPx, size, nonce, signature, VAULT_ADDRESS, false);
    }
  }
};

const createConnectionHash = (
  assetId: number,
  isBuy: boolean,
  limitPx: number,
  size: number,
  vaultAddress: Address,
  nonce: bigint
): Hex => {
  let encoded = keccak256(
    encodeAbiParameters(
      parseAbiParameters(
        "(uint32,bool,uint64,uint64,bool,uint8,uint64)[],uint8,address,uint64"
      ),
      [
        [
          [
            assetId,
            isBuy,
            amountToBigAmount(limitPx),
            amountToBigAmount(size),
            false,
            2,
            0n,
          ],
        ],
        0,
        vaultAddress,
        nonce,
      ]
    )
  );

  return encoded;
};

const amountToBigAmount = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 10 ** 8));
};
