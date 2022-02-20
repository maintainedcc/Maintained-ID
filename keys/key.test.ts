
import { assert } from "../deps.test.ts";
import { key } from "./key.ts";

Deno.test({
	name: "key imports correctly",
	fn(): void {
		assert(key !== undefined && key !== null);
		assert(key.extractable === false);
	}
});