var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// tamagui.config.ts
var tamagui_config_exports = {};
__export(tamagui_config_exports, {
  default: () => tamagui_config_default2
});
module.exports = __toCommonJS(tamagui_config_exports);

// src/components/Editor/ui/src/tamagui/tamagui.config.ts
var import_core2 = require("@tamagui/core");

// node_modules/@tamagui/shorthands/dist/esm/index.mjs
var shorthands = {
  // web-only
  ussel: "userSelect",
  cur: "cursor",
  // tamagui
  pe: "pointerEvents",
  // text
  col: "color",
  ff: "fontFamily",
  fos: "fontSize",
  fost: "fontStyle",
  fow: "fontWeight",
  ls: "letterSpacing",
  lh: "lineHeight",
  ta: "textAlign",
  tt: "textTransform",
  ww: "wordWrap",
  // view
  ac: "alignContent",
  ai: "alignItems",
  als: "alignSelf",
  b: "bottom",
  bc: "backgroundColor",
  bg: "backgroundColor",
  bbc: "borderBottomColor",
  bblr: "borderBottomLeftRadius",
  bbrr: "borderBottomRightRadius",
  bbw: "borderBottomWidth",
  blc: "borderLeftColor",
  blw: "borderLeftWidth",
  boc: "borderColor",
  br: "borderRadius",
  bs: "borderStyle",
  brw: "borderRightWidth",
  brc: "borderRightColor",
  btc: "borderTopColor",
  btlr: "borderTopLeftRadius",
  btrr: "borderTopRightRadius",
  btw: "borderTopWidth",
  bw: "borderWidth",
  dsp: "display",
  f: "flex",
  fb: "flexBasis",
  fd: "flexDirection",
  fg: "flexGrow",
  fs: "flexShrink",
  fw: "flexWrap",
  h: "height",
  jc: "justifyContent",
  l: "left",
  m: "margin",
  mah: "maxHeight",
  maw: "maxWidth",
  mb: "marginBottom",
  mih: "minHeight",
  miw: "minWidth",
  ml: "marginLeft",
  mr: "marginRight",
  mt: "marginTop",
  mx: "marginHorizontal",
  my: "marginVertical",
  o: "opacity",
  ov: "overflow",
  p: "padding",
  pb: "paddingBottom",
  pl: "paddingLeft",
  pos: "position",
  pr: "paddingRight",
  pt: "paddingTop",
  px: "paddingHorizontal",
  py: "paddingVertical",
  r: "right",
  shac: "shadowColor",
  shar: "shadowRadius",
  shof: "shadowOffset",
  shop: "shadowOpacity",
  t: "top",
  w: "width",
  zi: "zIndex"
};
shorthands.bls = "borderLeftStyle";
shorthands.brs = "borderRightStyle";
shorthands.bts = "borderTopStyle";
shorthands.bbs = "borderBottomStyle";
shorthands.bxs = "boxSizing";
shorthands.bxsh = "boxShadow";
shorthands.ox = "overflowX";
shorthands.oy = "overflowY";

// src/components/Editor/ui/src/tamagui/tamagui.config.ts
var import_web4 = require("@tamagui/core");

// node_modules/@tamagui/constants/dist/esm/constants.mjs
var import_react = require("react");
var isWeb = true;
var isWindowDefined = typeof window < "u";
var isServer = isWeb && !isWindowDefined;
var isClient = isWeb && isWindowDefined;
var useIsomorphicLayoutEffect = isServer ? import_react.useEffect : import_react.useLayoutEffect;
var isChrome = typeof navigator < "u" && /Chrome/.test(navigator.userAgent || "");
var isWebTouchable = isClient && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
var isIos = process.env.TEST_NATIVE_PLATFORM === "ios";

// node_modules/@tamagui/use-presence/dist/esm/PresenceContext.mjs
var React = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var PresenceContext = React.createContext(null);
var ResetPresence = /* @__PURE__ */ __name((props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceContext.Provider, {
  value: null,
  children: props.children
}), "ResetPresence");

// node_modules/@tamagui/use-presence/dist/esm/usePresence.mjs
var React2 = __toESM(require("react"), 1);
function usePresence() {
  const context = React2.useContext(PresenceContext);
  if (!context) return [true, null, context];
  const {
    id,
    isPresent: isPresent2,
    onExitComplete,
    register
  } = context;
  return React2.useEffect(() => register(id), []), !isPresent2 && onExitComplete ? [false, () => onExitComplete?.(id), context] : [true, void 0, context];
}
__name(usePresence, "usePresence");

// node_modules/@tamagui/animations-css/dist/esm/createAnimations.mjs
var import_web = require("@tamagui/core");
var import_react2 = __toESM(require("react"), 1);
function createAnimations(animations2) {
  const reactionListeners = /* @__PURE__ */ new WeakMap();
  return {
    animations: animations2,
    usePresence,
    ResetPresence,
    supportsCSSVars: true,
    useAnimatedNumber(initial) {
      const [val, setVal] = import_react2.default.useState(initial), [onFinish, setOnFinish] = (0, import_react2.useState)();
      return useIsomorphicLayoutEffect(() => {
        onFinish && (onFinish?.(), setOnFinish(void 0));
      }, [onFinish]), {
        getInstance() {
          return setVal;
        },
        getValue() {
          return val;
        },
        setValue(next, config2, onFinish2) {
          setVal(next), setOnFinish(onFinish2);
        },
        stop() {
        }
      };
    },
    useAnimatedNumberReaction({
      value
    }, onValue) {
      import_react2.default.useEffect(() => {
        const instance = value.getInstance();
        let queue = reactionListeners.get(instance);
        if (!queue) {
          const next = /* @__PURE__ */ new Set();
          reactionListeners.set(instance, next), queue = next;
        }
        return queue.add(onValue), () => {
          queue?.delete(onValue);
        };
      }, []);
    },
    useAnimatedNumberStyle(val, getStyle) {
      return getStyle(val.getValue());
    },
    useAnimations: /* @__PURE__ */ __name(({
      props,
      presence,
      style,
      componentState,
      stateRef
    }) => {
      const isEntering = !!componentState.unmounted, isExiting = presence?.[0] === false, sendExitComplete = presence?.[1], [animationKey, animationConfig] = Array.isArray(props.animation) ? props.animation : [props.animation], animation = animations2[animationKey], keys = props.animateOnly ?? ["all"];
      return useIsomorphicLayoutEffect(() => {
        const host = stateRef.current.host;
        if (!sendExitComplete || !isExiting || !host) return;
        const node = host, onFinishAnimation = /* @__PURE__ */ __name(() => {
          sendExitComplete?.();
        }, "onFinishAnimation");
        return node.addEventListener("transitionend", onFinishAnimation), node.addEventListener("transitioncancel", onFinishAnimation), () => {
          node.removeEventListener("transitionend", onFinishAnimation), node.removeEventListener("transitioncancel", onFinishAnimation);
        };
      }, [sendExitComplete, isExiting]), animation && (Array.isArray(style.transform) && (style.transform = (0, import_web.transformsToString)(style.transform)), style.transition = keys.map((key) => {
        const override = animations2[animationConfig?.[key]] ?? animation;
        return `${key} ${override}`;
      }).join(", ")), process.env.NODE_ENV === "development" && props.debug === "verbose" && console.info("CSS animation", {
        props,
        animations: animations2,
        animation,
        animationKey,
        style,
        isEntering,
        isExiting
      }), animation ? {
        style,
        className: isEntering ? "t_unmounted" : ""
      } : null;
    }, "useAnimations")
  };
}
__name(createAnimations, "createAnimations");

