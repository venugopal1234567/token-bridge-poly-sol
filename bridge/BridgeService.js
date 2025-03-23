import { SolanaClient } from "../clients/SolanaClient.js";
import { PolygonClient } from "../clients/PolygonClient.js";

export class BridgeService {
  constructor() {
    this.solanaClient = new SolanaClient();
    this.polygonClient = new PolygonClient();
    this.decimalsRatio = 10 ** (18 - 9);
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.solanaClient.initialize();
      console.log("🌉 Bridge Service Initialized");
      this.initialized = true;
    }
  }

  async bridgeSolanaToPolygon(amount) {
    // Convert amount considering decimals difference
    const polygonAmount = amount * this.decimalsRatio;
    
    // Burn on Solana
    const burnTx = await this.solanaClient.burnTokens(amount);
    console.log(`🔥 Solana Burn TX: ${burnTx}`);
    
    // Mint on Polygon
    const mintTx = await this.polygonClient.mintTokens(polygonAmount);
    console.log(`🪙 Polygon Mint TX: ${mintTx.hash}`);
    
    return { burnTx, mintTx };
  }

  async bridgePolygonToSolana(amount) {
    // Convert amount considering decimals difference
    const solanaAmount = amount / this.decimalsRatio;
    
    // Burn on Polygon
    const burnTx = await this.polygonClient.burnTokens(amount);
    console.log(`🔥 Polygon Burn TX: ${burnTx.hash}`);
    
    // Mint on Solana
    const mintTx = await this.solanaClient.mintTokens(solanaAmount);
    console.log(`🪙 Solana Mint TX: ${mintTx}`);
    
    return { burnTx, mintTx };
  }
}