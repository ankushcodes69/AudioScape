// === START ===  Making Youtube.js work
import "event-target-polyfill";
import "web-streams-polyfill";
import "text-encoding-polyfill";
import "react-native-url-polyfill/auto";
import { decode, encode } from "base-64";
import { MMKV } from "react-native-mmkv";
import Innertube, { UniversalCache } from "youtubei.js";

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// @ts-expect-error
global.mmkvStorage = MMKV as any;

class CustomEvent extends Event {
  #detail;

  constructor(type: string, options?: CustomEventInit<any[]>) {
    super(type, options);
    this.#detail = options?.detail ?? null;
  }

  get detail() {
    return this.#detail;
  }
}

global.CustomEvent = CustomEvent as any;

// === END === Making Youtube.js work

let innertube: Promise<Innertube> = Innertube.create({
  cache: new UniversalCache(false),
  generate_session_locally: true,
});

export default innertube;
