import 'reflect-metadata'; // enables metadata for decorators at runtime
import { EvmBatchProcessor, BlockHeader, Log, Transaction as EvmTx } from "@subsquid/evm-processor";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { decodeTransfer, TRANSFER_TOPIC, transferId } from "./mappings/erc20";
import { Block, Transaction, Transfer } from "./model";

const RPC_URL = process.env.RSK_RPC_URL!;
const START_BLOCK = Number(process.env.START_BLOCK ?? 0);

const processor = new EvmBatchProcessor()
  .setDataSource({
    chain: { url: RPC_URL, rateLimit: 10 }
  })
  .setFinalityConfirmation(5)
  .setBlockRange({ from: START_BLOCK > 0 ? START_BLOCK : 0 })
  .addTransaction({})
  .addLog({
    topic0: [TRANSFER_TOPIC]
  });

processor.run(new TypeormDatabase(), async (ctx) => {
  for (const b of ctx.blocks) {
    await upsertBlock(ctx, b.header);

    // Save transactions
    for (const tx of b.transactions) {
      await upsertTx(ctx, b.header, tx);
    }

    // Save ERC-20 transfers
    for (const log of b.logs) {
      if (log.topics?.[0]?.toLowerCase() !== TRANSFER_TOPIC) continue;
      await saveTransfer(ctx, b.header, log);
    }
  }
});

async function upsertBlock(ctx: any, h: BlockHeader) {
  const id = h.hash;
  const existing = await ctx.store.findOneBy(Block, { id });
  if (!existing) {
    await ctx.store.insert(
      new Block({
        id,
        height: h.height,
        timestamp: new Date(h.timestamp * 1000)
      })
    );
  }
}

async function upsertTx(ctx: any, h: BlockHeader, tx: EvmTx) {
  const id = tx.hash!;
  const existing = await ctx.store.findOneBy(Transaction, { id });
  if (existing) return;

  const to = tx.to ?? null;

  // status is a boolean in many configs; treat undefined as false
  const success = (tx as any).status === true || (tx as any).status === 1;

  const entity = new Transaction({
    id,
    hash: id,
    from: (tx.from ?? "").toLowerCase(),
    to: to ? to.toLowerCase() : null,
    value: (tx as any).value?.toString?.() ?? "0",
    success,
    block: new Block({ id: h.hash })
  });
  await ctx.store.insert(entity);
}

async function saveTransfer(ctx: any, h: BlockHeader, log: Log) {
  const parsed = decodeTransfer(log);
  if (!parsed) return;

  const from = (parsed.args.from as string).toLowerCase();
  const to = (parsed.args.to as string).toLowerCase();
  const value = parsed.args.value.toString();
  const token = (log.address ?? "").toLowerCase();

  const txHash = (log as any).transactionHash ?? log.transaction?.hash;
  const id = transferId(txHash, log.logIndex);

  const existing = await ctx.store.findOneBy(Transfer, { id });
  if (existing) return;

  const entity = new Transfer({
    id,
    token,
    from,
    to,
    value,
    tx: new Transaction({ id: txHash }),
    block: new Block({ id: h.hash })
  });
  await ctx.store.insert(entity);
}

export {};
