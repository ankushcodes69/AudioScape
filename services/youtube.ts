// === START ===  Making Youtube.js work
import "event-target-polyfill";
import "web-streams-polyfill";
import "text-encoding-polyfill";
import "react-native-url-polyfill/auto";
import { decode, encode } from "base-64";
import { MMKV } from "react-native-mmkv";
import Innertube, { UniversalCache } from "youtubei.js";
import { fetch } from "expo/fetch";

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

// Create and export a promise that resolves to an Innertube instance
const innertube: Promise<Innertube> = (async () => {
  const res = await fetch(process.env.EXPO_PUBLIC_PO_TOKEN_API);
  const data = await res.json();
  const poToken = data.poToken;
  const visitorData = data.visitorData;

  //console.log("poToken", poToken);
  //console.log("visitorData", visitorData);

  return Innertube.create({
    po_token: poToken,
    visitor_data: visitorData,
    cache: new UniversalCache(true),
    generate_session_locally: true,
  });
})();

export default innertube;
