
import { secret } from "./private.key.ts";
import { crypto, SignJWT, jwtVerify } from "../deps.ts";

if (!crypto.subtle.importKey) {
  throw new Error("Cryptography not supported");
}

export const key = await crypto.subtle.importKey(
  "raw", secret,
  { name: "HMAC", hash: "SHA-256" } as any,
  false, ["sign", "verify"]
) as CryptoKey;

export async function generateJWT(uuid: string): Promise<string> {
  return await new SignJWT({ "maintained-id:version": "v0.0.1" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("maintained-id")
    .setSubject(`${uuid}`)
    .setAudience(`${uuid}`)
    .setExpirationTime("24h")
    .sign(key);
}

const jwt = await generateJWT("12345");

console.log(jwt);
console.log(await jwtVerify(jwt, key, { issuer: "maintained-id" }));