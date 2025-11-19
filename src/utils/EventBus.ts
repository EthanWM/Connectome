// Simple event bus for decoupled communication

type EventCallback = (...args: any[]) => void;

export class EventBus {
    private events: Map<string, EventCallback[]>;

    constructor() {
        this.events = new Map();
    }

    public on(event: string, callback: EventCallback): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    public emit(event: string, ...args: any[]): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(...args));
        }
    }

    public off(event: string, callback: EventCallback): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
}
