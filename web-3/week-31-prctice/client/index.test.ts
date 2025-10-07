import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {test} from "bun:test";
import { GREETING_SIZE } from "./instruction";


const counterAccount = Keypair;
const adminAccount = Keypair.generate();
const connection = new Connection("http://localhost:8899", "confirmed");
const programId = new PublicKey("4LwpYfYExS7zwjJzewhLKsMCspxs3U8kMC4krxoPLpQy");

test("counter does increase", async () => {
    const res = await connection.requestAirdrop(adminAccount.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const lamports = await connection.getMinimumBalanceForRentExemption(
        GREETING_SIZE
    );

    
    
    
})