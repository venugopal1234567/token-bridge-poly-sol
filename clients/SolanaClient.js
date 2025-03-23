import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createAssociatedTokenAccount, getMint, burn, mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { SOLANA_CONFIG } from "../config/solana.js";
import { loadKeypairFromFile } from "../utils/helpers.js";

export class SolanaClient {
  constructor() {
    const RPC_URL = clusterApiUrl("devnet");
    this.connection = new Connection(RPC_URL, "confirmed");
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
    console.log(`Got mint info ${mintInfo.address}`)

    const holderTokenAccount = await this.createTokenAccount(this.mintAddress);
    const burnAmount = amount * Math.pow(10, this.decimals);
    const txSignature = await burn(
      this.connection,
      this.holderKeypair,
      holderTokenAccount.address,
      this.mintAddress,
      this.holderKeypair,
      burnAmount
    );
    
    return txSignature;
  }

  async mintTokens(amount) {
    const mintInfo = await getMint(this.connection, this.mintAddress);
    console.log(`Got mint info ${mintInfo.address}`)
    const holderTokenAccount = await this.createTokenAccount(this.mintAddress);
    
    const mintAmount = amount * Math.pow(10, this.decimals);
    const txSignature = await mintTo(
      this.connection,
      this.adminKeypair,
      this.mintAddress,
      holderTokenAccount.address,
      this.adminKeypair,
      mintAmount
    );
    
    return txSignature;
  }

  async createTokenAccount(mint) {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.adminKeypair,
      mint,
      this.holderKeypair.publicKey
    )
    return tokenAccount
  }
}