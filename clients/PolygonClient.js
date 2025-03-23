import { ethers } from "ethers";
import { POLYGON_CONFIG } from "../config/polygon.js";

export class PolygonClient {
  constructor() {
    this.provider = new ethers.WebSocketProvider(POLYGON_CONFIG.RPC_URL);
    this.tokenAddress = POLYGON_CONFIG.TOKEN_ADDRESS;
    this.decimals = POLYGON_CONFIG.DECIMALS;
    
    this.adminWallet = new ethers.Wallet(
      POLYGON_CONFIG.ADMIN.PRIVATE_KEY, 
      this.provider
    );
    
    this.holderWallet = new ethers.Wallet(
      POLYGON_CONFIG.HOLDER.PRIVATE_KEY,
      this.provider
    );
  }

  async burnTokens(amount) {
    const contract = await this.getTokenContract(this.holderWallet);
    const burnAmount = ethers.parseUnits(amount.toString(), this.decimals);
    
    const transferTx = await contract.transfer(
      POLYGON_CONFIG.ADMIN.PUBLIC_KEY,
      burnAmount
    );
    await transferTx.wait();
    
    const adminContract = await this.getTokenContract(this.adminWallet);
    const burnTx = await adminContract.burn(burnAmount);
    return burnTx.wait();
  }

  async mintTokens(amount) {
    const contract = await this.getTokenContract(this.adminWallet);
    const mintAmount = ethers.parseUnits(amount.toString(), this.decimals);
    
    const tx = await contract.transfer(
      POLYGON_CONFIG.HOLDER.PUBLIC_KEY,
      mintAmount
    );
    return tx.wait();
  }

  async getTokenContract(wallet) {
    const abi = await this.fetchABI();
    return new ethers.Contract(this.tokenAddress, abi, wallet);
  }

  async fetchABI() {
    const { BASE_URL, API_KEY } = POLYGON_CONFIG.POLYGONSCAN_API;
    const url = `${BASE_URL}?module=contract&action=getabi&address=${this.tokenAddress}&apikey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ABI: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.status !== "1") {
            throw new Error(`Polygonscan API error: ${data.message}`);
        }
        
        return JSON.parse(data.result);
    } catch (error) {
        console.error("Error fetching ABI:", error);
        throw error;
    }
  }
}