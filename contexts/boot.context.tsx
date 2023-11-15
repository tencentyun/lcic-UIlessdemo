import { contextFactory } from "./context-util";

/**
 * boot为全局bootstrap对象
 */
let contextObj = contextFactory(
  {
    setBoot: (state, action) => {
      state.boot = action.arg;
      return { ...state };
    },
    setTcic: (state, action) => {
      console.log("state in setTCIC", state);
      state.tcic = action.arg;
      return { ...state };
    },
  },
  {
    boot: null as any,
    tcic: null as any,
  }
);

export let BootContext = contextObj.Context;

export let BootProvider = contextObj.Provider;
