let debugObj = require('debug');

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
    debugObj.enable('TC:*');
  }
  console.log('debugObj:', debugKey);
  return target!;
}

export const enum RoleName {
  AUDIENCE,
  HOSTER,
}

export const enum CallState {
  Ready = 'ready',
  Unready = 'unready',
}

export const enum RoomType {
  RTC,
  LIVE,
}

/**
 * 课堂状态
 * @enum {number}
 */
export enum TClassStatus {
  /**
   * 未开始
   */
  Not_Start,

  /**
   * 已经开始
   */
  Already_Start,

  /**
   * 已经结束
   */
  Has_Ended,

  /**
   * 已过期
   */
  Has_Expired,
}

/**
 * 成员相关操作
 */
export enum TMemberActionType {
  None = 0,
  /**
   * 打开摄像头
   */
  Camera_Open = 1,
  /**
   * 关闭摄像头
   */
  Camera_Close = 2,
  /**
   * 打开麦克风
   */
  Mic_Open = 3,
  /**
   * 关闭麦克风
   */
  Mic_Close = 4,
  /**
   * 打开摄像头和麦克风
   */
  Camera_Mic_Open = 5,
  /**
   * 关闭摄像头和麦克风
   */
  Camera_Mic_Close = 6,
  /**
   * 举手
   */
  Hand_Up = 7,
  /**
   * 取消举手
   */
  Hand_Up_Cancel = 8,
  /**
   * 踢出课堂
   */
  Kick_Out = 9,
  /**
   * 允许操作白板
   */
  Board_Enable = 10,
  /**
   * 禁止操作白板
   */
  Board_Disable = 11,
  /**
   * 禁言
   */
  Silence = 12,
  /**
   * 取消禁言
   */
  Silence_Cancel = 13,
  /**
   * 开始屏幕分享
   */
  Screen_Share_Open = 14,
  /**
   * 停止屏幕分享
   */
  Screen_Share_Close = 15,
  /**
   * 上台
   */
  Stage_Up = 16,
  /**
   * 下台
   */
  Stage_Down = 17,
  /**
   * 永久踢出
   */
  Kick_Out_Forever = 18,
  /**
   * 分享播片
   */
  Vod_Play = 19,
  /**
   * 分享辅助摄像头
   */
  Sub_Camera = 20,
}

export type MyInfo = TCIC.Common.Item<any>;
/**
 * 权限列表
 */
export type PermisionList = 'kickOut' | 'endClass';
/**
 * 检查用户权限
 */
export function checkUserPermission(
  userInfo: MyInfo,
  permissions: PermisionList,
) {
  const rolePermissionMap: PermisionList[][] = [[], ['kickOut', 'endClass']];
  if (typeof userInfo.val.role !== 'number') {
    return false;
  }
  const arr = rolePermissionMap[userInfo.val.role || 0];
  if (Array.isArray(arr) && arr.length && arr.includes(permissions)) {
    return true;
  }
  return false;
}
