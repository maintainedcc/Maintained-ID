
import { 
	Application,
	Router,
	send,
	config
} from "./deps.ts";
import { AuthService } from "./auth/auth.ts";

// Oak server + middleware
const app = new Application();
const router = new Router();

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
		const redir = app ? `${app}.maintained.cc` : "maintained.cc";

		const jwt = await auth.authorize(code, state);
		ctx.response.redirect(`https://${redir}/auth?jwt=${jwt}`);
	})
	.get("/oauth/login", ctx => {
		const params = ctx.request.url.searchParams;
		ctx.response.redirect(auth.getAuthURL(params.get("app") ?? ""));
	})
	.get("/oauth/manage", ctx => {
		ctx.response.redirect(auth.getManagementURL());
	});

app.use(router.allowedMethods());
app.use(router.routes());

app.listen({ port: config.port });
console.log(`Port: ${config.port}`);