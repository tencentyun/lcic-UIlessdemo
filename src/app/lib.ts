let debugObj = require("debug");

interface Debug {
  (...args: any): void;
  enable: (ns: string) => void;
  disable: (ns: string) => void;
}
let debugMap = new Map<string, Debug>();

export function debugFatory(ns: string): Debug {
  let debugKey = `TC:${ns}`;
  let target = debugMap.get(debugKey);
  if (!target) {
    debugMap.set(debugKey, debugObj(debugKey));
    target = debugObj(debugKey);
    debugObj.enable("TC:*");
  }
  console.log("debugObj:", debugKey);
  return target!;
}
