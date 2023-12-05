import { clamp } from "./utils";

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
    return num1 + (num2 - num1) * percent;
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

        this.mode = Animation.MODE.FORWARD;
        this.completeOnEnd = true;

        /**
         * @private
         */
        this.timerEnd = null;
        /**
         * @private
         */
        this.timerDelay = null;

        this.initialEnd = true;
        this.initialStart = true;
        
        /**
         * @private
         */
        this.pausedTime = 0;
        /**
         * @private
         */
        this.resumedTime = 0;

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

    /**
     * @private
     */
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
        this.on("onprogress", value);
    }

    /**
     * @param {function({boolean})} value
     */
    set onend(value) {
        this.on("onend", value);
    }

    /**
     * @param {function({boolean})} value
     */
    set onstart(value) {
        this.on("onstart", value);
    }

    /**
     * @param {function()} value
     */
    set onresume(value) {
        this.on("onresume", value);
    }

    /**
     * @param {function()} value
     */
    set onpause(value) {
        this.on("onpause", value);
    }

    /**
     * @private
     */
    _invoke(percent = null) {
        const now = performance.now();
        const elapsed = (now - this.resumedTime) - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        let value = percent !== null ?
            clamp(0, 1, percent) : progress;
        
        value = easing(this.ease, value);

        if (this.mode === Animation.MODE.BACKWARD) {
            value = 1 - value;
        }

        this.emit("onprogress", {
            percent: value,
            node: this.node,
            elapsed
        });

        return progress;
    }

    /**
     * @private
     */
    _cancel() {
        clearTimeout(this.timerEnd);
        clearTimeout(this.timerDelay);
        cancelAnimationFrame(this.frameId);
        this.timerEnd = null;
        this.timerDelay = null;
        this.frameId = null;
        this.playing = false;
        this.pausedTime = 0;
        // this.resumedTime = 0;
    }

    stop() {
        this._cancel();
        
        if (this.completeOnEnd) {
            this._invoke(1);
        }

        this.emit("onend", { initial: this.initialEnd });
        this.initialEnd = false;
    }

    /**
     * @private
     */
    _configureEnd() {
        // known issue:
        // if paused, ending before it reaches the end
        // removed for now.

        let duration;
        if (this.pausedTime) {
            duration = this.duration - (this.pausedTime - this.startTime);
        } else {
            duration = this.duration;
        }

        const timeout = duration + this.delay + this.delayBetweenFrames;
        this.timerEnd = setTimeout(() => this.stop(), timeout);
    }

    /**
     * @private
     */
    _start() {
        // this._configureEnd();

        this.playing = true;
        this.paused = false;

        this.resumedTime = 0;
        this.startTime = performance.now();
        this._invoke();
        this.frameId = requestAnimationFrame(() => this._frame());
    }

    start(duration, delay = 0, delayBetweenFrames = 0) {
        this.duration = duration;
        this.delay = delay;
        this.delayBetweenFrames = delayBetweenFrames;
        
        this.emit("onstart", { initial: this.initialStart });
        this.initialStart = false;
        
        if (this.duration <= 0) {
            this._invoke(1);
            return;
        } 

        setTimeout(() => this._start(), this.delay);
    }

    resume() {
        if (this.playing) return;
        if (!this.paused) return;

        // this._configureEnd();
        this.emit("onresume", null);

        if (this.duration <= 0) {
            this._invoke(1);
            return;
        }
        
        // this._configureEnd();

        this.playing = true;
        this.paused = false;
        this.resumedTime += performance.now() - this.pausedTime;

        this._invoke();
        this.frameId = requestAnimationFrame(() => this._frame());
    }

    pause() {
        if (!this.playing) return;
        if (this.paused) return;

        this._cancel();
        this.paused = true;
        this.pausedTime = performance.now();
        this.emit("onpause", { pausedTime: this.pausedTime });
    }

    /**
     * @private
     */
    _frame() {
        if (this.paused) return;

        const progress = this._invoke();
        if (progress < 1) {
            this.timerDelay = setTimeout(() => {
                this.frameId = requestAnimationFrame(() => this._frame());
            }, this.delayBetweenFrames);
        } else {
            this.stop();
        }
    }

    reverse() {
        this.mode = Animation.MODE.BACKWARD;
        this.start(this.duration, this.delay, this.delayBetweenFrames);
    }
}

// returns string for css;
const px = (num) => num + 'px';

export class AnimationNodeHelper {
    /**
     * @param {HTMLElement} node
     * @param {{x, y}?} start 
     * @param {{x, y}} end 
     * @param {number} duration 
     * @param {("linear"|"easeIn"|"easeOut"|"easeInOut"|"easeInCubic"|"easeOutCubic"|"easeInOutCubic")} ease 
     * @param {{x: ("left"|"right"), y: ("top"|"bottom")}} direction
     * @param {function(boolean)} onEnd
     * @param {function(boolean)} onStart
     */
    static move(node, start, end, duration, ease, direction, onEnd = null, onStart = null) {
        const animation = new Animation(node);

        if (start === null) {
            start = {
                x: parseInt(node.style.left),
                y: parseInt(node.style.top)
            }

            if (!start.x || !start.y) {
                start = {
                    x: 0,
                    y: 0
                }
            }
        }

        if (!direction) {
            direction = {
                x: "left",
                y: "top"
            };
        } else {
            if (!direction.x) direction.x = 'left';
            if (!direction.y) direction.y = 'top';
        }

        animation.ease = ease;
        animation.onstart = ({ initial }) => {
            node.style[direction.y] = px(start.y);
            node.style[direction.x] = px(start.x);

            if (onStart) onStart(initial);
        }
        animation.onend = ({ initial }) => {
            if (onEnd) onEnd(initial);
        }
        animation.onframe = ({ percent }) => {
            node.style[direction.y] = px(between(start.y, end.y, percent));
            node.style[direction.x] = px(between(start.x, end.x, percent));
        }

        animation.start(duration);
        
        return {
            stop: animation.stop.bind(animation),
            reverse: animation.reverse.bind(animation),
            pause: animation.pause.bind(animation),
            resume: animation.resume.bind(animation)
        }
    }
}