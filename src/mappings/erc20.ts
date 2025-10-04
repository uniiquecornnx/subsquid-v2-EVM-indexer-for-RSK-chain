import {Log} from "@subsquid/evm-processor";
import {Interface, LogDescription} from "ethers";
import {Transfer, Transaction, Block} from "../model";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const iface = new Interface(ERC20_ABI);
export const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export function decodeTransfer(log: Log): LogDescription | null {
  if (!log.topics || log.topics[0]?.toLowerCase() !== TRANSFER_TOPIC) return null;
  try {
    return iface.parseLog({
      topics: log.topics as string[],
      data: log.data ?? "0x"
    });
  } catch {
    return null;
  }
}

export function transferId(txHash: string, logIndex: number | undefined): string {
  return `${txHash}-${logIndex ?? 0}`;
}
