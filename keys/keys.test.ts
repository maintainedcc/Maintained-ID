
import { assert, assertEquals } from "../deps.test.ts";
import { jwtVerify } from "../deps.ts";
import { generateJWT } from "./keys.ts";
import { key } from "./key.ts";

Deno.test({
	name: "generateJWT generates a valid JWT",
	async fn(): Promise<void> {
		const token = await generateJWT("someuuid");
		assert(token !== undefined && token !== null);
		assert(token.length > 0);
		const payload = (await jwtVerify(token, key)).payload;
		assert(payload !== undefined && payload !== null);
		assert(payload["maintained-id:version"] !== undefined)
		assertEquals(payload.iss, "maintained-id");
		assertEquals(payload.sub, "someuuid");
	}
})