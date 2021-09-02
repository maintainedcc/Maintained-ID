
import { config, nanoid } from "../deps.ts";
import { IdentityService } from "./identity.ts";

export class AuthService {
	private identity: IdentityService;

	constructor() {
		this.identity = new IdentityService();
	}

	// Returns if nanoid is authorized (true/false)
	isAuthorized(nanoid: string): boolean {
		return this.identity.isAuthorized(nanoid);
	}

	// Returns GitHub UUID from nanoid
	getAuthorization(nanoid: string): string {
		return this.identity.getAuthorization(nanoid);
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
		
		// Generate an unused nanoid for the user
		let _nanoid = nanoid();
		while (this.isAuthorized(_nanoid))
			_nanoid = nanoid();

		// Add user to the identity service, return nanoid
		this.identity.authorizeNanoid(_nanoid, uuid);
		return _nanoid;
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