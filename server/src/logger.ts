import moment from 'moment';
import { isDebug } from './utils';

export interface ILogger {
    name: string;
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

class Logger {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    private get time(): string {
        return moment().format("HH:mm:ss");
    }

    private formatted(level: string): string {
        return `[${this.time}][${this.name}][${level}]:`
    }
    
    public debug(): void {
        if (!isDebug) return;
        const info = this.formatted("Debug");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.debug.apply(console, args);
    }

    public log(): void {
        const info = this.formatted("Info");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.log.apply(console, args);
    }

    public error(): void {
        const info = this.formatted("Error");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.error.apply(console, args);
    }
}

export const loggerFactory = (name: string): ILogger => {
    return new Logger(name);
};