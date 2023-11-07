class AbortError extends Error {
    /**
     * @type {Number}
     */
    code

    /**
     * @type {?Object}
     */
    data

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
        }

        if (this.data) info.data = this.data;
        return info;
    }
}

module.exports = AbortError;