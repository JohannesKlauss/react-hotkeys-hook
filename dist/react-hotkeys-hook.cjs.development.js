'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

var reservedModifierKeywords = ['shift', 'alt', 'meta', 'mod', 'ctrl'];
var mappedKeys = {
  esc: 'escape',
  "return": 'enter',
  '.': 'period',
  ',': 'comma',
  '-': 'slash',
  ' ': 'space',
  '`': 'backquote',
  '#': 'backslash',
  '+': 'bracketright',
  'ShiftLeft': 'shift',
  'ShiftRight': 'shift',
  'AltLeft': 'alt',
  'AltRight': 'alt',
  'MetaLeft': 'meta',
  'MetaRight': 'meta',
  'ControlLeft': 'ctrl',
  'ControlRight': 'ctrl'
};
function mapKey(key) {
  return (mappedKeys[key] || key).trim().toLowerCase().replace('key', '').replace('digit', '').replace('numpad', '').replace('arrow', '');
}
function isHotkeyModifier(key) {
  return reservedModifierKeywords.includes(key);
}
function parseKeysHookInput(keys, splitKey) {
  if (splitKey === void 0) {
    splitKey = ',';
  }
  if (typeof keys === 'string') {
    return keys.split(splitKey);
  }
  return keys;
}
function parseHotkey(hotkey, combinationKey) {
  if (combinationKey === void 0) {
    combinationKey = '+';
  }
  var keys = hotkey.toLocaleLowerCase().split(combinationKey).map(function (k) {
    return mapKey(k);
  });
  var modifiers = {
    alt: keys.includes('alt'),
    ctrl: keys.includes('ctrl') || keys.includes('control'),
    shift: keys.includes('shift'),
    meta: keys.includes('meta'),
    mod: keys.includes('mod')
  };
  var singleCharKeys = keys.filter(function (k) {
    return !reservedModifierKeywords.includes(k);
  });
  return _extends({}, modifiers, {
    keys: singleCharKeys
  });
}

var currentlyPressedKeys = /*#__PURE__*/new Set();
function isHotkeyPressed(key, splitKey) {
  if (splitKey === void 0) {
    splitKey = ',';
  }
  var hotkeyArray = Array.isArray(key) ? key : key.split(splitKey);
  return hotkeyArray.every(function (hotkey) {
    return currentlyPressedKeys.has(hotkey.trim().toLowerCase());
  });
}
function pushToCurrentlyPressedKeys(key) {
  var hotkeyArray = Array.isArray(key) ? key : [key];
  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (currentlyPressedKeys.has('meta')) {
    currentlyPressedKeys.forEach(function (key) {
      return !isHotkeyModifier(key) && currentlyPressedKeys["delete"](key.toLowerCase());
    });
  }
  hotkeyArray.forEach(function (hotkey) {
    return currentlyPressedKeys.add(hotkey.toLowerCase());
  });
}
function removeFromCurrentlyPressedKeys(key) {
  var hotkeyArray = Array.isArray(key) ? key : [key];
  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (key === 'meta') {
    currentlyPressedKeys.clear();
  } else {
    hotkeyArray.forEach(function (hotkey) {
      return currentlyPressedKeys["delete"](hotkey.toLowerCase());
    });
  }
}
(function () {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', function (e) {
      if (e.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }
      pushToCurrentlyPressedKeys([mapKey(e.key), mapKey(e.code)]);
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }
      removeFromCurrentlyPressedKeys([mapKey(e.key), mapKey(e.code)]);
    });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('blur', function () {
      currentlyPressedKeys.clear();
    });
  }
})();

