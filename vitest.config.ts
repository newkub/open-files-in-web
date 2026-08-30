import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const root = import.meta.dirname ?? process.cwd();

export default defineConfig({
	resolve: {
		alias: {
			"#shared": resolve(root, "src/shared"),
			"#modules": resolve(root, "src/modules"),
			"#adapters": resolve(root, "src/adapters"),
			"#presentation": resolve(root, "src/presentation"),
		},
	},
	test: {
		environment: "node",
	},
});
