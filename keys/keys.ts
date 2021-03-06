
import { SignJWT } from "../deps.ts";
import { key } from "./key.ts";

if (!key) {
  throw new Error("Cryptography not supported");
}

export async function generateJWT(
  login: string,
  uuid: string
): Promise<string> {
  return await new SignJWT({ "maintained-id:version": "v0.0.1" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("maintained-id")
    .setSubject(`${login}`)
    .setAudience(`${uuid}`)
    .setExpirationTime("24h")
    .sign(key);
}