function maybePreventDefault(e, hotkey, preventDefault) {
  if (typeof preventDefault === 'function' && preventDefault(e, hotkey) || preventDefault === true) {
    e.preventDefault();
  }
}
function isHotkeyEnabled(e, hotkey, enabled) {
  if (typeof enabled === 'function') {
    return enabled(e, hotkey);
  }
  return enabled === true || enabled === undefined;
}
function isKeyboardEventTriggeredByInput(ev) {
  return isHotkeyEnabledOnTag(ev, ['input', 'textarea', 'select']);
}
function isHotkeyEnabledOnTag(_ref, enabledOnTags) {
  var _target$parentElement;
  var target = _ref.target;
  if (enabledOnTags === void 0) {
    enabledOnTags = false;
  }
  var targetTagName = target && target.tagName;
  // Enable hotkeys on components with enableHotkeys data property
  var enableHotkeys = !!(target && target.dataset.enableHotkeys) || !!(target && target != null && (_target$parentElement = target.parentElement) != null && _target$parentElement.dataset.enableHotkeys);
  if (enableHotkeys) {
    return true;
  }
  if (enabledOnTags instanceof Array) {
    return Boolean(targetTagName && enabledOnTags && enabledOnTags.some(function (tag) {
      return tag.toLowerCase() === targetTagName.toLowerCase();
    }));
  }
  return Boolean(targetTagName && enabledOnTags && enabledOnTags === true);
}
function isScopeActive(activeScopes, scopes) {
  if (activeScopes.length === 0 && scopes) {
    console.warn('A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>');
    return true;
  }
  if (!scopes) {
    return true;
  }
  return activeScopes.some(function (scope) {
    return scopes.includes(scope);
  }) || activeScopes.includes('*');
}
var isHotkeyMatchingKeyboardEvent = function isHotkeyMatchingKeyboardEvent(e, hotkey, ignoreModifiers) {
  if (ignoreModifiers === void 0) {
    ignoreModifiers = false;
  }
  var alt = hotkey.alt,
    meta = hotkey.meta,
    mod = hotkey.mod,
    shift = hotkey.shift,
    ctrl = hotkey.ctrl,
    keys = hotkey.keys;
  var pressedKeyUppercase = e.key,
    code = e.code,
    ctrlKey = e.ctrlKey,
    metaKey = e.metaKey,
    shiftKey = e.shiftKey,
    altKey = e.altKey;
  var keyCode = mapKey(code);
  var pressedKey = pressedKeyUppercase.toLowerCase();
  if (!ignoreModifiers) {
    // We check the pressed keys for compatibility with the keyup event. In keyup events the modifier flags are not set.
    if (alt === !altKey && pressedKey !== 'alt') {
      return false;
    }
    if (shift === !shiftKey && pressedKey !== 'shift') {
      return false;
    }
    // Mod is a special key name that is checking for meta on macOS and ctrl on other platforms
    if (mod) {
      if (!metaKey && !ctrlKey) {
        return false;
      }
    } else {
      if (meta === !metaKey && pressedKey !== 'meta') {
        return false;
      }
      if (ctrl === !ctrlKey && pressedKey !== 'ctrl') {
        return false;
      }
    }
  }
  // All modifiers are correct, now check the key
  // If the key is set, we check for the key
  if (keys && keys.length === 1 && (keys.includes(pressedKey) || keys.includes(keyCode))) {
    return true;
  } else if (keys) {
    // Check if all keys are present in pressedDownKeys set
    return isHotkeyPressed(keys);
  } else if (!keys) {
    // If the key is not set, we only listen for modifiers, that check went alright, so we return true
    return true;
  }
  // There is nothing that matches.
  return false;
};

var BoundHotkeysProxyProvider = /*#__PURE__*/react.createContext(undefined);
var useBoundHotkeysProxy = function useBoundHotkeysProxy() {
  return react.useContext(BoundHotkeysProxyProvider);
};
function BoundHotkeysProxyProviderProvider(_ref) {
  var addHotkey = _ref.addHotkey,
    removeHotkey = _ref.removeHotkey,
    children = _ref.children;
  return /*#__PURE__*/jsxRuntime.jsx(BoundHotkeysProxyProvider.Provider, {
    value: {
      addHotkey: addHotkey,
      removeHotkey: removeHotkey
    },
    children: children
  });
}

function deepEqual(x, y) {
  //@ts-ignore
  return x && y && typeof x === 'object' && typeof y === 'object'
  //@ts-ignore
  ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce(function (isEqual, key) {
    return isEqual && deepEqual(x[key], y[key]);
  }, true) : x === y;
}