// src/components/Editor/ui/src/tamagui/config/animations.ts
var animations = createAnimations({
  fast: "ease-in-out 150ms",
  medium: "ease-in-out 300ms",
  slow: "ease-in-out 450ms"
});
var animations_default = animations;

// node_modules/@tamagui/font-inter/dist/esm/index.mjs
var import_core = require("@tamagui/core");
var createInterFont = /* @__PURE__ */ __name((font = {}, {
  sizeLineHeight = /* @__PURE__ */ __name((size2) => size2 + 10, "sizeLineHeight"),
  sizeSize = /* @__PURE__ */ __name((size2) => size2 * 1, "sizeSize")
} = {}) => {
  const size2 = Object.fromEntries(Object.entries({
    ...defaultSizes,
    ...font.size
  }).map(([k, v]) => [k, sizeSize(+v)]));
  return (0, import_core.createFont)({
    family: import_core.isWeb ? 'Inter, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' : "Inter",
    lineHeight: Object.fromEntries(Object.entries(size2).map(([k, v]) => [k, sizeLineHeight((0, import_core.getVariableValue)(v))])),
    weight: {
      4: "300"
    },
    letterSpacing: {
      4: 0
    },
    ...font,
    size: size2
  });
}, "createInterFont");
var defaultSizes = {
  1: 11,
  2: 12,
  3: 13,
  4: 14,
  true: 14,
  5: 16,
  6: 18,
  7: 20,
  8: 23,
  9: 30,
  10: 46,
  11: 55,
  12: 62,
  13: 72,
  14: 92,
  15: 114,
  16: 134
};

// src/components/Editor/ui/src/tamagui/config/create-generic-font.ts
var import_web2 = require("@tamagui/core");
var genericFontSizes = {
  1: 10,
  2: 11,
  3: 12,
  4: 14,
  5: 15,
  6: 16,
  7: 20,
  8: 22,
  9: 30,
  10: 42,
  11: 52,
  12: 62,
  13: 72,
  14: 92,
  15: 114,
  16: 124
};
function createGenericFont(family, font = {}, {
  sizeLineHeight = /* @__PURE__ */ __name((val) => val * 1.35, "sizeLineHeight")
} = {}) {
  const size2 = font.size || genericFontSizes;
  return (0, import_web2.createFont)({
    family,
    size: size2,
    lineHeight: Object.fromEntries(Object.entries(size2).map(([k, v]) => [k, sizeLineHeight(+v)])),
    weight: { 0: "300" },
    letterSpacing: { 4: 0 },
    ...font
  });
}
__name(createGenericFont, "createGenericFont");
var create_generic_font_default = createGenericFont;

// src/components/Editor/ui/src/tamagui/config/fonts.ts
var headingFont = createInterFont(
  {
    size: {
      1: 36,
      2: 30,
      3: 24,
      4: 22,
      5: 20,
      6: 18,
      true: 30
    },
    weight: {
      1: "700",
      2: "500",
      3: "400",
      4: "200"
    },
    face: {
      700: { normal: "InterBold" },
      500: { normal: "InterBold" },
      400: { normal: "InterBold" },
      200: { normal: "InterBold" }
    }
  },
  {
    sizeSize: /* @__PURE__ */ __name((size2) => size2, "sizeSize"),
    sizeLineHeight: /* @__PURE__ */ __name((fontSize) => fontSize * 1.25, "sizeLineHeight")
  }
);
var bodyFont = createInterFont(
  {
    face: {
      700: { normal: "InterBold" }
    }
  },
  {
    sizeSize: /* @__PURE__ */ __name((size2) => Math.round(size2 * 1.1), "sizeSize"),
    sizeLineHeight: /* @__PURE__ */ __name((size2) => size2 + 5, "sizeLineHeight")
  }
);
var monoFont = create_generic_font_default(
  `"ui-monospace", "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`,
  {
    weight: {
      1: "500"
    },
    size: {
      1: 11,
      2: 12,
      3: 13,
      4: 14,
      5: 16,
      6: 18,
      7: 20,
      8: 22,
      9: 30,
      10: 42,
      11: 52,
      12: 62,
      13: 72,
      14: 92,
      15: 114,
      16: 124
    }
  },
  {
    sizeLineHeight: /* @__PURE__ */ __name((x) => x * 1.5, "sizeLineHeight")
  }
);
var editorBody = create_generic_font_default(
  `Georgia, Times, "Times New Roman", serif`,
  {
    weight: {
      1: "500"
    },
    size: {
      1: 12,
      2: 14,
      3: 16,
      4: 18,
      5: 20,
      6: 22,
      7: 28,
      8: 32,
      9: 40,
      10: 42,
      11: 52,
      12: 62,
      13: 72,
      14: 92,
      15: 114,
      16: 124
    }
  },
  {
    sizeLineHeight: /* @__PURE__ */ __name((x) => x * 1.5, "sizeLineHeight")
  }
);

// node_modules/@tamagui/react-native-media-driver/dist/esm/createMedia.mjs
var import_web3 = require("@tamagui/core");

// node_modules/@tamagui/react-native-media-driver/dist/esm/matchMedia.mjs
var matchMedia = globalThis.matchMedia;

// node_modules/@tamagui/react-native-media-driver/dist/esm/createMedia.mjs
function createMedia(media2) {
  return (0, import_web3.setupMatchMedia)(matchMedia), media2;
}
__name(createMedia, "createMedia");

// src/components/Editor/ui/src/tamagui/config/media.ts
var media = createMedia({
  xxs: { maxWidth: 390 },
  xs: { maxWidth: 660 },
  sm: { maxWidth: 768 },
  md: { maxWidth: 1024 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1650 },
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 768 + 1 },
  gtMd: { minWidth: 1024 + 1 },
  gtLg: { minWidth: 1280 + 1 },
  gtXl: { minWidth: 1650 + 1 }
});
var mediaQueryDefaultActive = {
  xxs: false,
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  gtXs: false,
  gtSm: false,
  gtMd: false,
  gtLg: false,
  gtXl: false
};

// src/components/Editor/ui/src/tamagui/themes/token-radius.ts
var radius = {
  0: 0,
  1: 3,
  2: 5,
  3: 7,
  4: 9,
  true: 9,
  5: 10,
  6: 16,
  7: 19,
  8: 22,
  9: 26,
  10: 34,
  11: 42,
  12: 50
};
var token_radius_default = radius;

// src/components/Editor/ui/src/tamagui/themes/token-size.ts
var size = {
  $0: 0,
  "$0.25": 2,
  "$0.5": 4,
  "$0.75": 8,
  $1: 20,
  "$1.5": 24,
  $2: 28,
  "$2.5": 32,
  $3: 36,
  "$3.5": 40,
  $4: 44,
  $true: 44,
  "$4.5": 48,
  $5: 52,
  $6: 64,
  $7: 74,
  $8: 84,
  $9: 94,
  $10: 104,
  $11: 124,
  $12: 144,
  $13: 164,
  $14: 184,
  $15: 204,
  $16: 224,
  $17: 224,
  $18: 244,
  $19: 264,
  $20: 284
};

