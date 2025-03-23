import { readFileSync } from "fs";
import { homedir } from "os";
import path from "path";
import { Keypair } from "@solana/web3.js";

export async function loadKeypairFromFile(filePath) {
    const resolvedPath = path.resolve(
        filePath.startsWith("~") ? filePath.replace("~", homedir()) : filePath
    );
    const loadedKeyBytes = Uint8Array.from(
        JSON.parse(readFileSync(resolvedPath, "utf8"))
    );
    return Keypair.fromSecretKey(loadedKeyBytes);
}