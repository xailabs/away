# @xailabs/away

Fork of [away](https://www.npmjs.com/package/away)

detect idle users on webpages

```js
var away = require('away');

// detect users who are idle for 10 seconds
var timer = away(10000);
timer.on('idle', function(tab) {
    console.log('user is idle');
    if (tab) console.log('>> user switched to another tab');
});
timer.on('active', function() {
    console.log('user is active');
    if (tab) console.log('>> user switched back from another tab');
});
```

# Fork:

- ES6 rewrite, transpiled via babel
- Use passive events when possible
- Detect tab change: User leaves tab -> idle, user comes back -> active

## api

```away()``` returns a Timer object which exposes the following methods.

### .on('idle', fn)
Call ```fn``` when user becomes idle.

### .on('active', fn)
Call ```fn``` when user becomes active after having been idle.

### .stop()
Stop the idle timer from detecting user activity

### .start()
Start the idle timer. (By default the idle timer is started automatically)

## options

```idle()``` accepts a second argument with additional options.

### element
The dom element to monitor for activity. (default ```document```)

### timeout
Milliseconds before user is considered idle. (default ```30000```)

### events
String of DOM events that will trigger activity. (see index.js for default)

### eventOptions
Value for the third argument in `addEventListener`. (if passive events are supported, the default is ```{passive: true}```, otherwise it is ```false```)

### start
Whether to start idle timer upon creation. (default ```true```)

### tab
Whether to detect tab changes (default ```true```)  
When the user switches between tabs, all `idle` and `active` callbacks are invoked with a boolean `true`.

- When the user switches to another tab, all `idle` callbacks are invoked
- When the user switches back from another tab, all `active` callbacks are invoked

Use the boolean flag if you need to react to state changes due to tab switching (as opposed to user activity/idleness while the tab is active)

## install

```
npm install away
```

## credits

Inspired by the [jquery-idletimer](https://github.com/mikesherov/jquery-idletimer) plugin.
