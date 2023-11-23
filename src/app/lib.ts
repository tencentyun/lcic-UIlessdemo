let debugObj = require("debug");

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
    debugObj.enable("TC:*");
  }
  console.log("debugObj:", debugKey);
  return target!;
}

export const enum RoleName {
  AUDIENCE,
  HOSTER,
}

export type MyInfo = {
  userId: string;
  classId: string;
  roleName: "student" | "teacher";
  detail: {
    user_name: string;
    role: RoleName;
  };
};
/**
 * 权限列表
 */
export type PermisionList = "kickOut" | "endClass";
/**
 * 检查用户权限
 */
export function checkUserPermission(
  userInfo: MyInfo,
  permissions: PermisionList
) {
  let rolePermissionMap: PermisionList[][] = [[], ["kickOut", "endClass"]];
  if (rolePermissionMap[userInfo.detail.role].includes(permissions)) {
    return true;
  }
}
