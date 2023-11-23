"use client";
import { Dispatch, useContext, useEffect, useReducer, useState } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { debugFatory } from "@/app/lib";
import { Loading } from "../loading/loading";
import { ModalContext } from "../../../../../contexts/modal.context";

export type Member = TCIC.Common.Item<any>;

let debug = debugFatory("MemberList");
type MemberViewProps = {
  page: number;
  pageSize: number;
  members: Member[];
  total: number;
  onlineNumber: number;
};
export function getValidMembers(data: any, exceptIds: string[]) {
  return data
    .filter((item: any) => {
      /**
       * 不展示房主，并且只展示在线
       */
      return (
        !exceptIds.includes(item.user_id) &&
        item.current_state == TMemberStatus.Online
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
  onUpdate?: (data: {
    members: Member[];
    onlineNumber: number;
    total: number;
  }) => void;
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

  let { showModal, hideModal } = useContext(ModalContext);
  let [kickOutedUser, setKickOuted] = useState(new Set());

  let [loading, setLoading] = useState(false);
  let tcicObj = Props.tcic;
  if (!tcicObj) {
    return;
  }
  let hostInfo: any = tcicObj.hostInfo();
  debug("hostInfo:", Props.tcic);
  // debug("Props.visible:", Props.visible);

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
          let updateData = {
            members: getValidMembers(res.members, [hostInfo.userId]),
            onlineNumber: res.total - res.member_offline_number - 1, //减去host自己
            total: res.total,
          };
          Props.onUpdate && Props.onUpdate(updateData);

          dispatch({
            type: "update",
            arg: updateData,
          });
        });
    }
  }, [Props.visible]);

  let kickoutUser = (udata: Member) => {
    debug("userId", udata);
    showModal({
      content: `确定踢出用户${udata.text}？`,
      onCancel: () => {
        hideModal();
      },
      onConfirm() {
        hideModal();
        let updateData = {
          members: getValidMembers(state.members, [hostInfo.userId, udata.id]),
          onlineNumber: state.onlineNumber - 1, //减去刚踢的用户
          total: state.total - 1,
        };
        Props.onUpdate && Props.onUpdate(updateData);
        dispatch({
          type: "update",
          arg: updateData,
        });
        Props.tcic.memberAction({
          classId: Props.classId,
          userId: udata.id,
          actionType: 18,
          /**
           * 参考用户行为, 18: 踢出,
           * todo: 将类型引入到项目
           **/
        });
      },
    });
  };

  let memberItem = function (data: Member) {
    if (data.id === hostInfo.userId) {
      return;
    }
    return (
      <div className={`${styles["member"]}`} key={data.id}>
        {data.text}
        <i
          className={`${styles["kickout-icon"]} float-end`}
          onClick={() => {
            kickoutUser(data);
          }}
        ></i>
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
