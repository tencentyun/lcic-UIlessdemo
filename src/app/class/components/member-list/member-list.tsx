"use client";
import { Dispatch, useContext, useEffect, useReducer, useState } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { MyInfo, checkUserPermission, debugFatory } from "@/app/lib";
import { Loading } from "../loading/loading";
import { ModalContext } from "../../../../../contexts/modal.context";
import { BootContext } from "../../../../../contexts/boot.context";

export type Member = TCIC.Common.Item<any>;

let debug = debugFatory("MemberList");
type MemberViewProps = {
  page: number;
  pageSize: number;
  members: Member[];
  total: number;
  onlineNumber: number;
  myInfo: MyInfo | null;
  hostInfo: MyInfo | null;
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
      myInfo: null,
      hostInfo: null,
    } as MemberViewProps
  );

  let { state: BootState } = useContext(BootContext);

  let { showModal, hideModal } = useContext(ModalContext);

  let [loading, setLoading] = useState(false);
  useEffect(() => {
    dispatch({
      type: "update",
      arg: {
        myInfo: BootState.myInfo,
        hostInfo: BootState.hostInfo,
      },
    });
  }, [BootState.myInfo]);
  let tcicObj = Props.tcic;
  let roomInfo: { teacher_id: string } =
    Props.tcic.classInfo.class_info.room_info;
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
          let onlineMember = res.total - res.member_offline_number;
          let updateData = {
            members: getValidMembers(res.members, [roomInfo.teacher_id || ""]),
            onlineNumber: state.hostInfo ? onlineMember - 1 : onlineMember, //减去host自己
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

  if (!tcicObj) {
    return;
  }

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
          members: getValidMembers(state.members, [
            roomInfo.teacher_id || "",
            udata.id,
          ]),
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

  let hasKickPermission = state.myInfo
    ? checkUserPermission(state.myInfo, "kickOut")
    : false;
  let memberItem = function (data: Member) {
    if (data.id === roomInfo.teacher_id) {
      return;
    }
    let text = data.text;
    if (state.myInfo?.userId === data.id) {
      text = `${data.text}(我)`;
    }

    return (
      <div className={`${styles["member"]}`} key={data.id}>
        {text}
        {hasKickPermission ? (
          <i
            className={`${styles["kickout-icon"]} float-end`}
            onClick={() => {
              kickoutUser(data);
            }}
          ></i>
        ) : (
          <></>
        )}
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
              {hasKickPermission ? (
                <div className="col text-end">移出</div>
              ) : (
                <></>
              )}
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
