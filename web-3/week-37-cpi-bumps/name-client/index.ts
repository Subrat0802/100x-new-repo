import { Keypair, Connection, SystemProgram, Transaction } from "@solana/web3.js";

const conn = new Connection("http://127.0.0.1:8899")

async function main() {
    const kp = new Keypair();
    const dataAccount = new Keypair();

    const repsonse = await conn.requestAirdrop(kp.publicKey,  3000_000_000);
    await conn.confirmTransaction(repsonse);
   
    const ix = SystemProgram.createAccount({
        fromPubkey:kp.publicKey,
        lamports: 1000_000_000,
        newAccountPubkey:dataAccount.publicKey,
        programId: SystemProgram.programId,
        space: 8
    });

    const tx = new Transaction().add(ix);
    tx.feePayer = kp.publicKey;
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
    tx.sign(kp);

    await conn.sendTransaction(tx, [kp, dataAccount]);
    console.log(dataAccount.publicKey.toBase58()); 
}

main();