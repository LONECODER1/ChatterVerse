/**
 * Helper to encrypt/decrypt messages client-side using Web Crypto API (AES-GCM).
 * The key is derived locally in the browser based on a shared secret of the sorted user IDs.
 */

const isBrowser = typeof window !== "undefined";

export async function encryptMessage(text: string, senderId: string, receiverId: string): Promise<string> {
    if (!text || !isBrowser) return text;

    try {
        const sharedSecret = [senderId, receiverId].sort().join("-");
        const rawKey = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(sharedSecret));
        const key = await window.crypto.subtle.importKey(
            "raw",
            rawKey,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            new TextEncoder().encode(text)
        );

        // Encode binary values to base64
        const ivBase64 = btoa(String.fromCharCode(...Array.from(iv)));
        const cipherBase64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(encrypted))));

        // Return E2EE format: "e2ee:iv:ciphertext"
        return `e2ee:${ivBase64}:${cipherBase64}`;
    } catch (error) {
        console.error("Encryption failed:", error);
        return text;
    }
}

export async function decryptMessage(encryptedData: string, senderId: string, receiverId: string): Promise<string> {
    if (!encryptedData || !isBrowser) return encryptedData;

    // Check if the message is in E2EE format
    if (!encryptedData.startsWith("e2ee:")) return encryptedData;

    try {
        const parts = encryptedData.split(":");
        if (parts.length !== 3) return encryptedData;

        const [, ivBase64, cipherBase64] = parts;

        const iv = new Uint8Array(atob(ivBase64).split("").map((c) => c.charCodeAt(0)));
        const cipherText = new Uint8Array(atob(cipherBase64).split("").map((c) => c.charCodeAt(0)));

        const sharedSecret = [senderId, receiverId].sort().join("-");
        const rawKey = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(sharedSecret));
        const key = await window.crypto.subtle.importKey(
            "raw",
            rawKey,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipherText
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        return "[Secure Encrypted Message]";
    }
}
