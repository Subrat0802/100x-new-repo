import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {expect, test} from "bun:test";
import { CounterAccount, GREETING_SIZE, schema } from "./types";
import * as borsh from "borsh";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const userDataAccount = new Keypair();
const userAccount = new Keypair();
const program_key = new PublicKey("HRtnQ1wpXdHyAJbC76QV3k2tQTNS9WR9BnSDhaHpfcZ4");

test("init counter key", async () => {

    const res = await connection.requestAirdrop(userAccount.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const lamports = await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);


    const ix = SystemProgram.createAccount({
        fromPubkey:userAccount.publicKey,
        newAccountPubkey:userDataAccount.publicKey,
        lamports:lamports,
        programId:program_key,
        space:GREETING_SIZE
    })

    const tx = new Transaction().add(ix);
    const txhash = await connection.sendTransaction(tx, [userAccount, userDataAccount]);
    const confirmation = await connection.confirmTransaction(txhash, "confirmed");
    console.log("Transaction confirmed:", confirmation);
})

test("Increase", async () => {
    const tx = new Transaction();

    tx.add(new TransactionInstruction({
        keys:[
            {pubkey: userDataAccount.publicKey, isSigner: false, isWritable: true}
        ],
        programId: program_key,
        data: Buffer.from(new Uint8Array([0,1,0,0,0]))
    }));

    const txhash = await connection.sendTransaction(tx, [userAccount]);
    await connection.confirmTransaction(txhash);
    
    const counterAccount = await connection.getAccountInfo(userDataAccount.publicKey);

    if(!counterAccount){
        throw new Error("User data account not found");
    }

    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount;

    console.log(counter.count);
    expect(counter.count).toBe(1);
})

test("decrease", async () => {
    const tx = new Transaction();

    tx.add(new TransactionInstruction({
        keys: [{
            pubkey: userDataAccount.publicKey,
            isSigner: false,
            isWritable: true
        }],
        programId: program_key,
        data:Buffer.from(new Uint8Array([1,1,0,0,0]))
    }))

    const txhash = await connection.sendTransaction(tx, [userAccount]);
    await connection.confirmTransaction(txhash);
    
    const counterAccount = await connection.getAccountInfo(userDataAccount.publicKey);

    if(!counterAccount){
        throw new Error("User data account not found");
    }

    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount;

    console.log(counter.count);
    expect(counter.count).toBe(0);
}) 