const { loggerFactory } = require("./utils");

class ServiceBuilder {
    constructor() {
        this.services = [];
    }
    
    /**
     * @private
     */
    services;
    provideLoggers = true;

    add(service) {
        const register = (item) => {
            this.services.push(item);
        }

        register(service);
        return this;
    }

    /**
     * @returns {ServiceProvider}
     */
    build() { 
        for (let i = 0; i < this.services.length; i++) {
            let loggerName = this.services[i].constructor.name;
            if (this.provideLoggers) {
                this.services[i].logger = loggerFactory(loggerName);
            } else {
                this.services[i].logger = {
                    debug: () => {},
                    error: () => {},
                    log: () => {}
                }
            }
            this.services[i] = Object.preventExtensions(this.services[i]);
        }

        return new ServiceProvider(this.services);
    }
}

class ServiceProvider {
    constructor(services) {
        this.services = services;
    }

    /**
     * @private
     */
    services;

    /**
     * @returns {?any}
     */
    get(type) {
        if (!type) {
            return null;
        }

        for (const service of this.services) {
            if (service instanceof type) {
                return service;
            }
        }

        return null;
    }
}

module.exports = {ServiceBuilder, ServiceProvider};