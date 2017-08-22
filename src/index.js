import detectPassiveEvents from 'detect-passive-events';

export default function idle(timeout, options) {
    return new Idle(timeout, options);
};

// default settings
var defaults = {
    //start as soon as timer is set up
    start: true,
    // timer is enabled
    enabled: true,
    // amount of time before timer fires
    timeout: 30000,
    // what element to attach to
    element: document,
    // activity is one of these events
    events: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove',
    // the third argument for `addEventListener`/`removeEventListener`.
    eventOptions: detectPassiveEvents.hasSupport ? {passive: true} : false,
    // whether to detect that the user leaves or enters the tab.
    tab: true
};


class Idle {

    constructor(timeout, options={}) {

        this.options = {
            ...defaults,
            ...options
        };

        this.state = {
            timeout: timeout,
            idle: this.options.idle,
            enabled: this.options.enabled,
            idle_fn: [],
            active_fn: []
        };

        // wrapper to pass state to toggleState
        this.state.state_fn = () => toggleState(this.state);

        if (this.options.start) {
            this.start();
        }

    }

    start = () => {
        enable(this);
        if (this.options.tab && document.addEventListener) {
            document.addEventListener('visibilitychange', this._handleVisibility);
        }
    };

    stop = () => {
        disable(this);
        if (this.options.tab && document.removeEventListener) {
            document.removeEventListener('visibilitychange', this._handleVisibility);
        }
    };

    // 'idle' | 'active'
    on = (what, fn) => {
        this.state[`${what}_fn`].push(fn);
    };

    off = (what, fn) => {
        this.state[`${what}_fn`] = this.state[`${what}_fn`].filter(f => f !== fn);
    };

    _handleVisibility = () => {
        if (document.hidden) {
            this.state.idle_fn.forEach(fn => fn(true));
            disable(this);
        } else  {
            this.state.active_fn.forEach(fn => fn(true));
            enable(this);
        }
    };
}






/// private api


// Starts the idle timer. Adds appropriate event handlers
function enable(instance) {
    const {state, options} = instance;

    function handler(ev) {
        // clear any current timeout
        window.clearTimeout(state.timer_id);

        if (!state.enabled) {
            return;
        }

        if (state.idle) {
            toggleState(state);
        }

        state.timer_id = window.setTimeout(state.state_fn, state.timeout);
    } 

    // to remove later
    state.handler = handler;

    const events = options.events.split(' ');
    events.forEach(event => attach(options.element, event, handler, options.eventOptions));
    state.timer_id = window.setTimeout(state.state_fn, state.timeout);
}

// Stops the idle timer. This removes appropriate event handlers
// and cancels any pending timeouts.
function disable(instance) {

    const {state, options} = instance;

    state.enabled = false;

    //clear any pending timeouts
    window.clearTimeout(state.timer_id);

    // detach handlers
    const events = options.events.split(' ');
    events.forEach(event => detach(options.element, event, state.handler, options.eventOptions));
}

// Toggles the idle state and fires an appropriate event.
// borrowed from jquery-idletimer (see readme for link)
function toggleState(state) {
    // toggle the state
    state.idle = !state.idle;

    // reset timeout
    var elapsed = ( +new Date() ) - state.olddate;
    state.olddate = +new Date();

    // handle Chrome always triggering idle after js alert or comfirm popup
    if (state.idle && (elapsed < state.timeout)) {
        state.idle = false;
        window.clearTimeout(state.timer_id);
        if (state.enabled) {
            state.timer_id = window.setTimeout(state.state_fn, state.timeout);
        }
        return;
    }

    // fire event
    var event = state.idle ? 'idle' : 'active';

    var fns = (event === 'idle') ? state.idle_fn : state.active_fn;
    fns.forEach(fn => fn());
}

// TODO (shtylman) detect at startup to avoid if during runtime?
var attach = function(element, event, fn, eventOptions=false) {
    if (element.addEventListener) {
        element.addEventListener(event, fn, eventOptions);
    }
    else if (element.attachEvent) {
        element.attachEvent('on' + event, fn);
    }
};

var detach = function(element, event, fn, eventOptions=false) {
    if (element.removeEventListener) {
        element.removeEventListener(event, fn, eventOptions);
    }
    else if (element.detachEvent) {
        element.detachEvent('on' + event, fn);
    }
};

