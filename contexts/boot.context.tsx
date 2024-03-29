import { MyInfo, debugFatory } from '@/app/lib';
import { contextFactory } from './context-util';
import { createTrtcClient, create, createTimClient } from 'tric-sdk-v1';
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
      tcic: null as Awaited<ReturnType<typeof create>> | null,
      /**
       * 消息通道
       * 获取系统消息，和群组互动信息
       */
      tim: null as Awaited<ReturnType<typeof createTimClient>> | null,
      /**
       * trtc客户端
       */
      trtcClient: null as Awaited<ReturnType<typeof createTrtcClient>> | null,
    },
  },
);

export let BootContext = contextObj.Context;

export let BootProvider = contextObj.Provider;
