import { execSync } from "node:child_process";
import type { IOpenUrlPorts } from "#modules/open-web/ports";

export const createBrowserAdapter = (): IOpenUrlPorts => ({
	executeCommand: async (command: string, args: string[]) => {
		execSync(`${command} ${args.join(" ")}`, { stdio: "ignore" });
	},
	getPlatform: () => process.platform,
});
