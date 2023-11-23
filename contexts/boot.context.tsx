import { debugFatory } from "@/app/lib";
import { contextFactory } from "./context-util";
let debug = debugFatory("boot_Context");

/**
 * boot为全局bootstrap对象
 */
let contextObj = contextFactory(
  {
    merge: (state, action) => {
      let result: any = { ...state };
      /**
       * 合并所有初始值
       */
      ["boot", "tcic", "sdk", "tim"].forEach((key) => {
        if (!result[key]) {
          result[key] = action.arg[key];
        }
      });
      debug("update: result", result);
      return result;
    },
  },
  {
    defaultVal: {
      boot: null as any,
      tcic: null as any,
      sdk: null as any,
      tim: null as any,
    },
  }
);

export let BootContext = contextObj.Context;

export let BootProvider = contextObj.Provider;
