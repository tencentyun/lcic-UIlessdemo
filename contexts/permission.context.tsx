/**
 * 当前用户权限上下文
 */
import { TClassStatus, debugFatory } from '@/app/lib';
import { contextFactory } from './context-util';
let debug = debugFatory('Permission_Context');
// type RoomContextType = {};

let contextObj = contextFactory(
  {
    update: (state, action) => {
      let result: any = { ...state };
      let newObj: any = { ...action.state };
      for (let key in newObj) {
        if (!newObj[key]) {
          delete newObj[key];
        }
      }
      /**
       * 合并所有初始值
       */
      result = { ...result, ...newObj };
      debug('update: result', result);
      return result;
    },
  },
  {
    defaultVal: {
      list: [] as TCIC.Common.Item<any>[],
    },
  },
);

export let PermissionContext = contextObj.Context;

export let PermissionProvider = contextObj.Provider;
