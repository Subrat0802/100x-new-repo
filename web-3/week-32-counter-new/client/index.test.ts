import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {test, expect} from "bun:test";
import { counterAccountt, GREETING_SIZE, schema } from "./instuction";
import * as borsh from "borsh";


const adminAccount = Keypair.generate();
const counterAccount = new Keypair();
const programId = new PublicKey("BwKwPHxhdHXNoxGei2aDFAqhWQ4PhrZKyNxPns7JobMv");
const connection = new Connection("http://localhost:8899", "confirmed");

test("counter does init", async () => {

    const res = await connection.requestAirdrop(adminAccount.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const balance = await connection.getBalance(adminAccount.publicKey);

    const lamports = await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);

    const createCounterAcc = SystemProgram.createAccount({
        fromPubkey: adminAccount.publicKey,
        lamports,
        newAccountPubkey: counterAccount.publicKey,
        programId: programId,
        space: GREETING_SIZE
    })

    const tx = new Transaction().add(createCounterAcc);

    const txhash = await connection.sendTransaction(tx, [adminAccount, counterAccount]);
    await connection.confirmTransaction(txhash);

    const counterAccountInfo = await connection.getAccountInfo(counterAccount.publicKey);
    if(!counterAccountInfo){
        throw new Error ("Counter account does not found");
    }
    const counter = borsh.deserialize(schema, counterAccountInfo?.data) as counterAccountt;
    console.log(counter.count);
    expect(counter.count).toBe(0);

})