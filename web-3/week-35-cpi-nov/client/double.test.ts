// import { test, expect } from "bun:test";
// import { LiteSVM } from "litesvm";
// import {
//   PublicKey,
//   Transaction,
//   SystemProgram,
//   Keypair,
//   LAMPORTS_PER_SOL,
//   TransactionInstruction,
// } from "@solana/web3.js";

// test("init data account", () => {
//   const svm = new LiteSVM();
//   const contractPubkey = PublicKey.unique();
//   svm.addProgramFromFile(contractPubkey, "./cpidouble.so");
//   const payer = new Keypair();
//   svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
//   const dataAccount = new Keypair();
//   const blockhash = svm.latestBlockhash();

//   const ixs = [
//     SystemProgram.createAccount({
//       fromPubkey: payer.publicKey,
//       newAccountPubkey: dataAccount.publicKey,
//       lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
//       programId: contractPubkey,
//       space: 4,
//     }),
//   ];

//   const tx = new Transaction();
//   tx.recentBlockhash = blockhash;
//   tx.add(...ixs);
//   tx.sign(payer, dataAccount);
//   svm.sendTransaction(tx);
//   const balanceAfter = svm.getBalance(dataAccount.publicKey);
//   expect(balanceAfter).toBe(svm.minimumBalanceForRentExemption(BigInt(4)));

//   function doubleCounter() {
//     const ix2 = new TransactionInstruction({
//       keys: [
//         { pubkey: dataAccount.publicKey, isSigner: false, isWritable: true },
//       ],
//       programId: contractPubkey,
//       data: Buffer.from(""),
//     });
//     const blockhash2 = svm.latestBlockhash();
//     const tx2 = new Transaction();
//     tx2.recentBlockhash = blockhash2;
//     tx2.add(ix2);
//     tx2.sign(payer);
//     svm.sendTransaction(tx2);
//     svm.expireBlockhash();
//   }

//   doubleCounter();
//   doubleCounter();
//   doubleCounter();
//   doubleCounter();

//   const newDataAccount = svm.getAccount(dataAccount.publicKey);

//   expect(newDataAccount?.data[0]).toBe(8);
//   expect(newDataAccount?.data[1]).toBe(0);
//   expect(newDataAccount?.data[2]).toBe(0);
//   expect(newDataAccount?.data[3]).toBe(0);
// });


// //cpi-double-invoke.so