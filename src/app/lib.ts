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

export type MyInfo = {
  userId: string;
  classId: string;
  roleName: 'student' | 'teacher';
  detail: {
    role: RoleName;
    nickname: string;
  };
};
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
  let rolePermissionMap: PermisionList[][] = [[], ['kickOut', 'endClass']];
  if (rolePermissionMap[userInfo.detail.role].includes(permissions)) {
    return true;
  }
}
