import { useRef } from "react";

class Logger {
    constructor(name) {
        this.name = name;
    }

    /**
     * @private
     * @param {("log"|"debug"|"info")} level 
     * @param {string} message 
     */
    log(level, message, css, obj) {
        console[level](`%c[${this.name}]: ` + `%c${message}`, ...css, obj || '');
    }

    debug(message, ...array) {
        if (import.meta.env.DEV) {
            // set this to "log" for now, for some reason chrome only shows debug on verbose
            this.log('log', message, ['color: rgb(160, 106, 160);', 'color: reset;'], array);
        }
    }

    info(message) {
        this.log('info', message, ['color: aquamarine; text-shadow: 1px 1px 2px black;', 'color: reset; text-shadow: none;']);
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