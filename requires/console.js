var origlog = console.log;

console.log = function (obj, ...placeholders) {
    if (typeof obj === 'string')
        placeholders.unshift("[" + new Date().toISOString() + "] " + obj);
    else {
        // This handles console.log( object )
        placeholders.unshift(obj);
        placeholders.unshift(Date.now() + " %j");
    }

    origlog.apply(this, placeholders);
};

exports.origlog = origlog;

