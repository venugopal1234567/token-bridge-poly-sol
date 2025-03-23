import { BridgeService } from "./bridge/BridgeService.js";

async function main() {
  try {
    const bridge = new BridgeService();
    await bridge.initialize();
    
    // Example usage
    const amount = 10;
    
    console.log("\n🚀 Bridging from Solana to Polygon");
    const solToPoly = await bridge.bridgeSolanaToPolygon(amount);
    console.log("Bridge Complete:", solToPoly);
    
    console.log("\n🚀 Bridging from Polygon to Solana");
    const polyToSol = await bridge.bridgePolygonToSolana(amount);
    console.log("Bridge Complete:", polyToSol);
    
  } catch (error) {
    console.error("❌ Bridge Error:", error);
    process.exit(1);
  }
}

main();