// src/components/Editor/ui/src/tamagui/themes/token-space.ts
function sizeToSpace(v) {
  if (v === 0) return 0;
  if (v === 2) return 0.5;
  if (v === 4) return 1;
  if (v === 8) return 1.5;
  if (v <= 16) return Math.round(v * 0.333);
  return Math.floor(v * 0.7 - 12);
}
__name(sizeToSpace, "sizeToSpace");
var spaces = Object.entries(size).map(([k, v]) => {
  return [k, sizeToSpace(v)];
});
var spacesNegative = spaces.slice(1).map(([k, v]) => [`-${k.slice(1)}`, -v]);
var space = {
  ...Object.fromEntries(spaces),
  ...Object.fromEntries(spacesNegative)
};
var token_space_default = space;

// src/components/Editor/ui/src/tamagui/themes/token-z-index.ts
var zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 600,
  7: 700,
  8: 800,
  9: 900
};
var token_z_index_default = zIndex;

// src/components/Editor/ui/src/tamagui/themes/themes-generated.ts
function t(a) {
  const res = {};
  for (const [ki, vi] of a) {
    res[ks[ki]] = colors[vi];
  }
  return res;
}
__name(t, "t");
var colors = [
  "#fff",
  "#f9f9f9",
  "hsl(0, 0%, 97.3%)",
  "hsl(0, 0%, 95.1%)",
  "hsl(0, 0%, 94.0%)",
  "hsl(0, 0%, 92.0%)",
  "hsl(0, 0%, 89.5%)",
  "hsl(0, 0%, 81.0%)",
  "hsl(0, 0%, 56.1%)",
  "hsl(0, 0%, 50.3%)",
  "hsl(0, 0%, 42.5%)",
  "hsl(0, 0%, 9.0%)",
  "rgba(255,255,255,0)",
  "rgba(10,10,10,0)",
  "hsl(206, 100%, 99.2%)",
  "hsl(210, 100%, 98.0%)",
  "hsl(209, 100%, 96.5%)",
  "hsl(210, 98.8%, 94.0%)",
  "hsl(209, 95.0%, 90.1%)",
  "hsl(209, 81.2%, 84.5%)",
  "hsl(208, 77.5%, 76.9%)",
  "hsl(206, 81.9%, 65.3%)",
  "hsl(206, 100%, 50.0%)",
  "hsl(208, 100%, 47.3%)",
  "hsl(211, 100%, 43.2%)",
  "hsl(211, 100%, 15.0%)",
  "hsl(0, 0%, 99.0%)",
  "hsl(0, 0%, 93.0%)",
  "hsl(0, 0%, 90.9%)",
  "hsl(0, 0%, 88.7%)",
  "hsl(0, 0%, 85.8%)",
  "hsl(0, 0%, 78.0%)",
  "hsl(0, 0%, 52.3%)",
  "hsl(0, 0%, 43.5%)",
  "hsl(136, 50.0%, 98.9%)",
  "hsl(138, 62.5%, 96.9%)",
  "hsl(139, 55.2%, 94.5%)",
  "hsl(140, 48.7%, 91.0%)",
  "hsl(141, 43.7%, 86.0%)",
  "hsl(143, 40.3%, 79.0%)",
  "hsl(146, 38.5%, 69.0%)",
  "hsl(151, 40.2%, 54.1%)",
  "hsl(151, 55.0%, 41.5%)",
  "hsl(152, 57.5%, 37.6%)",
  "hsl(153, 67.0%, 28.5%)",
  "hsl(155, 40.0%, 14.0%)",
  "hsl(280, 65.0%, 99.4%)",
  "hsl(276, 100%, 99.0%)",
  "hsl(276, 83.1%, 97.0%)",
  "hsl(275, 76.4%, 94.7%)",
  "hsl(275, 70.8%, 91.8%)",
  "hsl(274, 65.4%, 87.8%)",
  "hsl(273, 61.0%, 81.7%)",
  "hsl(272, 60.0%, 73.5%)",
  "hsl(272, 51.0%, 54.0%)",
  "hsl(272, 46.8%, 50.3%)",
  "hsl(272, 50.0%, 45.8%)",
  "hsl(272, 66.0%, 16.0%)",
  "hsl(359, 100%, 99.4%)",
  "hsl(359, 100%, 98.6%)",
  "hsl(360, 100%, 96.8%)",
  "hsl(360, 97.9%, 94.8%)",
  "hsl(360, 90.2%, 91.9%)",
  "hsl(360, 81.7%, 87.8%)",
  "hsl(359, 74.2%, 81.7%)",
  "hsl(359, 69.5%, 74.3%)",
  "hsl(358, 75.0%, 59.0%)",
  "hsl(358, 69.4%, 55.2%)",
  "hsl(358, 65.0%, 48.7%)",
  "hsl(354, 50.0%, 14.6%)",
  "hsl(60, 54.0%, 98.5%)",
  "hsl(52, 100%, 95.5%)",
  "hsl(55, 100%, 90.9%)",
  "hsl(54, 100%, 86.6%)",
  "hsl(52, 97.9%, 82.0%)",
  "hsl(50, 89.4%, 76.1%)",
  "hsl(47, 80.4%, 68.0%)",
  "hsl(48, 100%, 46.1%)",
  "hsl(53, 92.0%, 50.0%)",
  "hsl(50, 100%, 48.5%)",
  "hsl(42, 100%, 29.0%)",
  "hsl(40, 55.0%, 13.5%)",
  "hsl(180, 29%, 17%)",
  "hsl(180, 36%, 22%)",
  "hsl(166, 30%, 29%)",
  "hsl(166, 55%, 31%)",
  "hsl(171, 96%, 28%)",
  "hsl(148, 44%, 47%)",
  "hsl(144, 55%, 57%)",
  "hsl(144, 73%, 68%)",
  "hsl(133, 54%, 78%)",
  "hsl(133, 63%, 83%)",
  "hsl(122, 53%, 88%)",
  "hsl(123, 50%, 93%)",
  "hsl(125, 50%, 96%)",
  "rgba(0,0,0,0.066)",
  "rgba(0,0,0,0.02)",
  "#050505",
  "#151515",
  "#191919",
  "#232323",
  "#282828",
  "#323232",
  "#424242",
  "#494949",
  "#545454",
  "#626262",
  "#a5a5a5",
  "hsl(212, 35.0%, 9.2%)",
  "hsl(216, 50.0%, 11.8%)",
  "hsl(214, 59.4%, 15.3%)",
  "hsl(214, 65.8%, 17.9%)",
  "hsl(213, 71.2%, 20.2%)",
  "hsl(212, 77.4%, 23.1%)",
  "hsl(211, 85.1%, 27.4%)",
  "hsl(211, 89.7%, 34.1%)",
  "hsl(209, 100%, 60.6%)",
  "hsl(210, 100%, 66.1%)",
  "hsl(206, 98.0%, 95.8%)",
  "hsl(0, 0%, 8.5%)",
  "hsl(0, 0%, 11.0%)",
  "hsl(0, 0%, 13.6%)",
  "hsl(0, 0%, 15.8%)",
  "hsl(0, 0%, 17.9%)",
  "hsl(0, 0%, 20.5%)",
  "hsl(0, 0%, 24.3%)",
  "hsl(0, 0%, 31.2%)",
  "hsl(0, 0%, 43.9%)",
  "hsl(0, 0%, 49.4%)",
  "hsl(0, 0%, 62.8%)",
  "hsl(0, 0%, 18%)",
  "hsl(146, 30.0%, 7.4%)",
  "hsl(155, 44.2%, 8.4%)",
  "hsl(155, 46.7%, 10.9%)",
  "hsl(154, 48.4%, 12.9%)",
  "hsl(154, 49.7%, 14.9%)",
  "hsl(154, 50.9%, 17.6%)",
  "hsl(153, 51.8%, 21.8%)",
  "hsl(151, 51.7%, 28.4%)",
  "hsl(151, 49.3%, 46.5%)",
  "hsl(151, 50.0%, 53.2%)",
  "hsl(137, 72.0%, 94.0%)",
  "hsl(284, 20.0%, 9.6%)",
  "hsl(283, 30.0%, 11.8%)",
  "hsl(281, 37.5%, 16.5%)",
  "hsl(280, 41.2%, 20.0%)",
  "hsl(279, 43.8%, 23.3%)",
  "hsl(277, 46.4%, 27.5%)",
  "hsl(275, 49.3%, 34.6%)",
  "hsl(272, 52.1%, 45.9%)",
  "hsl(273, 57.3%, 59.1%)",
  "hsl(275, 80.0%, 71.0%)",
  "hsl(279, 75.0%, 95.7%)",
  "hsl(353, 23.0%, 9.8%)",
  "hsl(357, 34.4%, 12.0%)",
  "hsl(356, 43.4%, 16.4%)",
  "hsl(356, 47.6%, 19.2%)",
  "hsl(356, 51.1%, 21.9%)",
  "hsl(356, 55.2%, 25.9%)",
  "hsl(357, 60.2%, 31.8%)",
  "hsl(358, 65.0%, 40.4%)",
  "hsl(358, 85.3%, 64.0%)",
  "hsl(358, 100%, 69.5%)",
  "hsl(351, 89.0%, 96.0%)",
  "hsl(45, 100%, 5.5%)",
  "hsl(46, 100%, 6.7%)",
  "hsl(45, 100%, 8.7%)",
  "hsl(45, 100%, 10.4%)",
  "hsl(47, 100%, 12.1%)",
  "hsl(49, 100%, 14.3%)",
  "hsl(49, 90.3%, 18.4%)",
  "hsl(50, 100%, 22.0%)",
  "hsl(54, 100%, 68.0%)",
  "hsl(48, 100%, 47.0%)",
  "hsl(53, 100%, 91.0%)",
  "hsl(125, 100%, 98%)",
  "hsl(180, 41%, 8%)",
  "rgba(0,0,0,0.3)",
  "rgba(0,0,0,0.2)",
  "hsla(60, 54.0%, 98.5%, 0)",
  "hsla(40, 55.0%, 13.5%, 0)",
  "hsla(136, 50.0%, 98.9%, 0)",
  "hsla(155, 40.0%, 14.0%, 0)",
  "hsla(206, 100%, 99.2%, 0)",
  "hsla(211, 100%, 15.0%, 0)",
  "hsla(280, 65.0%, 99.4%, 0)",
  "hsla(272, 66.0%, 16.0%, 0)",
  "hsla(359, 100%, 99.4%, 0)",
  "hsla(354, 50.0%, 14.6%, 0)",
  "hsla(180, 29%, 17%, 0)",
  "hsla(125, 50%, 96%, 0)",
  "hsla(45, 100%, 5.5%, 0)",
  "hsla(53, 100%, 91.0%, 0)",
  "hsla(146, 30.0%, 7.4%, 0)",
  "hsla(137, 72.0%, 94.0%, 0)",
  "hsla(212, 35.0%, 9.2%, 0)",
  "hsla(206, 98.0%, 95.8%, 0)",
  "hsla(284, 20.0%, 9.6%, 0)",
  "hsla(279, 75.0%, 95.7%, 0)",
  "hsla(353, 23.0%, 9.8%, 0)",
  "hsla(351, 89.0%, 96.0%, 0)",
  "hsla(123, 50%, 93%, 0)",
  "hsla(180, 41%, 8%, 0)"
];
var ks = [
  "color1",
  "color2",
  "color3",
  "color4",
  "color5",
  "color6",
  "color7",
  "color8",
  "color9",
  "color10",
  "color11",
  "color12",
  "background",
  "backgroundHover",
  "backgroundPress",
  "backgroundFocus",
  "backgroundStrong",
  "backgroundTransparent",
  "color",
  "colorHover",
  "colorPress",
  "colorFocus",
  "colorTransparent",
  "borderColor",
  "borderColorHover",
  "borderColorFocus",
  "borderColorPress",
  "placeholderColor",
  "outlineColor",
  "blue1",
  "blue2",
  "blue3",
  "blue4",
  "blue5",
  "blue6",
  "blue7",
  "blue8",
  "blue9",
  "blue10",
  "blue11",
  "blue12",
  "gray1",
  "gray2",
  "gray3",
  "gray4",
  "gray5",
  "gray6",
  "gray7",
  "gray8",
  "gray9",
  "gray10",
  "gray11",
  "gray12",
  "gray13",
  "green1",
  "green2",
  "green3",
  "green4",
  "green5",
  "green6",
  "green7",
  "green8",
  "green9",
  "green10",
  "green11",
  "green12",
  "purple1",
  "purple2",
  "purple3",
  "purple4",
  "purple5",
  "purple6",
  "purple7",
  "purple8",
  "purple9",
  "purple10",
  "purple11",
  "purple12",
  "red1",
  "red2",
  "red3",
  "red4",
  "red5",
  "red6",
  "red7",
  "red8",
  "red9",
  "red10",
  "red11",
  "red12",
  "yellow1",
  "yellow2",
  "yellow3",
  "yellow4",
  "yellow5",
  "yellow6",
  "yellow7",
  "yellow8",
  "yellow9",
  "yellow10",
  "yellow11",
  "yellow12",
  "brand1",
  "brand2",
  "brand3",
  "brand4",
  "brand5",
  "brand6",
  "brand7",
  "brand8",
  "brand9",
  "brand10",
  "brand11",
  "brand12",
  "brandHighlight",
  "shadowColor",
  "shadowColorHover",
  "shadowColorPress",
  "shadowColorFocus"
];
var n1 = t([
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [8, 8],
  [9, 9],
  [10, 10],
  [11, 11],
  [12, 1],
  [13, 2],
  [14, 3],
  [15, 4],
  [16, 0],
  [17, 12],
  [18, 11],
  [19, 10],
  [20, 11],
  [21, 10],
  [22, 13],
  [23, 4],
  [24, 5],
  [25, 3],
  [26, 4],
  [27, 8],
  [28, 4],
  [29, 14],
  [30, 15],
  [31, 16],
  [32, 17],
  [33, 18],
  [34, 19],
  [35, 20],
  [36, 21],
  [37, 22],
  [38, 23],
  [39, 24],
  [40, 25],
  [41, 26],
  [42, 2],
  [43, 3],
  [44, 27],
  [45, 28],
  [46, 29],
  [47, 30],
  [48, 31],
  [49, 8],
  [50, 32],
  [51, 33],
  [52, 26],
  [53, 11],
  [54, 34],
  [55, 35],
  [56, 36],
  [57, 37],
  [58, 38],
  [59, 39],
  [60, 40],
  [61, 41],
  [62, 42],
  [63, 43],
  [64, 44],
  [65, 45],
  [66, 46],
  [67, 47],
  [68, 48],
  [69, 49],
  [70, 50],
  [71, 51],
  [72, 52],
  [73, 53],
  [74, 54],
  [75, 55],
  [76, 56],
  [77, 57],
  [78, 58],
  [79, 59],
  [80, 60],
  [81, 61],
  [82, 62],
  [83, 63],
  [84, 64],
  [85, 65],
  [86, 66],
  [87, 67],
  [88, 68],
  [89, 69],
  [90, 70],
  [91, 71],
  [92, 72],
  [93, 73],
  [94, 74],
  [95, 75],
  [96, 76],
  [97, 77],
  [98, 78],
  [99, 79],
  [100, 80],
  [101, 81],
  [102, 82],
  [103, 83],
  [104, 84],
  [105, 85],
  [106, 86],
  [107, 87],
  [108, 88],
  [109, 89],
  [110, 90],
  [111, 91],
  [112, 92],
  [113, 93],
  [114, 94],
  [115, 95],
  [116, 95],
  [117, 96],
  [118, 96]
]);
var n2 = t([
  [0, 97],
  [1, 98],
  [2, 99],
  [3, 100],
  [4, 101],
  [5, 102],
  [6, 103],
  [7, 104],
  [8, 105],
  [9, 106],
  [10, 107],
  [11, 0],
  [12, 98],
  [13, 99],
  [14, 100],
  [15, 101],
  [16, 97],
  [17, 13],
  [18, 0],
  [19, 107],
  [20, 0],
  [21, 107],
  [22, 12],
  [23, 101],
  [24, 102],
  [25, 100],
  [26, 101],
  [27, 105],
  [28, 101],
  [29, 108],
  [30, 109],
  [31, 110],
  [32, 111],
  [33, 112],
  [34, 113],
  [35, 114],
  [36, 115],
  [37, 22],
  [38, 116],
  [39, 117],
  [40, 118],
  [41, 119],
  [42, 120],
  [43, 121],
  [44, 122],
  [45, 123],
  [46, 124],
  [47, 125],
  [48, 126],
  [49, 127],
  [50, 128],
  [51, 129],
  [52, 130],
  [53, 27],
  [54, 131],
  [55, 132],
  [56, 133],
  [57, 134],
  [58, 135],
  [59, 136],
  [60, 137],
  [61, 138],
  [62, 42],
  [63, 139],
  [64, 140],
  [65, 141],
  [66, 142],
  [67, 143],
  [68, 144],
  [69, 145],
  [70, 146],
  [71, 147],
  [72, 148],
  [73, 149],
  [74, 54],
  [75, 150],
  [76, 151],
  [77, 152],
  [78, 153],
  [79, 154],
  [80, 155],
  [81, 156],
  [82, 157],
  [83, 158],
  [84, 159],
  [85, 160],
  [86, 66],
  [87, 161],
  [88, 162],
  [89, 163],
  [90, 164],
  [91, 165],
  [92, 166],
  [93, 167],
  [94, 168],
  [95, 169],
  [96, 170],
  [97, 171],
  [98, 78],
  [99, 172],
  [100, 173],
  [101, 174],
  [102, 93],
  [103, 92],
  [104, 175],
  [105, 85],
  [106, 86],
  [107, 87],
  [108, 88],
  [109, 89],
  [110, 90],
  [111, 84],
  [112, 83],
  [113, 82],
  [114, 176],
  [115, 177],
  [116, 177],
  [117, 178],
  [118, 178]
]);
var n3 = t([
  [0, 70],
  [1, 71],
  [2, 72],
  [3, 73],
  [4, 74],
  [5, 75],
  [6, 77],
  [7, 78],
  [8, 79],
  [9, 80],
  [10, 81],
  [11, 11],
  [12, 71],
  [13, 72],
  [14, 73],
  [15, 74],
  [16, 70],
  [17, 179],
  [18, 11],
  [19, 81],
  [20, 11],
  [21, 81],
  [22, 180],
  [23, 73],
  [24, 74],
  [25, 73],
  [26, 73],
  [27, 79],
  [28, 74]
]);
var n4 = t([
  [0, 34],
  [1, 35],
  [2, 36],
  [3, 37],
  [4, 38],
  [5, 39],
  [6, 41],
  [7, 42],
  [8, 43],
  [9, 44],
  [10, 45],
  [11, 11],
  [12, 35],
  [13, 36],
  [14, 37],
  [15, 38],
  [16, 34],
  [17, 181],
  [18, 11],
  [19, 45],
  [20, 11],
  [21, 45],
  [22, 182],
  [23, 37],
  [24, 38],
  [25, 37],
  [26, 37],
  [27, 43],
  [28, 38]
]);
var n5 = t([
  [0, 14],
  [1, 15],
  [2, 16],
  [3, 17],
  [4, 18],
  [5, 19],
  [6, 21],
  [7, 22],
  [8, 23],
  [9, 24],
  [10, 25],
  [11, 11],
  [12, 15],
  [13, 16],
  [14, 17],
  [15, 18],
  [16, 14],
  [17, 183],
  [18, 11],
  [19, 25],
  [20, 11],
  [21, 25],
  [22, 184],
  [23, 17],
  [24, 18],
  [25, 17],
  [26, 17],
  [27, 23],
  [28, 18]
]);
var n6 = t([
  [0, 46],
  [1, 47],
  [2, 48],
  [3, 49],
  [4, 50],
  [5, 51],
  [6, 53],
  [7, 54],
  [8, 55],
  [9, 56],
  [10, 57],
  [11, 11],
  [12, 47],
  [13, 48],
  [14, 49],
  [15, 50],
  [16, 46],
  [17, 185],
  [18, 11],
  [19, 57],
  [20, 11],
  [21, 57],
  [22, 186],
  [23, 49],
  [24, 50],
  [25, 49],
  [26, 49],
  [27, 55],
  [28, 50]
]);
var n7 = t([
  [0, 58],
  [1, 59],
  [2, 60],
  [3, 61],
  [4, 62],
  [5, 63],
  [6, 65],
  [7, 66],
  [8, 67],
  [9, 68],
  [10, 69],
  [11, 11],
  [12, 59],
  [13, 60],
  [14, 61],
  [15, 62],
  [16, 58],
  [17, 187],
  [18, 11],
  [19, 69],
  [20, 11],
  [21, 69],
  [22, 188],
  [23, 61],
  [24, 62],
  [25, 61],
  [26, 61],
  [27, 67],
  [28, 62]
]);
var n8 = t([
  [0, 82],
  [1, 83],
  [2, 84],
  [3, 85],
  [4, 86],
  [5, 87],
  [6, 90],
  [7, 91],
  [8, 92],
  [9, 93],
  [10, 94],
  [11, 11],
  [12, 83],
  [13, 84],
  [14, 85],
  [15, 86],
  [16, 82],
  [17, 189],
  [18, 11],
  [19, 94],
  [20, 11],
  [21, 94],
  [22, 190],
  [23, 85],
  [24, 86],
  [25, 85],
  [26, 85],
  [27, 92],
  [28, 86]
]);
var n9 = t([
  [0, 164],
  [1, 165],
  [2, 166],
  [3, 167],
  [4, 168],
  [5, 169],
  [6, 171],
  [7, 78],
  [8, 172],
  [9, 173],
  [10, 174],
  [11, 0],
  [12, 165],
  [13, 166],
  [14, 167],
  [15, 168],
  [16, 164],
  [17, 191],
  [18, 0],
  [19, 174],
  [20, 0],
  [21, 174],
  [22, 192],
  [23, 168],
  [24, 169],
  [25, 167],
  [26, 168],
  [27, 172],
  [28, 168]
]);
var n10 = t([
  [0, 131],
  [1, 132],
  [2, 133],
  [3, 134],
  [4, 135],
  [5, 136],
  [6, 138],
  [7, 42],
  [8, 139],
  [9, 140],
  [10, 141],
  [11, 0],
  [12, 132],
  [13, 133],
  [14, 134],
  [15, 135],
  [16, 131],
  [17, 193],
  [18, 0],
  [19, 141],
  [20, 0],
  [21, 141],
  [22, 194],
  [23, 135],
  [24, 136],
  [25, 134],
  [26, 135],
  [27, 139],
  [28, 135]
]);
var n11 = t([
  [0, 108],
  [1, 109],
  [2, 110],
  [3, 111],
  [4, 112],
  [5, 113],
  [6, 115],
  [7, 22],
  [8, 116],
  [9, 117],
  [10, 118],
  [11, 0],
  [12, 109],
  [13, 110],
  [14, 111],
  [15, 112],
  [16, 108],
  [17, 195],
  [18, 0],
  [19, 118],
  [20, 0],
  [21, 118],
  [22, 196],
  [23, 112],
  [24, 113],
  [25, 111],
  [26, 112],
  [27, 116],
  [28, 112]
]);
var n12 = t([
  [0, 142],
  [1, 143],
  [2, 144],
  [3, 145],
  [4, 146],
  [5, 147],
  [6, 149],
  [7, 54],
  [8, 150],
  [9, 151],
  [10, 152],
  [11, 0],
  [12, 143],
  [13, 144],
  [14, 145],
  [15, 146],
  [16, 142],
  [17, 197],
  [18, 0],
  [19, 152],
  [20, 0],
  [21, 152],
  [22, 198],
  [23, 146],
  [24, 147],
  [25, 145],
  [26, 146],
  [27, 150],
  [28, 146]
]);
var n13 = t([
  [0, 153],
  [1, 154],
  [2, 155],
  [3, 156],
  [4, 157],
  [5, 158],
  [6, 160],
  [7, 66],
  [8, 161],
  [9, 162],
  [10, 163],
  [11, 0],
  [12, 154],
  [13, 155],
  [14, 156],
  [15, 157],
  [16, 153],
  [17, 199],
  [18, 0],
  [19, 163],
  [20, 0],
  [21, 163],
  [22, 200],
  [23, 157],
  [24, 158],
  [25, 156],
  [26, 157],
  [27, 161],
  [28, 157]
]);
var n14 = t([
  [0, 93],
  [1, 92],
  [2, 175],
  [3, 85],
  [4, 86],
  [5, 87],
  [6, 90],
  [7, 84],
  [8, 83],
  [9, 82],
  [10, 176],
  [11, 0],
  [12, 92],
  [13, 175],
  [14, 85],
  [15, 86],
  [16, 93],
  [17, 201],
  [18, 0],
  [19, 176],
  [20, 0],
  [21, 176],
  [22, 202],
  [23, 86],
  [24, 87],
  [25, 85],
  [26, 86],
  [27, 83],
  [28, 86]
]);
var themes = {
  light: n1,
  dark: n2,
  light_yellow: n3,
  light_green: n4,
  light_blue: n5,
  light_purple: n6,
  light_red: n7,
  light_brand: n8,
  dark_yellow: n9,
  dark_green: n10,
  dark_blue: n11,
  dark_purple: n12,
  dark_red: n13,
  dark_brand: n14
};