var HotkeysContext = /*#__PURE__*/react.createContext({
  hotkeys: [],
  enabledScopes: [],
  toggleScope: function toggleScope() {},
  enableScope: function enableScope() {},
  disableScope: function disableScope() {}
});
var useHotkeysContext = function useHotkeysContext() {
  return react.useContext(HotkeysContext);
};
var HotkeysProvider = function HotkeysProvider(_ref) {
  var _ref$initiallyActiveS = _ref.initiallyActiveScopes,
    initiallyActiveScopes = _ref$initiallyActiveS === void 0 ? ['*'] : _ref$initiallyActiveS,
    children = _ref.children;
  var _useState = react.useState((initiallyActiveScopes == null ? void 0 : initiallyActiveScopes.length) > 0 ? initiallyActiveScopes : ['*']),
    internalActiveScopes = _useState[0],
    setInternalActiveScopes = _useState[1];
  var _useState2 = react.useState([]),
    boundHotkeys = _useState2[0],
    setBoundHotkeys = _useState2[1];
  var enableScope = react.useCallback(function (scope) {
    setInternalActiveScopes(function (prev) {
      if (prev.includes('*')) {
        return [scope];
      }
      return Array.from(new Set([].concat(prev, [scope])));
    });
  }, []);
  var disableScope = react.useCallback(function (scope) {
    setInternalActiveScopes(function (prev) {
      if (prev.filter(function (s) {
        return s !== scope;
      }).length === 0) {
        return ['*'];
      } else {
        return prev.filter(function (s) {
          return s !== scope;
        });
      }
    });
  }, []);
  var toggleScope = react.useCallback(function (scope) {
    setInternalActiveScopes(function (prev) {
      if (prev.includes(scope)) {
        if (prev.filter(function (s) {
          return s !== scope;
        }).length === 0) {
          return ['*'];
        } else {
          return prev.filter(function (s) {
            return s !== scope;
          });
        }
      } else {
        if (prev.includes('*')) {
          return [scope];
        }
        return Array.from(new Set([].concat(prev, [scope])));
      }
    });
  }, []);
  var addBoundHotkey = react.useCallback(function (hotkey) {
    setBoundHotkeys(function (prev) {
      return [].concat(prev, [hotkey]);
    });
  }, []);
  var removeBoundHotkey = react.useCallback(function (hotkey) {
    setBoundHotkeys(function (prev) {
      return prev.filter(function (h) {
        return !deepEqual(h, hotkey);
      });
    });
  }, []);
  return /*#__PURE__*/jsxRuntime.jsx(HotkeysContext.Provider, {
    value: {
      enabledScopes: internalActiveScopes,
      hotkeys: boundHotkeys,
      enableScope: enableScope,
      disableScope: disableScope,
      toggleScope: toggleScope
    },
    children: /*#__PURE__*/jsxRuntime.jsx(BoundHotkeysProxyProviderProvider, {
      addHotkey: addBoundHotkey,
      removeHotkey: removeBoundHotkey,
      children: children
    })
  });
};

