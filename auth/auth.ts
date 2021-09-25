
import { config, jwtVerify } from "../deps.ts";
import { key, generateJWT } from "../keys/keys.ts";

export class AuthService {

	// Returns GitHub UUID from JWT
	async getAuthorization(JWT: string): Promise<string> {
		const uuid = (await jwtVerify(JWT, key)).payload.sub;
		if (uuid) return uuid;
		else throw new Error("Failed to get UUID from JWT");
	}

	async authorize(code: string, state: string): Promise<string> {
		const url = "https://github.com/login/oauth/access_token";
		const tokenParams: string[][] = [
			["client_id", config.client_id],
			["client_secret", config.client_secret],
			["code", code],
			["state", state]
		]
		const paramString = new URLSearchParams(tokenParams).toString();

		// Get user token from GitHub
		const headers = new Headers({ "Accept": "application/json" });
		const token = await fetch(`${url}?${paramString}`, { method: "POST", headers: headers })
			.then(res => res.text())
			.then(res => JSON.parse(res)["access_token"])
			.catch(ex => {
				throw new EvalError("Failed to get token: " + ex);
			});
		
		// Get GitHub UUID of user from token
		const uuid = await this.getUserUUID(token);
		
		// Generate a JWT for the user
		return await generateJWT(uuid);
	}

	// Get username from token and API call
	private async getUserUUID(token: string): Promise<string> {
		const headers = new Headers({
			"Accept": "application/vnd.github.v3+json",
			"Authorization": `token ${token}`
		});
		return fetch("https://api.github.com/user", { headers: headers })
			.then(res => res.text())
			.then(res => JSON.parse(res)["login"])
			.catch(ex => {
				throw new EvalError("Failed to get UUID: " + ex);
			});
	}
}