// node_modules/@tamagui/colors/dist/esm/dark/blue.mjs
var blue = {
  blue1: "hsl(212, 35.0%, 9.2%)",
  blue2: "hsl(216, 50.0%, 11.8%)",
  blue3: "hsl(214, 59.4%, 15.3%)",
  blue4: "hsl(214, 65.8%, 17.9%)",
  blue5: "hsl(213, 71.2%, 20.2%)",
  blue6: "hsl(212, 77.4%, 23.1%)",
  blue7: "hsl(211, 85.1%, 27.4%)",
  blue8: "hsl(211, 89.7%, 34.1%)",
  blue9: "hsl(206, 100%, 50.0%)",
  blue10: "hsl(209, 100%, 60.6%)",
  blue11: "hsl(210, 100%, 66.1%)",
  blue12: "hsl(206, 98.0%, 95.8%)"
};

// node_modules/@tamagui/colors/dist/esm/dark/gray.mjs
var gray = {
  gray1: "hsl(0, 0%, 8.5%)",
  gray2: "hsl(0, 0%, 11.0%)",
  gray3: "hsl(0, 0%, 13.6%)",
  gray4: "hsl(0, 0%, 15.8%)",
  gray5: "hsl(0, 0%, 17.9%)",
  gray6: "hsl(0, 0%, 20.5%)",
  gray7: "hsl(0, 0%, 24.3%)",
  gray8: "hsl(0, 0%, 31.2%)",
  gray9: "hsl(0, 0%, 43.9%)",
  gray10: "hsl(0, 0%, 49.4%)",
  gray11: "hsl(0, 0%, 62.8%)",
  gray12: "hsl(0, 0%, 93.0%)"
};

