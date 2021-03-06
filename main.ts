
import { Application,	Router } from "./deps.ts";
import { AuthService } from "./auth/auth.ts";

// Oak server + middleware
const app = new Application();
const router = new Router();
const selfTester = new Router();

// Services
const auth = new AuthService();

router
	.get("/oauth/callback", async ctx => {
		const params = ctx.request.url.searchParams;
		const code = params.get("code") ?? "";
		const state = params.get("state") ?? "";

		if (!code) ctx.throw(400);

		// Sanitize state to get app namespace (just in case)
		const app = state.replace(/[^a-zA-Z]/g, "");
		const base = Deno.env.get("REDIRECT_BASE") ?? "";
		const redir = app ? `${app}.${base}` : base;
		const protocol = Deno.env.get("REDIRECT_PROTOCOL") ?? "http";

		const jwt = await auth.authorize(code, state);
		ctx.response.redirect(`${protocol}://${redir}/auth?jwt=${jwt}`);
	})
	.get("/oauth/login", ctx => {
		const params = ctx.request.url.searchParams;
		ctx.response.redirect(auth.getAuthURL(params.get("app") ?? ""));
	})
	.get("/oauth/manage", ctx => {
		ctx.response.redirect(auth.getManagementURL());
	});

selfTester
	.get("/auth", async ctx => {
		const params = ctx.request.url.searchParams;
		const jwt = params.get("jwt") ?? "";
		const uuid = await auth.getAuthorization(jwt);
		ctx.response.body = `JWT: ${jwt}\nVerified As: ${uuid}`;
	});

app.use(router.allowedMethods());
app.use(router.routes());

app.use(selfTester.allowedMethods());
app.use(selfTester.routes());

const port = parseInt(Deno.env.get("PORT")??"8999");
app.listen({ port: port });
console.log(`Port: ${port}`);
console.log(`http://localhost:${port}/oauth/login`);