function useDeepEqualMemo(value) {
  var ref = react.useRef(undefined);
  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

var stopPropagation = function stopPropagation(e) {
  e.stopPropagation();
  e.preventDefault();
  e.stopImmediatePropagation();
};
var useSafeLayoutEffect = typeof window !== 'undefined' ? react.useLayoutEffect : react.useEffect;
function useHotkeys(keys, callback, options, dependencies) {
  var ref = react.useRef(null);
  var hasTriggeredRef = react.useRef(false);
  var _options = !(options instanceof Array) ? options : !(dependencies instanceof Array) ? dependencies : undefined;
  var _deps = options instanceof Array ? options : dependencies instanceof Array ? dependencies : undefined;
  var memoisedCB = react.useCallback(callback, _deps != null ? _deps : []);
  var cbRef = react.useRef(memoisedCB);
  if (_deps) {
    cbRef.current = memoisedCB;
  } else {
    cbRef.current = callback;
  }
  var memoisedOptions = useDeepEqualMemo(_options);
  var _useHotkeysContext = useHotkeysContext(),
    enabledScopes = _useHotkeysContext.enabledScopes;
  var proxy = useBoundHotkeysProxy();
  useSafeLayoutEffect(function () {
    if ((memoisedOptions == null ? void 0 : memoisedOptions.enabled) === false || !isScopeActive(enabledScopes, memoisedOptions == null ? void 0 : memoisedOptions.scopes)) {
      return;
    }
    var listener = function listener(e, isKeyUp) {
      var _e$target;
      if (isKeyUp === void 0) {
        isKeyUp = false;
      }
      if (isKeyboardEventTriggeredByInput(e) && !isHotkeyEnabledOnTag(e, memoisedOptions == null ? void 0 : memoisedOptions.enableOnFormTags)) {
        return;
      }
      // TODO: SINCE THE EVENT IS NOW ATTACHED TO THE REF, THE ACTIVE ELEMENT CAN NEVER BE INSIDE THE REF. THE HOTKEY ONLY TRIGGERS IF THE
      // REF IS THE ACTIVE ELEMENT. THIS IS A PROBLEM SINCE FOCUSED SUB COMPONENTS WON'T TRIGGER THE HOTKEY.
      if (ref.current !== null && document.activeElement !== ref.current && !ref.current.contains(document.activeElement)) {
        stopPropagation(e);
        return;
      }
      if ((_e$target = e.target) != null && _e$target.isContentEditable && !(memoisedOptions != null && memoisedOptions.enableOnContentEditable)) {
        return;
      }
      parseKeysHookInput(keys, memoisedOptions == null ? void 0 : memoisedOptions.splitKey).forEach(function (key) {
        var _hotkey$keys;
        var hotkey = parseHotkey(key, memoisedOptions == null ? void 0 : memoisedOptions.combinationKey);
        if (isHotkeyMatchingKeyboardEvent(e, hotkey, memoisedOptions == null ? void 0 : memoisedOptions.ignoreModifiers) || (_hotkey$keys = hotkey.keys) != null && _hotkey$keys.includes('*')) {
          if (isKeyUp && hasTriggeredRef.current) {
            return;
          }
          maybePreventDefault(e, hotkey, memoisedOptions == null ? void 0 : memoisedOptions.preventDefault);
          if (!isHotkeyEnabled(e, hotkey, memoisedOptions == null ? void 0 : memoisedOptions.enabled)) {
            stopPropagation(e);
            return;
          }
          // Execute the user callback for that hotkey
          cbRef.current(e, hotkey);
          if (!isKeyUp) {
            hasTriggeredRef.current = true;
          }
        }
      });
    };
    var handleKeyDown = function handleKeyDown(event) {
      if (event.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }
      pushToCurrentlyPressedKeys(mapKey(event.code));
      if ((memoisedOptions == null ? void 0 : memoisedOptions.keydown) === undefined && (memoisedOptions == null ? void 0 : memoisedOptions.keyup) !== true || memoisedOptions != null && memoisedOptions.keydown) {
        listener(event);
      }
    };
    var handleKeyUp = function handleKeyUp(event) {
      if (event.key === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }
      removeFromCurrentlyPressedKeys(mapKey(event.code));
      hasTriggeredRef.current = false;
      if (memoisedOptions != null && memoisedOptions.keyup) {
        listener(event, true);
      }
    };
    // @ts-ignore
    (ref.current || (_options == null ? void 0 : _options.document) || document).addEventListener('keyup', handleKeyUp);
    // @ts-ignore
    (ref.current || (_options == null ? void 0 : _options.document) || document).addEventListener('keydown', handleKeyDown);
    if (proxy) {
      parseKeysHookInput(keys, memoisedOptions == null ? void 0 : memoisedOptions.splitKey).forEach(function (key) {
        return proxy.addHotkey(parseHotkey(key, memoisedOptions == null ? void 0 : memoisedOptions.combinationKey));
      });
    }
    return function () {
      // @ts-ignore
      (ref.current || (_options == null ? void 0 : _options.document) || document).removeEventListener('keyup', handleKeyUp);
      // @ts-ignore
      (ref.current || (_options == null ? void 0 : _options.document) || document).removeEventListener('keydown', handleKeyDown);
      if (proxy) {
        parseKeysHookInput(keys, memoisedOptions == null ? void 0 : memoisedOptions.splitKey).forEach(function (key) {
          return proxy.removeHotkey(parseHotkey(key, memoisedOptions == null ? void 0 : memoisedOptions.combinationKey));
        });
      }
    };
  }, [keys, memoisedOptions, enabledScopes]);
  return ref;
}

function useRecordHotkeys() {
  var _useState = react.useState(new Set()),
    keys = _useState[0],
    setKeys = _useState[1];
  var _useState2 = react.useState(false),
    isRecording = _useState2[0],
    setIsRecording = _useState2[1];
  var handler = react.useCallback(function (event) {
    if (event.key === undefined) {
      // Synthetic event (e.g., Chrome autofill).  Ignore.
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setKeys(function (prev) {
      var newKeys = new Set(prev);
      newKeys.add(mapKey(event.code));
      return newKeys;
    });
  }, []);
  var stop = react.useCallback(function () {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handler);
      setIsRecording(false);
    }
  }, [handler]);
  var start = react.useCallback(function () {
    setKeys(new Set());
    if (typeof document !== 'undefined') {
      stop();
      document.addEventListener('keydown', handler);
      setIsRecording(true);
    }
  }, [handler, stop]);
  return [keys, {
    start: start,
    stop: stop,
    isRecording: isRecording
  }];
}

exports.HotkeysProvider = HotkeysProvider;
exports.isHotkeyPressed = isHotkeyPressed;
exports.useHotkeys = useHotkeys;
exports.useHotkeysContext = useHotkeysContext;
exports.useRecordHotkeys = useRecordHotkeys;
//# sourceMappingURL=react-hotkeys-hook.cjs.development.js.map