// node_modules/@tamagui/colors/dist/esm/dark/green.mjs
var green = {
  green1: "hsl(146, 30.0%, 7.4%)",
  green2: "hsl(155, 44.2%, 8.4%)",
  green3: "hsl(155, 46.7%, 10.9%)",
  green4: "hsl(154, 48.4%, 12.9%)",
  green5: "hsl(154, 49.7%, 14.9%)",
  green6: "hsl(154, 50.9%, 17.6%)",
  green7: "hsl(153, 51.8%, 21.8%)",
  green8: "hsl(151, 51.7%, 28.4%)",
  green9: "hsl(151, 55.0%, 41.5%)",
  green10: "hsl(151, 49.3%, 46.5%)",
  green11: "hsl(151, 50.0%, 53.2%)",
  green12: "hsl(137, 72.0%, 94.0%)"
};

// node_modules/@tamagui/colors/dist/esm/dark/purple.mjs
var purple = {
  purple1: "hsl(284, 20.0%, 9.6%)",
  purple2: "hsl(283, 30.0%, 11.8%)",
  purple3: "hsl(281, 37.5%, 16.5%)",
  purple4: "hsl(280, 41.2%, 20.0%)",
  purple5: "hsl(279, 43.8%, 23.3%)",
  purple6: "hsl(277, 46.4%, 27.5%)",
  purple7: "hsl(275, 49.3%, 34.6%)",
  purple8: "hsl(272, 52.1%, 45.9%)",
  purple9: "hsl(272, 51.0%, 54.0%)",
  purple10: "hsl(273, 57.3%, 59.1%)",
  purple11: "hsl(275, 80.0%, 71.0%)",
  purple12: "hsl(279, 75.0%, 95.7%)"
};

