import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { expect, test } from "bun:test";
import { COUNTER_SIZE, schema } from "./instruction";
import * as borsh from "borsh";

const counterAccount = Keypair.generate();
const adminAccount = Keypair.generate();

const connection = new Connection("http://localhost:8899", "confirmed");
const programId = new PublicKey("4LwpYfYExS7zwjJzewhLKsMCspxs3U8kMC4krxoPLpQy");

test("counter init", async () => {
  const txn = await connection.requestAirdrop(
    adminAccount.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(txn);
  const lamports = await connection.getMinimumBalanceForRentExemption(
    COUNTER_SIZE
  );

  const ix = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    lamports,
    space: COUNTER_SIZE,
    programId,
    newAccountPubkey: counterAccount.publicKey
  });

  const createAccountTxn = new Transaction();
  createAccountTxn.add(ix);

  const signature = await connection.sendTransaction(createAccountTxn, [adminAccount, counterAccount]);

  await connection.confirmTransaction(signature);
  console.log(counterAccount.publicKey.toBase58());

  const counterAccountInfo = await connection.getAccountInfo(counterAccount.publicKey);
  console.log(counterAccountInfo?.data);
  const counter = borsh.deserialize(schema, counterAccountInfo?.data);
  console.log(counter.count);
  expect(counter.count).toBe(0);
});
