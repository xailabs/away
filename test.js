import assert from 'assert';
import synth from 'synthetic-dom-events';

import idle from './src';

const move = function(element) {
    const ev = synth('mousemove');
    if (element.dispatchEvent) {
        element.dispatchEvent(ev);
    }
    else {
        element.fireEvent('onmousemove', ev);
    }
};

test('create', function() {
    const timer = idle(1000);
    timer.stop();
});

test('idle', function(done) {
    const timer = idle(1000);
    let elapsed = false;

    setTimeout(function() {
        elapsed = true;
    }, 900);
    timer.on('idle', function() {
        timer.stop();
        assert.ok(elapsed);
        done();
    });
    timer.on('active', function() {
        assert.ok(false);
    });
});

test('stop', function(done) {
    const timer = idle(1000);

    setTimeout(function() {
        timer.stop();
    }, 500);

    setTimeout(function() {
        done();
    }, 1500);

    timer.on('idle', function() {
        assert.ok(false);
    });
    timer.on('active', function() {
        assert.ok(false);
    });
});

test('active', function(done) {
    const timer = idle(1000);
    timer.on('idle', function() {
        move(document);
    });
    timer.on('active', function() {
        timer.stop();
        done();
    });
});