// node_modules/@tamagui/colors/dist/esm/dark/red.mjs
var red = {
  red1: "hsl(353, 23.0%, 9.8%)",
  red2: "hsl(357, 34.4%, 12.0%)",
  red3: "hsl(356, 43.4%, 16.4%)",
  red4: "hsl(356, 47.6%, 19.2%)",
  red5: "hsl(356, 51.1%, 21.9%)",
  red6: "hsl(356, 55.2%, 25.9%)",
  red7: "hsl(357, 60.2%, 31.8%)",
  red8: "hsl(358, 65.0%, 40.4%)",
  red9: "hsl(358, 75.0%, 59.0%)",
  red10: "hsl(358, 85.3%, 64.0%)",
  red11: "hsl(358, 100%, 69.5%)",
  red12: "hsl(351, 89.0%, 96.0%)"
};

// node_modules/@tamagui/colors/dist/esm/dark/yellow.mjs
var yellow = {
  yellow1: "hsl(45, 100%, 5.5%)",
  yellow2: "hsl(46, 100%, 6.7%)",
  yellow3: "hsl(45, 100%, 8.7%)",
  yellow4: "hsl(45, 100%, 10.4%)",
  yellow5: "hsl(47, 100%, 12.1%)",
  yellow6: "hsl(49, 100%, 14.3%)",
  yellow7: "hsl(49, 90.3%, 18.4%)",
  yellow8: "hsl(50, 100%, 22.0%)",
  yellow9: "hsl(53, 92.0%, 50.0%)",
  yellow10: "hsl(54, 100%, 68.0%)",
  yellow11: "hsl(48, 100%, 47.0%)",
  yellow12: "hsl(53, 100%, 91.0%)"
};

