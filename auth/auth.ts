
import { jwtVerify } from "../deps.ts";
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
			["client_id", Deno.env.get("CLIENT_ID") ?? ""],
			["client_secret", Deno.env.get("CLIENT_SECRET") ?? ""],
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
		return await fetch("https://api.github.com/user", { headers: headers })
			.then(res => res.text())
			.then(res => JSON.parse(res)["login"])
			.catch(ex => {
				throw new EvalError("Failed to get UUID: " + ex);
			});
	}
	
	// Get the auth URL from environment file
	// Sets state to a valid Maintained app to pass JWT to after auth
	getAuthURL(app: string): string {
		const authUrl = "https://github.com/login/oauth/authorize";

		// make sure app is sanitized to just letters
		const state = app.replace(/[^a-zA-Z]/g, "");

		const authParams: string[][] = [
			["client_id", Deno.env.get("CLIENT_ID") ?? ""],
			["redirect_uri", Deno.env.get("REDIRECT_URI") ?? ""],
			["state", state]
		];
		const authParamString = new URLSearchParams(authParams).toString();

		return `${authUrl}?${authParamString}`;
	}

	// Get GitHub app token manangement URL
	getManagementURL(): string {
		return `https://github.com/settings/connections/applications/${Deno.env.get("CLIENT_ID")}`;
	}
}