/**
 * 当前用户权限上下文
 */
import { TClassStatus, debugFatory } from '@/app/lib';
import { contextFactory } from './context-util';
let debug = debugFatory('Interaction_Context');
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
      debug('InteractionContext: result', result);
      return result;
    },
  },
  {
    defaultVal: {
      onlineNum: 0, //当前所有在线人数，包含主持人
      onlineAuienceNum: 0, //当前所有在线人数，不包含主持人
      historyOnlineNum: 0, //历史在线人数
      handsUpMembers: [] as TCIC.Common.Item<any>[], //举手成员
      onStageMembers: [] as TCIC.Common.Item<any>[], //台上成员列表
      hasEnterTrtcRoom: false, //是否已经进入Trtc房间
      newEnterRoomMembers: [] as TCIC.Common.Item<any>[], //新进入房间的成员
    },
  },
);

/**
 * 用户互动上下文
 */
export let InteractionContext = contextObj.Context;

export let InteractionProvider = contextObj.Provider;