// node_modules/@tamagui/colors/dist/esm/light/blue.mjs
var blue2 = {
  blue1: "hsl(206, 100%, 99.2%)",
  blue2: "hsl(210, 100%, 98.0%)",
  blue3: "hsl(209, 100%, 96.5%)",
  blue4: "hsl(210, 98.8%, 94.0%)",
  blue5: "hsl(209, 95.0%, 90.1%)",
  blue6: "hsl(209, 81.2%, 84.5%)",
  blue7: "hsl(208, 77.5%, 76.9%)",
  blue8: "hsl(206, 81.9%, 65.3%)",
  blue9: "hsl(206, 100%, 50.0%)",
  blue10: "hsl(208, 100%, 47.3%)",
  blue11: "hsl(211, 100%, 43.2%)",
  blue12: "hsl(211, 100%, 15.0%)"
};

// node_modules/@tamagui/colors/dist/esm/light/gray.mjs
var gray2 = {
  gray1: "hsl(0, 0%, 99.0%)",
  gray2: "hsl(0, 0%, 97.3%)",
  gray3: "hsl(0, 0%, 95.1%)",
  gray4: "hsl(0, 0%, 93.0%)",
  gray5: "hsl(0, 0%, 90.9%)",
  gray6: "hsl(0, 0%, 88.7%)",
  gray7: "hsl(0, 0%, 85.8%)",
  gray8: "hsl(0, 0%, 78.0%)",
  gray9: "hsl(0, 0%, 56.1%)",
  gray10: "hsl(0, 0%, 52.3%)",
  gray11: "hsl(0, 0%, 43.5%)",
  gray12: "hsl(0, 0%, 9.0%)"
};

// node_modules/@tamagui/colors/dist/esm/light/green.mjs
var green2 = {
  green1: "hsl(136, 50.0%, 98.9%)",
  green2: "hsl(138, 62.5%, 96.9%)",
  green3: "hsl(139, 55.2%, 94.5%)",
  green4: "hsl(140, 48.7%, 91.0%)",
  green5: "hsl(141, 43.7%, 86.0%)",
  green6: "hsl(143, 40.3%, 79.0%)",
  green7: "hsl(146, 38.5%, 69.0%)",
  green8: "hsl(151, 40.2%, 54.1%)",
  green9: "hsl(151, 55.0%, 41.5%)",
  green10: "hsl(152, 57.5%, 37.6%)",
  green11: "hsl(153, 67.0%, 28.5%)",
  green12: "hsl(155, 40.0%, 14.0%)"
};

// node_modules/@tamagui/colors/dist/esm/light/purple.mjs
var purple2 = {
  purple1: "hsl(280, 65.0%, 99.4%)",
  purple2: "hsl(276, 100%, 99.0%)",
  purple3: "hsl(276, 83.1%, 97.0%)",
  purple4: "hsl(275, 76.4%, 94.7%)",
  purple5: "hsl(275, 70.8%, 91.8%)",
  purple6: "hsl(274, 65.4%, 87.8%)",
  purple7: "hsl(273, 61.0%, 81.7%)",
  purple8: "hsl(272, 60.0%, 73.5%)",
  purple9: "hsl(272, 51.0%, 54.0%)",
  purple10: "hsl(272, 46.8%, 50.3%)",
  purple11: "hsl(272, 50.0%, 45.8%)",
  purple12: "hsl(272, 66.0%, 16.0%)"
};

// node_modules/@tamagui/colors/dist/esm/light/red.mjs
var red2 = {
  red1: "hsl(359, 100%, 99.4%)",
  red2: "hsl(359, 100%, 98.6%)",
  red3: "hsl(360, 100%, 96.8%)",
  red4: "hsl(360, 97.9%, 94.8%)",
  red5: "hsl(360, 90.2%, 91.9%)",
  red6: "hsl(360, 81.7%, 87.8%)",
  red7: "hsl(359, 74.2%, 81.7%)",
  red8: "hsl(359, 69.5%, 74.3%)",
  red9: "hsl(358, 75.0%, 59.0%)",
  red10: "hsl(358, 69.4%, 55.2%)",
  red11: "hsl(358, 65.0%, 48.7%)",
  red12: "hsl(354, 50.0%, 14.6%)"
};

// node_modules/@tamagui/colors/dist/esm/light/yellow.mjs
var yellow2 = {
  yellow1: "hsl(60, 54.0%, 98.5%)",
  yellow2: "hsl(52, 100%, 95.5%)",
  yellow3: "hsl(55, 100%, 90.9%)",
  yellow4: "hsl(54, 100%, 86.6%)",
  yellow5: "hsl(52, 97.9%, 82.0%)",
  yellow6: "hsl(50, 89.4%, 76.1%)",
  yellow7: "hsl(47, 80.4%, 68.0%)",
  yellow8: "hsl(48, 100%, 46.1%)",
  yellow9: "hsl(53, 92.0%, 50.0%)",
  yellow10: "hsl(50, 100%, 48.5%)",
  yellow11: "hsl(42, 100%, 29.0%)",
  yellow12: "hsl(40, 55.0%, 13.5%)"
};

