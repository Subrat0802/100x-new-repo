import {test, expect} from "bun:test";
import { LiteSVM } from "litesvm";
import {Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction} from "@solana/web3.js"

test("Cpi work as expect", async () => {
    let svm = new LiteSVM();
    const doubleContract = PublicKey.unique();
    const cpiContract = PublicKey.unique();
    svm.addProgramFromFile(doubleContract, "./cpidouble.so");
    svm.addProgramFromFile(cpiContract, "./invoke_con.so");

    let userAcc = new Keypair();
    let dataAcc = new Keypair();
    svm.airdrop(userAcc.publicKey, BigInt(1000_000_000));
    
    createDataAccountOnChain(svm, userAcc, dataAcc, doubleContract);

    function doubleIt() {
        let ix = new TransactionInstruction({
            keys:[
                    {pubkey: dataAcc.publicKey, isSigner:true, isWritable: true},
                    {pubkey: doubleContract, isSigner:false, isWritable: true}
                ],
            programId: cpiContract,
            data: Buffer.from("")
        })

        const blockhash = svm.latestBlockhash();
        let trx = new Transaction();
        trx.recentBlockhash = blockhash
        trx.add(ix);
        trx.sign(userAcc, dataAcc);
        svm.sendTransaction(trx);
        svm.expireBlockhash();
    }


    doubleIt();
    doubleIt();
    doubleIt();

    const dataAccData = svm.getAccount(dataAcc.publicKey);
    expect(dataAccData?.data[0]).toBe(4);
    expect(dataAccData?.data[1]).toBe(0);
    expect(dataAccData?.data[2]).toBe(0);
    expect(dataAccData?.data[3]).toBe(0);

})

function createDataAccountOnChain(svm: LiteSVM, userAcc: Keypair, dataAcc: Keypair, doubleContract: PublicKey){
    const blockhash = svm.latestBlockhash();
    const ixs = [
        SystemProgram.createAccount({
            fromPubkey: userAcc.publicKey,
            newAccountPubkey: dataAcc.publicKey,
            lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
            space: 4,
            programId: doubleContract
        })
    ]

    const tx = new Transaction();
	tx.recentBlockhash = blockhash;
	tx.add(...ixs);
    tx.sign(userAcc, dataAcc);
	svm.sendTransaction(tx);
}