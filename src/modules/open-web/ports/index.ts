export interface IOpenUrlPorts {
	readonly executeCommand: (command: string, args: string[]) => Promise<void>;
	readonly getPlatform: () => string;
}
