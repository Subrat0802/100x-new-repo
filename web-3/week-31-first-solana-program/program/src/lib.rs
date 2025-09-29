import { expect, test } from "bun:test";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as borsh from "borsh";
import { COUNTER_SIZE, schema } from "./types"; // your Borsh schema

const adminAccount = Keypair.generate();
const dataAccount = Keypair.generate();
const connection = new Connection("http://127.0.0.1:8899");

const PROGRAM_ID = new PublicKey("CKHqwxScnXGAbMJZtYJ4AwAcmQBABSmHtWtoT1gmB6Uh");

test("Initialize counter account", async () => {
  // Airdrop some SOL to admin
  const txn = await connection.requestAirdrop(adminAccount.publicKey, 1_000_000_000);
  await connection.confirmTransaction(txn);

  // Create the counter account
  const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
  const ix = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    newAccountPubkey: dataAccount.publicKey,
    lamports,
    space: COUNTER_SIZE,
    programId: PROGRAM_ID,
  });

  const createTxn = new Transaction().add(ix);
  await connection.sendTransaction(createTxn, [adminAccount, dataAccount]);

  // Initialize counter to 0 using the program
  const initIx = new TransactionInstruction({
    keys: [{ pubkey: dataAccount.publicKey, isSigner: false, isWritable: true }],
    programId: PROGRAM_ID,
    data: Buffer.from([0]), // 0 = Initialize instruction in Rust
  });

  await connection.sendTransaction(new Transaction().add(initIx), [adminAccount]);

  // Check initial counter
  const info = await connection.getAccountInfo(dataAccount.publicKey);
  const counter = borsh.deserialize(schema, info!.data);
  expect(counter.count).toBe(0);
});

test("Increment counter", async () => {
  const incrementIx = new TransactionInstruction({
    keys: [{ pubkey: dataAccount.publicKey, isSigner: false, isWritable: true }],
    programId: PROGRAM_ID,
    data: Buffer.from([1, 0, 0, 0, 1]), // 1 = Increment, followed by u32 amount = 1
  });

  await connection.sendTransaction(new Transaction().add(incrementIx), [adminAccount]);

  const info = await connection.getAccountInfo(dataAccount.publicKey);
  const counter = borsh.deserialize(schema, info!.data);
  expect(counter.count).toBe(1);
});

test("Decrement counter", async () => {
  const decrementIx = new TransactionInstruction({
    keys: [{ pubkey: dataAccount.publicKey, isSigner: false, isWritable: true }],
    programId: PROGRAM_ID,
    data: Buffer.from([2, 0, 0, 0, 1]), // 2 = Decrement, u32 amount = 1
  });

  await connection.sendTransaction(new Transaction().add(decrementIx), [adminAccount]);

  const info = await connection.getAccountInfo(dataAccount.publicKey);
  const counter = borsh.deserialize(schema, info!.data);
  expect(counter.count).toBe(0);
});
