import {expect, test} from "bun:test"
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { COUNTER_SIZE, schema } from "./types";
import * as borsh from "borsh";

const adminAccount = Keypair.generate();
const dataAccount = Keypair.generate();
const connection = new Connection("http://127.0.0.1:8899");

const PROGRAM_Id = new PublicKey("CKHqwxScnXGAbMJZtYJ4AwAcmQBABSmHtWtoT1gmB6Uh");

test("Account is initialize", async () => {
    //expect(sum(1, 2).toBe(3))
    
    const txn = await connection.requestAirdrop(adminAccount.publicKey, 1 * 1000_000_000);
    
    await connection.confirmTransaction(txn);

    // const data = await connection.getAccountInfo(adminAccount.publicKey);
    // console.log(data);

    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);

    const ix = SystemProgram.createAccount({
        fromPubkey: adminAccount.publicKey,
        lamports,
        space: COUNTER_SIZE,
        programId: PROGRAM_Id,
        newAccountPubkey: dataAccount.publicKey
    })

    const createAccountTxn = new Transaction();
    createAccountTxn.add(ix);
    const signature = await connection.sendTransaction(createAccountTxn, [adminAccount, dataAccount]);

    await connection.confirmTransaction(signature);
    console.log(dataAccount.publicKey.toBase58());

    const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
    console.log(dataAccountInfo?.data)
    const counter = borsh.deserialize(schema, dataAccountInfo?.data);
    console.log(counter.count);
    expect(counter.count).toBe(0);
    
})

// test("make sure increase works", async () => {

//     //write code to increase or decrease with the contract to call the inc or dec instruction


//     const dataAccountInfo = await connection.getAccountInfo(dataAccount.publicKey);
//     console.log(dataAccountInfo?.data)
//     const counter = borsh.deserialize(schema, dataAccountInfo?.data);
//     console.log(counter.count);
//     expect(counter.count).toBe(0);

// })