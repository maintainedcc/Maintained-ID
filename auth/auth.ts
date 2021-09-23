
import { config } from "../deps.ts";
import { generateJWT } from "../keys/keys.ts";

export class AuthService {

	// Returns if JWT is authorized (true/false)
	isAuthorized(JWT: string): boolean {
		return this.identity.isAuthorized(JWT);
	}

	// Returns GitHub UUID from JWT
	getAuthorization(JWT: string): string {
		return this.identity.getAuthorization(JWT);
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
		let _JWT = await generateJWT(uuid);
		return _JWT;
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