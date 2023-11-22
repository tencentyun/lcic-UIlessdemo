"use client";
import { Dispatch, useContext, useEffect, useReducer, useState } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { debugFatory } from "@/app/lib";
import { Loading } from "../loading/loading";

export type Member = TCIC.Common.Item<any>;

let debug = debugFatory("MemberList");
type MemberViewProps = {
  page: number;
  pageSize: number;
  members: Member[];
  total: number;
  onlineNumber: number;
};
export function getValidMembers(data: any, hostId: string) {
  return data
    .filter((item: any) => {
      /**
       * 不展示房主，并且只展示在线
       */
      return (
        item.user_id !== hostId && item.current_state == TMemberStatus.Online
      );
    })
    .map((item: any) => {
      return {
        id: item.user_id,
        text: item.user_name,
        val: item,
      };
    });
}

export enum TMemberStatus {
  /**
   * 未到
   */
  Absent = 0,
  /**
   * 在线
   */
  Online = 1,
  /**
   * 已退出
   */
  Quited = 2,
  /**
   * 被踢出
   */
  KickOuted = 3,
  /**
   * 被永久踢出
   */
  KickOutedForever = 4,
  /**
   * 掉线
   */
  Offline = 5,
}
type ActionParam = { type: "update"; arg: Partial<MemberViewProps> };
function memberReducer(state: MemberViewProps, actions: ActionParam) {
  switch (actions.type) {
    case "update":
      return { ...state, ...actions.arg };
    default:
      return state;
  }
}

export function MemberList(Props: {
  onHide: (evnet: any) => void;
  tcic: any;
  classId: string;
  visible: boolean;
  init: {
    members: Member[];
    onlineNumber: number;
    page: number;
    total: number;
  };
}) {
  let [state, dispatch]: [MemberViewProps, Dispatch<ActionParam>] = useReducer(
    memberReducer,
    {
      page: Props.init.page,
      pageSize: 10,
      members: Props.init.members,
      total: Props.init.total,
      onlineNumber: Props.init.onlineNumber,
    } as MemberViewProps
  );

  let [loading, setLoading] = useState(false);
  let tcicObj = Props.tcic;
  let hostInfo: any = tcicObj.hostInfo();
  debug("hostInfo:", hostInfo);
  debug("Props.visible:", Props.visible);

  useEffect(() => {
    if (Props.visible) {
      setLoading(true);
      tcicObj
        .getMembers(Props.classId, {
          page: state.page,
          limit: state.pageSize,
        })
        .then((res: any) => {
          setLoading(false);
          debug("res:", res);
          dispatch({
            type: "update",
            arg: {
              members: getValidMembers(res.members, hostInfo.userId),
              onlineNumber: res.total - res.member_offline_number - 1, //减去host自己
              total: res.total,
            },
          });
        });
    }
  }, [Props.visible]);

  let memberItem = function (data: Member) {
    if (data.id === hostInfo.userId) {
      return;
    }
    return (
      <div className={`${styles["member"]}`} key={data.id}>
        {data.text}
        <i className={`${styles["kickout-icon"]} float-end`}></i>
      </div>
    );
  };

  return (
    <MyOffCanvas
      visible={Props.visible}
      classList={`${styles["bg"]}`}
      header={
        <div className={`${styles["header"]}`}>
          <h1 className={`${styles["title"]}`}>观众列表</h1>
          <div className="container">
            <div className="row">
              <div className="col text-start">
                {`在线观众(${state.onlineNumber})`}
                {loading ? (
                  <div className={`${styles["member-loading"]}`}>
                    <Loading size="small"></Loading>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="col text-end">移出</div>
            </div>
          </div>
        </div>
      }
      onHide={(evt) => {
        Props.onHide && Props.onHide(evt);
      }}
    >
      {state.members.map((item) => memberItem(item))}
      <div className={styles["foot-cover"]}></div>
    </MyOffCanvas>
  );
}
