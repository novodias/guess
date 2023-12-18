import { useRef } from "react";

export default function useLogger(name) {
    const raf = useRef((message, css) => {
        console.log(`%c[${name}]: ` + message, css);
    });

    const log = raf.current;

    const debug = (message) => {
        if (import.meta.env.DEV) {
            log(message, 'color: rgb(160, 106, 160);');
        }
    }

    const info = (message) => {
        log(message, 'color: aquamarine; text-shadow: 1px 1px 2px black');
    }

    return { debug, info };
}