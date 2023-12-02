import { MyInfo, debugFatory } from '@/app/lib';
import { contextFactory } from './context-util';
import {
  TCIC_IM_TYPE,
  TCIC_TRTC_TYPE,
  TCIC_TYPE,
} from '@tencent/tcic-watch-sdk';
let debug = debugFatory('boot_Context');

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
      debug('update: result', result);
      return result;
    },
  },
  {
    defaultVal: {
      /**
       * 全局bootstrap对象
       */
      boot: null as any,
      /**
       * 已登陆的业务对象
       */
      tcic: null as InstanceType<TCIC_TYPE> | null,
      /**
       * 消息通道
       * 获取系统消息，和群组互动信息
       */
      tim: null as InstanceType<TCIC_IM_TYPE> | null,
      /**
       * trtc客户端
       */
      trtcClient: null as InstanceType<TCIC_TRTC_TYPE> | null,
    },
  },
);

export let BootContext = contextObj.Context;

export let BootProvider = contextObj.Provider;
