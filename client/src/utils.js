const _env = process.env.NODE_ENV;
export default class logger {
    /**
     * 
     * @param {("debug"|"info")} level 
     * @param {*} message 
     */
    static log(level, callback) {
        const _logHandler = {
            "debug": () => {
                if (_env === "development") {
                    callback();
                }
            },
            "info": () => {
                callback();
            }
        }
    
        _logHandler[level]();
    }
    
    static debug() {
        const args = [...arguments];
        this.log("debug", () => console.log("[DEBUG]", ...args));
    }
}