
export interface AbortErrorMessage {
    message: string;
    code: number;
}

export interface AbortErrorSanitized {
    error: AbortErrorMessage;
    data?: any;
}

export default class AbortError extends Error {
    /**
     * @type {Number}
     */
    code

    /**
     * @type {?Object}
     */
    public data

    constructor(msg: string, code: number, data: any = null) {
        super(msg);
        this.code = code;
        this.data = data;
    }

    get sanitized() {
        const info: AbortErrorSanitized = {
            error: {
                message: this.message,
                code: this.code,
            },
        }

        if (this.data) info.data = this.data;
        return info;
    }
}