"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbortError extends Error {
    constructor(msg, code, data = null) {
        super(msg);
        this.code = code;
        this.data = data;
    }
    get sanitized() {
        const info = {
            error: {
                message: this.message,
                code: this.code,
            },
        };
        if (this.data)
            info.data = this.data;
        return info;
    }
}
exports.default = AbortError;
