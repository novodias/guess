"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = exports.ServiceBuilder = void 0;
const logger_1 = require("./logger");
class ServiceBuilder {
    constructor() {
        this.provideLoggers = true;
        this.services = [];
    }
    add(service) {
        this.services.push(service);
        return this;
    }
    useLogger(loggerEnabled) {
        this.provideLoggers = loggerEnabled;
        return this;
    }
    build() {
        if (this.provideLoggers) {
            for (let i = 0; i < this.services.length; i++) {
                let loggerName = this.services[i].constructor.name;
                this.services[i].logger = (0, logger_1.loggerFactory)(loggerName);
                this.services[i] = Object.preventExtensions(this.services[i]);
            }
        }
        return new ServiceProvider(this.services);
    }
}
exports.ServiceBuilder = ServiceBuilder;
class ServiceProvider {
    constructor(services) {
        this.services = services;
    }
    get(type) {
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
    getRequired(type) {
        for (const service of this.services) {
            if (service instanceof type) {
                return service;
            }
        }
        throw new Error(`Required service [${type.constructor.name}] not found`);
    }
}
exports.ServiceProvider = ServiceProvider;
