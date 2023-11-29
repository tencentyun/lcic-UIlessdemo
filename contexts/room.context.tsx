/**
 * 房间上下文
 */
import { TClassStatus, debugFatory } from '@/app/lib';
import { contextFactory } from './context-util';
let debug = debugFatory('room_Context');
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
      classId: '',
      className: '',
      startTime: 0,
      endTime: 0,
      classState: TClassStatus.Not_Start,
    },
  },
);

export let RoomContext = contextObj.Context;

export let RoomProvider = contextObj.Provider;
