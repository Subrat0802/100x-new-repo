import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, type Signer } from "@solana/web3.js";
import {test, expect} from "bun:test";
import { LiteSVM } from "litesvm";

test("CPI work as expect", async () => {
    let svm = new LiteSVM();

    //init accounts 
    const doubleContrcat = PublicKey.unique();
    const cpiContract = PublicKey.unique();

    //contract so file with pub key
    svm.addProgramFromFile(doubleContrcat, "./cpidouble.so");
    svm.addProgramFromFile(cpiContract, "./cpi-double-invoke.so");

    //init user account
    let userAccount = new Keypair();

    //init data account 
    let dataAccount = new Keypair();

    //airdrop some sol to user
    svm.airdrop(userAccount.publicKey, BigInt(1000_000_000));

    //this will create data account on blockchain
    createDataAccountOnChain(svm, dataAccount, userAccount, doubleContrcat);

    //after creating data account on chain ->>>>

    const ix = new TransactionInstruction({
      keys: [
        { pubkey: dataAccount.publicKey, isSigner: true, isWritable: true },
        { pubkey: doubleContrcat, isSigner: false, isWritable: false },
      ],
      programId: cpiContract,
      data: Buffer.from(""),
    });

    const blockhash2 = svm.latestBlockhash();
    const tx = new Transaction().add(ix);;
    tx.recentBlockhash = blockhash2;
    tx.feePayer = userAccount.publicKey;
    tx.sign(userAccount, dataAccount);

    const res = svm.sendTransaction(tx);
    console.log(res.toString());

    const dataAccountData = svm.getAccount(dataAccount.publicKey);

    expect(dataAccountData?.data[0]).toBe(1);
    expect(dataAccountData?.data[1]).toBe(0);
    expect(dataAccountData?.data[2]).toBe(0);
    expect(dataAccountData?.data[3]).toBe(0);

})


function createDataAccountOnChain(svm: LiteSVM, dataAccount: Keypair | Signer, userAccount: Keypair | Signer, doubleContrcat: PublicKey) {
  const blockhash = svm.latestBlockhash();

  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: userAccount.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      programId: doubleContrcat,
      space: 4,
    }),
  ];

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.sign(userAccount, dataAccount);
  svm.sendTransaction(tx);
}