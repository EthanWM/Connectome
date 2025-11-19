// Debug logging helper

export class Logger {
    private static enabled = true;

    public static info(message: string, ...args: any[]): void {
        if (this.enabled) {
            console.log(`[ICDS] ${message}`, ...args);
        }
    }

    public static warn(message: string, ...args: any[]): void {
        if (this.enabled) {
            console.warn(`[ICDS] ${message}`, ...args);
        }
    }

    public static error(message: string, ...args: any[]): void {
        if (this.enabled) {
            console.error(`[ICDS] ${message}`, ...args);
        }
    }

    public static setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}
