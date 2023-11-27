const ease = {
    "linear": (num) => num,
    "easeIn": (num) => {
        return 1 - Math.cos((num * Math.PI) / 2);
    },
    "easeOut": (num) => {
        return Math.sin((num * Math.PI / 2));
    },
    "easeInOut": (num) => {
        return -(Math.cos(Math.PI * num) - 1) / 2;
    },
    "easeInCubic": (num) => {
        return num * num * num;
    },
    "easeOutCubic": (num) => {
        return 1 - Math.pow(1 - num, 3);
    },
    "easeInOutCubic": (num) => {
        return num < 0.5 ? 4 * num * num * num : 1 - Math.pow(-2 * num + 2, 3) / 2;
    }
};

/**
 * @param {("linear"|"easeIn"|"easeOut"|"easeInOut"|"easeInCubic"|"easeOutCubic"|"easeInOutCubic")} key 
 * @param {number} value 
 */
function easing(key, value) {
    return ease[key](value);
}

export function between(num1, num2, percent) {
    return num2 + (num1 - num2) * percent;
}

export class Animation {
    constructor(node) {
        /**
         * @type {HTMLElement}
         */
        this.node = node;

        /**
         * @private
         */
        this.listeners = {};

        /**
         * @private
         */
        this.frameId = null;
        /**
         * @private
         */
        this.startTime = null;
        /**
         * @private
         */
        this.duration = 0;
        /**
         * @private
         */
        this.delay = 0;
        /**
         * @private
         */
        this.delayBetweenFrames = 0;
        /**
         * @private
         */
        this.mode = Animation.MODE.FORWARD;
        this.completeOnEnd = true;

        /**
         * @type {("linear"|"easeIn"|"easeOut"|"easeInOut"|"easeInCubic"|"easeOutCubic"|"easeInOutCubic")}
         */
        this.ease = "linear";
    }

    static MODE = Object.freeze({
        FORWARD: 0,
        BACKWARD: 1
    });

    /**
     * @private
     */
    on(event, cb) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        
        if (typeof cb !== 'function') {
            return;
        }

        this.listeners[event].push(cb);
    }

    emit(event, data) {
        let cbs = this.listeners[event];
        if (cbs) {
            cbs.forEach(cb => cb(data));
        }
    }

    /**
     * @param {function({number, HTMLElement})} value 
     */
    set onframe(value) {
        // this.progress = value;
        this.on("onprogress", value);
    }

    /**
     * @param {function()} value
     */
    set onend(value) {
        this.on("onend", value);
    }

    /**
     * @param {function()} value
     */
    set onstart(value) {
        this.on("onstart", value);
    }

    /**
     * @private
     */
    _invoke(percent) {
        percent = easing(this.ease, percent);
        
        if (this.mode === Animation.MODE.BACKWARD) {
            percent = 1 - percent;
        }

        this.emit("onprogress", {
            percent: percent,
            node: this.node
        });
    }

    stop() {
        clearTimeout(this.timerEnd);
        clearTimeout(this.timerDelay);
        cancelAnimationFrame(this.frameId);
        
        if (this.completeOnEnd) {
            this._invoke(1);
        }

        this.timerEnd = null;
        this.startTime = null;
        this.emit && this.emit("onend", null);
    }

    /**
     * @private
     */
    _configureEnd() {
        // this.timerEnd = setTimeout(() => this.stop(), this.duration);
    }

    start(duration, delay = 0, delayBetweenFrames = 0) {
        this.duration = duration;
        this.delay = delay;
        this.delayBetweenFrames = delayBetweenFrames;

        this._configureEnd()
        this.emit("onstart", null);

        const l_start = () => {
            if (this.duration <= 0) {
                this._invoke(1);
            } else {
                this._invoke(0);
                this.startTime = performance.now();
                this.frameId = requestAnimationFrame(() => this._frame());
            }
        }
        
        if (this.delay > 0) {
            setTimeout(() => l_start(), this.delay);
        } else {
            l_start();
        }
    }

    // pause() {
    //     clearTimeout(this.timerEnd);
    //     clearTimeout(this.timerDelay);
    //     cancelAnimationFrame(this.frameId);
    // }

    /**
     * @private
     */
    _frame() {
        const elapsed = performance.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        this._invoke(progress);
        if (progress < 1) {
            if (this.delayBetweenFrames > 0) {
                this.timerDelay = setTimeout(() => requestAnimationFrame(() => this._frame()),
                    this.delayBetweenFrames);
                
                return;
            }

            this.frameId = requestAnimationFrame(() => this._frame());
        } else {
            this.stop();
        }
    }

    reverse() {
        this.mode = Animation.MODE.BACKWARD;
        this.start(this.duration, this.delay, this.delayBetweenFrames);
    }
}