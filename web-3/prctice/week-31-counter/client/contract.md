import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {test, expect} from "bun:test";
import { CounterAccount, GREETING_SIZE, schema } from "./count";
import * as borsh from "borsh";

const adminAccount = Keypair.generate();
const dataAccount = Keypair.generate();
const connection = new Connection("http://127.0.0.1:8899");
const program_id = new PublicKey("5Gmj5z9UsSnAEkoVvqUvPNDiJRAkLUC6otYUYAn6EakU");

test("Account is initialized", async () => {
    const tx = await connection.requestAirdrop(adminAccount.publicKey, 1 * LAMPORTS_PER_SOL);

    await connection.confirmTransaction(tx);

    const lamports = await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);

    const ix = SystemProgram.createAccount({
        fromPubkey: adminAccount.publicKey,
        lamports,
        space: GREETING_SIZE,
        programId:program_id,
        newAccountPubkey: dataAccount.publicKey
    })

    const createAccountTxn = new Transaction().add(ix);
    const signature = await connection.sendTransaction(createAccountTxn, [adminAccount, dataAccount]);

    await connection.confirmTransaction(signature);
    console.log(dataAccount.publicKey.toBase58());
    
    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    console.log(dataAccountInfo?.data)
    const counter = borsh.deserialize(schema, dataAccountInfo?.data);
    console.log(counter.count);
    expect(counter.count).toBe(0);

})

test("increase", async () => {
    const tx = new Transaction();

    tx.add(new TransactionInstruction({
        keys: [{
            pubkey: dataAccount.publicKey,
            isSigner: false,
            isWritable: true
        }],
        programId: program_id,
        data: Buffer.from(new Uint8Array([0,1,0,0,0]))
    }));

    const txhash = await connection.sendTransaction(tx, [adminAccount]);
    await connection.confirmTransaction(txhash);
    console.log(txhash);

    const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);

    if(!counterAccount) {
        throw new Error("Counter account not found"); 
    }

    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount;

    console.log(counter.count);
    expect(counter.count).toBe(1);
})

test("decrease", async () => {
    const tx = new Transaction();

    tx.add(new TransactionInstruction({
        keys:[
            {
                pubkey: dataAccount.publicKey,
                isSigner: false,
                isWritable: true
            }
        ],
        programId: program_id,
        data: Buffer.from(new Uint8Array([1,1,0,0,0]))
    }));

    const txHash = await connection.sendTransaction(tx, [adminAccount]);

    await connection.confirmTransaction(txHash);
    console.log("Decrease tx", txHash);

    const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);
    if(!counterAccount) {
        throw new Error("Counter account not found");
    }

    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount;

    console.log("Counter Account after dec", counter.count);

    expect(counter.count).toBe(0);

})