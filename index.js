var ZooObject = module.exports = function (parent) {
    if (parent) {
        this.__proto__ = parent;
    }
};

ZooObject.run = function (zoo, scope) {
    try {
        var keyStack = [];
        var valStack = [];
        var lastResult;
        var keyMode = true;
        var returnLastResult = false;
        var code = scope['#code'];

        /**
         * Code is of format [[sym, data, line, column], ...]
         */
        for (var seq in code) {
            var sym = code[seq][0];
            var data = code[seq][1];

            if (sym === 'b' || (sym === 'x' && data === ',')) {

                /**
                 * Was not actually a key since we hit a break
                 */
                if (keyMode) {
                    if (keyStack.length) {
                        lastResult = zoo.expr(scope, keyStack);
                        returnLastResult = true;
                    }
                }

                /**
                 * Set a key-value pair on scope
                 */
                else {
                    if (!valStack.length) {
                        throw new Error('value must exist');
                    }
                    var key = zoo.expr(scope, keyStack);
                    if (zoo.typename(key) !== 'string') {
                        throw new Error('key must be a string');
                    }
                    scope[key] = zoo.expr(scope, valStack);
                    returnLastResult = false;
                }

                keyMode = false;
            }

            else if (sym === 'x' && data === ':') {
                if (!keyStack.length) {
                    throw new Error('key must exist');
                }
                keyMode = false;
            }

            else {
                (keyMode ? keyStack : valStack).push(code[seq]);
            }
        }

        if (returnLastResult) {
            return last;
        }

        return scope;
    }
    catch (e) {
        e.message += ' (on line ' + code[seq][2] + ' column ' + code[seq][3] + ')';
        throw e;
    }
};
