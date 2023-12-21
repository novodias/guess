import { useRef } from "react";

class Logger {
    constructor(name) {
        this.name = name;
    }

    /**
     * @private
     */
    log(message, css) {
        console.log(`%c[${this.name}]: ` + message, css);
    }

    debug(message) {
        if (import.meta.env.DEV) {
            this.log(message, 'color: rgb(160, 106, 160);');
        }
    }

    info(message) {
        this.log(message, 'color: aquamarine; text-shadow: 1px 1px 2px black');
    }
}

export default function useLogger(name) {
    const raf = useRef(new Logger(name));
    const logger = raf.current;
    
    return {
        info: logger.info.bind(logger),
        debug: logger.debug.bind(logger)
    };
}