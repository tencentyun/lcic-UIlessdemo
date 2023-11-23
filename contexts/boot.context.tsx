import { MyInfo, debugFatory } from "@/app/lib";
import { contextFactory } from "./context-util";
let debug = debugFatory("boot_Context");

/**
 * boot为全局bootstrap对象
 */
let contextObj = contextFactory(
  {
    merge: (state, action) => {
      let result: any = { ...state };

      let newObj = { ...action.arg };
      for (let key in newObj) {
        if (!newObj[key]) {
          delete newObj[key];
        }
      }
      /**
       * 合并所有初始值
       */
      result = { ...result, ...newObj };
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
      myInfo: null as MyInfo | null,
      hostInfo: null as MyInfo | null,
    },
  }
);

export let BootContext = contextObj.Context;

export let BootProvider = contextObj.Provider;
