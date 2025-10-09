import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899");

async function main(){
    const kp = new Keypair();
    const dataAccount = new Keypair();

    const sign = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sign);
    
    const instruction = SystemProgram.createAccount({
            fromPubkey: kp.publicKey,
            newAccountPubkey: dataAccount.publicKey,
            lamports: 1 * LAMPORTS_PER_SOL,
            space: 8,
            /** Public key of the program to assign as the owner of the created account */
            programId: SystemProgram.programId
    })

    const txn = new Transaction().add(instruction);
    txn.feePayer = kp.publicKey;
    txn.recentBlockhash = ((await connection.getLatestBlockhash()).blockhash);

    await connection.sendTransaction(txn, [kp, dataAccount])

    console.log(dataAccount.publicKey.toBase58());

}

main();