import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createAssociatedTokenAccount, getMint, burn, mintTo } from "@solana/spl-token";
import { SOLANA_CONFIG } from "../config/solana.js";
import { loadKeypairFromFile } from "../utils/helpers.js";

export class SolanaClient {
  constructor() {
    this.connection = new Connection(SOLANA_CONFIG.RPC_URL, "confirmed");
    this.mintAddress = new PublicKey(SOLANA_CONFIG.TOKEN_MINT);
    this.decimals = SOLANA_CONFIG.DECIMALS;
    this.adminKeypair = null;
    this.holderKeypair = null;
  }

  async initialize() {
    this.adminKeypair = await loadKeypairFromFile(SOLANA_CONFIG.ADMIN_KEYPAIR_PATH);
    this.holderKeypair = await loadKeypairFromFile(SOLANA_CONFIG.HOLDER_KEYPAIR_PATH);
    console.log("🔑 Solana Client Initialized");
    console.log(`Admin: ${this.adminKeypair.publicKey.toBase58()}`);
    console.log(`Holder: ${this.holderKeypair.publicKey.toBase58()}`);
  }

  async burnTokens(amount) {
    const mintInfo = await getMint(this.connection, this.mintAddress);
    const holderTokenAccount = await this.getTokenAccount(this.holderKeypair.publicKey);
    
    const burnAmount = amount * Math.pow(10, this.decimals);
    const txSignature = await burn(
      this.connection,
      this.holderKeypair,
      holderTokenAccount,
      this.mintAddress,
      this.holderKeypair,
      burnAmount
    );
    
    return txSignature;
  }

  async mintTokens(amount) {
    const mintInfo = await getMint(this.connection, this.mintAddress);
    const holderTokenAccount = await this.getTokenAccount(this.holderKeypair.publicKey);
    
    const mintAmount = amount * Math.pow(10, this.decimals);
    const txSignature = await mintTo(
      this.connection,
      this.adminKeypair,
      this.mintAddress,
      holderTokenAccount,
      this.adminKeypair,
      mintAmount
    );
    
    return txSignature;
  }

  async getTokenAccount(owner) {
    return createAssociatedTokenAccount(
      this.connection,
      this.adminKeypair,
      this.mintAddress,
      owner
    );
  }
}