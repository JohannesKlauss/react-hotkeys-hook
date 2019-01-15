"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var hotkeys_js_1 = tslib_1.__importDefault(require("hotkeys-js"));
var react_1 = require("react");
function useHotKeys(keys, callback) {
    react_1.useEffect(function () {
        hotkeys_js_1.default(keys, function (event, handler) { return callback(event, handler); });
        return function cleanUp() {
            hotkeys_js_1.default.unbind(keys);
        };
    });
}
exports.default = useHotKeys;
//# sourceMappingURL=index.js.map