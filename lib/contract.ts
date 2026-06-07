import { BASE_CHAIN } from "@/lib/chain";

export { BASE_CHAIN };

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const MINT_PRICE_ETH = "0.001";
export const MINT_PRICE_WEI = 1_000_000_000_000_000n;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const TOTAL_SUPPLY_SELECTOR = "0xbd85b039";
export const CLAIM_SELECTOR = "0x57bc3d78";

export function hasConfiguredContract() {
  return CONTRACT_ADDRESS !== ZERO_ADDRESS;
}

export function encodeTotalSupplyCall(tokenId: number | bigint) {
  return `${TOTAL_SUPPLY_SELECTOR}${uint256(tokenId).slice(2)}`;
}

export function encodeClaimCall(receiver: string, tokenId: number | bigint) {
  const tupleOffset = 7n * 32n;
  const tupleLength = 5n * 32n;
  const bytesOffset = tupleOffset + tupleLength;

  return [
    CLAIM_SELECTOR,
    addressWord(receiver).slice(2),
    uint256(tokenId).slice(2),
    uint256(1).slice(2),
    addressWord(NATIVE_TOKEN_ADDRESS).slice(2),
    uint256(MINT_PRICE_WEI).slice(2),
    uint256(tupleOffset).slice(2),
    uint256(bytesOffset).slice(2),
    uint256(128).slice(2),
    uint256(0).slice(2),
    uint256(MINT_PRICE_WEI).slice(2),
    addressWord(NATIVE_TOKEN_ADDRESS).slice(2),
    uint256(0).slice(2),
    uint256(0).slice(2),
  ].join("") as `0x${string}`;
}

export function ethValueHex() {
  return `0x${MINT_PRICE_WEI.toString(16)}`;
}

function uint256(value: number | bigint) {
  return `0x${BigInt(value).toString(16).padStart(64, "0")}`;
}

function addressWord(address: string) {
  return `0x${address.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`;
}