// node_modules/@tamagui/colors/dist/esm/blackA.mjs
var blackA = {
  blackA1: "hsla(0, 0%, 0%, 0.012)",
  blackA2: "hsla(0, 0%, 0%, 0.027)",
  blackA3: "hsla(0, 0%, 0%, 0.047)",
  blackA4: "hsla(0, 0%, 0%, 0.071)",
  blackA5: "hsla(0, 0%, 0%, 0.090)",
  blackA6: "hsla(0, 0%, 0%, 0.114)",
  blackA7: "hsla(0, 0%, 0%, 0.141)",
  blackA8: "hsla(0, 0%, 0%, 0.220)",
  blackA9: "hsla(0, 0%, 0%, 0.439)",
  blackA10: "hsla(0, 0%, 0%, 0.478)",
  blackA11: "hsla(0, 0%, 0%, 0.565)",
  blackA12: "hsla(0, 0%, 0%, 0.910)"
};

// node_modules/@tamagui/colors/dist/esm/whiteA.mjs
var whiteA = {
  whiteA1: "hsla(0, 0%, 100%, 0)",
  whiteA2: "hsla(0, 0%, 100%, 0.013)",
  whiteA3: "hsla(0, 0%, 100%, 0.034)",
  whiteA4: "hsla(0, 0%, 100%, 0.056)",
  whiteA5: "hsla(0, 0%, 100%, 0.086)",
  whiteA6: "hsla(0, 0%, 100%, 0.124)",
  whiteA7: "hsla(0, 0%, 100%, 0.176)",
  whiteA8: "hsla(0, 0%, 100%, 0.249)",
  whiteA9: "hsla(0, 0%, 100%, 0.386)",
  whiteA10: "hsla(0, 0%, 100%, 0.446)",
  whiteA11: "hsla(0, 0%, 100%, 0.592)",
  whiteA12: "hsla(0, 0%, 100%, 0.923)"
};

// src/components/Editor/ui/src/tamagui/themes/colors.ts
var brand = {
  brand1: "hsl(180, 29%, 17%)",
  brand2: "hsl(180, 36%, 22%)",
  brand3: "hsl(166, 30%, 29%)",
  brand4: "hsl(166, 55%, 31%)",
  brand5: "hsl(171, 96%, 28%)",
  brand6: "hsl(148, 44%, 47%)",
  brand7: "hsl(144, 55%, 57%)",
  brand8: "hsl(144, 73%, 68%)",
  brand9: "hsl(133, 54%, 78%)",
  brand10: "hsl(133, 63%, 83%)",
  brand11: "hsl(122, 53%, 88%)",
  // PLEASE manually sync with editor.css .seed-app-dark .ProseMirror .hm-link
  brand12: "hsl(123, 50%, 93%)",
  brandHighlight: "hsl(125, 50%, 96%)"
};
var brandDark = {
  brand1: brand.brand12,
  brand2: brand.brand11,
  brand3: "hsl(125, 100%, 98%)",
  brand4: "hsl(166, 55%, 31%)",
  brand5: "hsl(171, 96%, 28%)",
  brand6: "hsl(148, 44%, 47%)",
  brand7: "hsl(144, 55%, 57%)",
  brand8: "hsl(144, 73%, 68%)",
  brand9: "hsl(133, 54%, 78%)",
  brand10: "hsl(166, 30%, 29%)",
  brand11: brand.brand2,
  brand12: brand.brand1,
  brandHighlight: "hsl(180, 41%, 8%)"
};
var customGray = {
  gray1: gray2.gray1,
  gray2: gray2.gray2,
  gray3: gray2.gray3,
  gray4: gray2.gray4,
  gray5: gray2.gray5,
  gray6: gray2.gray6,
  gray7: gray2.gray7,
  gray8: gray2.gray8,
  gray9: gray2.gray9,
  gray10: gray2.gray10,
  gray11: gray2.gray11,
  gray12: "hsl(0, 0%, 99.0%)",
  gray13: gray2.gray12
};
var customGrayDark = {
  gray1: gray.gray1,
  gray2: gray.gray2,
  gray3: gray.gray3,
  gray4: gray.gray4,
  gray5: gray.gray5,
  gray6: gray.gray6,
  gray7: gray.gray7,
  gray8: gray.gray8,
  gray9: gray.gray9,
  gray10: gray.gray10,
  gray11: gray.gray11,
  gray12: "hsl(0, 0%, 18%)",
  gray13: gray.gray12
};

// src/components/Editor/ui/src/tamagui/themes/token-colors.ts
var colorTokens = {
  light: {
    blue: blue2,
    customGray,
    green: green2,
    // orange,
    // pink,
    purple: purple2,
    red: red2,
    yellow: yellow2,
    brand,
    brandDark,
    whiteA
  },
  dark: {
    blue,
    gray: customGrayDark,
    green,
    // orange: orangeDark,
    // pink: pinkDark,
    purple,
    red,
    yellow,
    brand: brandDark,
    whiteA: blackA
  }
};
var darkColors = {
  ...colorTokens.dark.blue,
  ...colorTokens.dark.gray,
  ...colorTokens.dark.green,
  // ...colorTokens.dark.orange,
  // ...colorTokens.dark.pink,
  ...colorTokens.dark.purple,
  ...colorTokens.dark.red,
  ...colorTokens.dark.yellow,
  ...colorTokens.dark.brand
};
var lightColors = {
  ...colorTokens.light.blue,
  ...colorTokens.light.customGray,
  ...colorTokens.light.green,
  // ...colorTokens.light.orange,
  // ...colorTokens.light.pink,
  ...colorTokens.light.purple,
  ...colorTokens.light.red,
  ...colorTokens.light.yellow,
  ...colorTokens.light.brand
};
function postfixObjKeys(obj, postfix) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${k}${postfix}`, v]));
}
__name(postfixObjKeys, "postfixObjKeys");
var color = {
  ...postfixObjKeys(lightColors, "Light"),
  ...postfixObjKeys(darkColors, "Dark")
};

// src/components/Editor/ui/src/tamagui/tamagui.config.ts
var conf = {
  themes,
  defaultFont: "body",
  animations: animations_default,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
    editorBody
  },
  tokens: (0, import_web4.createTokens)({
    color,
    radius: token_radius_default,
    zIndex: token_z_index_default,
    space: token_space_default,
    size,
    opacity: {
      low: 0.4,
      medium: 0.6,
      high: 0.8,
      full: 1
    }
  }),
  media,
  settings: {
    webContainerType: "inherit"
  }
};
conf.mediaQueryDefaultActive = mediaQueryDefaultActive;
var config = (0, import_core2.createTamagui)(conf);
var tamagui_config_default = config;

// tamagui.config.ts
var tamagui_config_default2 = tamagui_config_default;
