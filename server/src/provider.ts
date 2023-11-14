import { loggerFactory } from "./logger";

export class ServiceBuilder {
    constructor() {
        this.services = [];
    }
    
    /**
     * @private
     */
    private services: any[];
    provideLoggers = true;

    public add(service: any): ServiceBuilder {
        this.services.push(service);
        return this;
    }

    public useLogger(loggerEnabled: boolean): ServiceBuilder {
        this.provideLoggers = loggerEnabled;
        return this;
    }

    build(): ServiceProvider { 
        if (this.provideLoggers) {
            for (let i = 0; i < this.services.length; i++) {
                let loggerName = this.services[i].constructor.name;
                this.services[i].logger = loggerFactory(loggerName);
                this.services[i] = Object.preventExtensions(this.services[i]);
            }
        }

        return new ServiceProvider(this.services);
    }
}

export class ServiceProvider {
    constructor(services: any[]) {
        this.services = services;
    }

    private services: any[];

    get<Type>(type: any): Type | null {
        if (type === undefined || type === null) {
            return null;
        }

        for (const service of this.services) {
            if (service instanceof type) {
                return service;
            }
        }

        return null;
    }

    getRequired<Type>(type: any): Type {
        for (const service of this.services) {
            if (service instanceof type) {
                return service;
            }
        }

        throw new Error(`Required service [${type.constructor.name}] not found`);
    }
}