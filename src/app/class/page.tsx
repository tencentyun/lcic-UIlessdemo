"use client";
import styles from "./page.module.css";
import { useContext, useEffect, useState } from "react";
import { AppHeader } from "./components/header/header";
import { Loading } from "./components/loading/loading";
import { Footer } from "./components/footer/footer";
import {
  Member,
  MemberList,
  getValidMembers,
} from "./components/member-list/member-list";
import { InfoPanel } from "./components/info-panel/info-panel";
import { Chat } from "./components/chat/chat";
import { Settings } from "./components/settings/settings";
import { useVisible } from "../../../hooks/visible";
import { BootContext } from "../../../contexts/boot.context";
import {
  MyInfo,
  RoleName,
  TClassStatus,
  checkUserPermission,
  debugFatory,
} from "../lib";
import { InfoNav } from "./components/nav/info-nav";
import { Tips } from "./components/chat/tips";
import { Hoster } from "./hoster";
import { Audience } from "./audience";
import { ModalContext } from "../../../contexts/modal.context";
import { useRouter } from "next/navigation";

// type
// :
// "main"
// url
// :
// "webrtc://29734.liveplay.myqcloud.com/live/1400313729_326322678_tic_push_user_326322678_168497_main?txSecret=644ab9465ed91dd7f6cfe1a5fc35a1b7&txTime=654B9520"
// user_id
// :
// "tic_push_user_326322678_168497"

export type MemberStream = {
  type: string;
  user_id: string;
  url: string;
};

let debug = debugFatory("HomePage");
/**
 *
 * @param Props
 *  searchParams从查询参数中获取
 * @returns
 */
export default function Home(Props: {
  params: any;
  searchParams: {
    cid: string;
    token: string;
    uid: string;
  };
}) {
  /**
   * start为授权交互，表示客户本地推流是否开始
   */
  let [start, setStart] = useState(false);
  let { showModal, hideModal, showCounterDown } = useContext(ModalContext);
  let [onlineNumber, setOnlineNumber] = useState(0);
  let [trtcClient, setTrtcClient] = useState<any>(null);
  let [memberListVisible, memberListShow, memberListHide] = useVisible();
  let [roomInfoVisible, roomInfoShow, roomInfoHide] = useVisible();
  let [tipsArray, setTipsArray] = useState<any[]>([]);
  let [myRole, setMyRole] = useState<RoleName | null>(null);
  let [btnVisible, setBtnVisible] = useState(true);
  let [classInfo, setClassInfo] = useState({
    startTime: 0,
    classState: TClassStatus.Not_Start,
    name: "",
  });
  const router = useRouter();

  let { state } = useContext(BootContext);
  let [memberListInitData, setMemberListInitData] = useState<{
    members: Member[];
    onlineNumber: number;
    page: number;
    total: number;
  } | null>(null);
  let token = Props.searchParams.token;
  let cid = Props.searchParams.cid;
  useEffect(() => {
    if (state.tcic) {
      let hostInfo: MyInfo | null = state.hostInfo;
      let myInfo: MyInfo = state.myInfo!;
      let roomInfo: any = state.tcic.classInfo.class_info.room_info;
      debug("roomInfo:", roomInfo);
      debug("myInfo:", myInfo);
      /**
       * 主播则等待开播
       */
      setClassInfo({
        classState: roomInfo.status,
        startTime: roomInfo.real_start_time,
        name: roomInfo.name,
      });
      // if (roomInfo.teacher_id === myInfo.userId) {
      //   setIsBegin(true);
      // }

      setMyRole(myInfo.detail.role);
      /**
       * 先获取一次成员列表
       */
      state.tcic
        .getMembers(cid, {
          page: 0,
          limit: 10,
        })
        .then((res: any) => {
          let onlineNumber = hostInfo //房主可能不在线
            ? res.total - res.member_offline_number - 1
            : res.total - res.member_offline_number;
          setOnlineNumber(onlineNumber); //减去host自己
          setMemberListInitData({
            members: getValidMembers(res.members, [hostInfo?.userId || ""]),
            onlineNumber: onlineNumber,
            total: res.total,
            page: 0,
          });
        });
    }
  }, [state.tcic]);

  useEffect(() => {
    if (state.tim) {
      state.tim.on("saasadminMsgReceived", (payload: any, data: any) => {
        debug("saasadminMsgReceived:", payload);
        let msgTypeMap: any = {
          /**
           * 事件控制？
           */
          event: () => {
            /**
             * 动作行为
             */
            let eventActionMap: any = {
              member_quit: () => {
                debug("member_quit:", payload);
              },
              member_online: () => {
                debug("member_online", payload);
                let result = payload.data.data.map(
                  (
                    item: { avatar: string; nickname: string; user_id: string },
                    index: any
                  ) => {
                    return (
                      <Tips
                        key={`${item.user_id}_${index}_${new Date().getTime()}`}
                        styles={{
                          bottom: `${350 + index * 54}px`,
                        }}
                      >{`${item.nickname}来了`}</Tips>
                    );
                  }
                );
                setTipsArray((preList) => {
                  let pre = preList.concat();
                  return [...pre, ...result];
                });
              },
            };
            eventActionMap[payload.data.action] &&
              eventActionMap[payload.data.action]();
          },
          /**
           * 房间控制？
           */
          control: () => {
            let eventActionMap: any = {
              class_info_change: () => {
                if (payload.data.data.status === TClassStatus.Already_Start) {
                  setClassInfo((preState) => {
                    return {
                      ...preState,
                      classState: TClassStatus.Already_Start,
                      startTime: payload.data.data.real_start_time,
                    };
                  });
                }
                /**
                 * 会出现两种消息，第二种不知道有什么用
                 * {
    "action": "class_info_change",
    "data": {
        "real_end_time": 1700721430,
        "status": 2
    },
    "online_number": 0
}
{
    "action": "class_info_change",
    "data": {
        "message_record_url": "https://tcic-dev-source-1257307760.cos.ap-shanghai.myqcloud.com/message/prod/3923193/332868184_1700711299_im.log"
    },
    "online_number": 0
}

                 * 
                 */
              },
              change_member_stream: () => {},
              class_end: () => {
                showModal({
                  content: "已结束",
                  onConfirm: () => {
                    hideModal();
                    router.push("/");
                  },
                });
              },
            };
            eventActionMap[payload.data.action] &&
              eventActionMap[payload.data.action]();
          },
          /**
           * 权限更新
           */
          "v1/permissions": () => {},
          /**
           * 房间信息同步
           */
          "v1/sync": () => {
            debug("v1/sync:", payload);
            /**
             * 更新在线人数
             */
            setOnlineNumber(payload.data.online_number);
          },
        };

        msgTypeMap[payload.type] && msgTypeMap[payload.type]();
      });
    }
  }, [state.tim]);
  /**
   *  获取流类型
   * main为主流 ， auxiliary为辅流,电商场景，没有辅流
   */

  let whenReady = (tcic: any) => {
    let trtcClient = new TCIC_SPY.createTrtcClient(tcic);
    debug("trtcClient:", trtcClient);
    setTrtcClient(trtcClient);
  };

  let whenError = (err: any) => {
    if (err.data.error_code === 10301) {
      // alert(err.data.error_msg);
      showModal({
        content: <div>{err.data.error_msg}</div>,
        onConfirm: () => {
          hideModal();
          router.push("/");
        },
        btn: {
          ok: "好的",
        },
      });
      debug("trtcClient:err", err.data);
    }
  };

  let hostStart = () => {
    setBtnVisible(false);
    showCounterDown({
      counter: 3,
      callback: () => {
        setStart(true);
      },
    });
  };

  let startRover =
    classInfo.classState === TClassStatus.Already_Start ? (
      start ? (
        <></>
      ) : (
        btnVisible && (
          <div className={`${styles["ready-cover"]}`}>
            <button
              className={`btn btn-primary `}
              onClick={() => {
                myRole === RoleName.HOSTER ? hostStart() : setStart(true);
              }}
            >
              {myRole === RoleName.HOSTER ? "恢复直播" : "进入"}
            </button>
          </div>
        )
      )
    ) : (
      <>
        <div className={`${styles["beifore-begin"]}`}>正在准备,请稍后</div>
      </>
    );

  return (
    <>
      <AppHeader
        whenReady={whenReady}
        whenError={whenError}
        cid={Props.searchParams.cid}
        uid={Props.searchParams.uid}
        token={token}
      >
        {state.tcic ? (
          <InfoNav
            title={classInfo.name}
            online_number={`${onlineNumber}`}
            showMark={
              myRole === RoleName.HOSTER
                ? {
                    isBegin:
                      classInfo.classState === TClassStatus.Already_Start,
                    startTime: classInfo.startTime * 1000,
                  }
                : undefined
            }
            clickHandler={{
              memberCounter: () => {
                memberListShow();
              },
              name: () => {
                roomInfoShow();
              },
              quit: () => {
                let canEndClass = false;
                if (checkUserPermission(state.tcic.myInfo(), "endClass")) {
                  canEndClass = true;
                }
                showModal({
                  content: canEndClass ? "确定结束?" : "确定离开?",
                  onConfirm: () => {
                    hideModal();
                    if (canEndClass) {
                      state.tcic.endClass();
                    }
                    window.location.href = "/";
                  },
                });
              },
            }}
          ></InfoNav>
        ) : (
          <div className="navbar navbar-expand-md navbar-dark fixed-top">
            {/* <Loading size="small"></Loading> */}
          </div>
        )}
      </AppHeader>
      <main className={`${styles.main}`}>
        <div className={`container-lg`}>
          <div className="row">
            <div className="col">
              {typeof myRole === "number" ? (
                myRole === RoleName.HOSTER ? (
                  <Hoster
                    tcic={state.tcic}
                    client={trtcClient}
                    token={token}
                    start={start}
                  >
                    {startRover}
                  </Hoster>
                ) : (
                  <Audience
                    tcic={state.tcic}
                    client={trtcClient}
                    start={start}
                    token={token}
                  >
                    {startRover}
                  </Audience>
                )
              ) : (
                <div className={`${styles.main}`}>
                  <Loading></Loading>
                </div>
              )}
            </div>
          </div>
        </div>

        {memberListInitData ? (
          <MemberList
            visible={memberListVisible}
            onHide={memberListHide}
            tcic={state.tcic}
            classId={cid}
            init={memberListInitData}
            onUpdate={(data) => {
              /**
               * 列表同步数据
               */
              setOnlineNumber(data.onlineNumber);
            }}
          ></MemberList>
        ) : (
          <></>
        )}
        <InfoPanel visible={roomInfoVisible} onHide={roomInfoHide}></InfoPanel>
        <Footer>
          <div className="row mb-4">
            <div className="col-8">
              {typeof myRole === "number" ? (
                <Chat isHost={myRole === RoleName.HOSTER}>
                  {tipsArray.map((item) => item)}
                </Chat>
              ) : (
                <></>
              )}
            </div>
            <div className="col-4">
              <Settings></Settings>
            </div>
          </div>
          {myRole === RoleName.HOSTER &&
          classInfo.classState === TClassStatus.Not_Start &&
          !start ? (
            btnVisible && (
              <>
                <div className="row mb-4">
                  <div className="col">
                    <div className="d-grid gap-2">
                      <button
                        className={`btn btn-primary `}
                        onClick={hostStart}
                      >
                        开始
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )
          ) : (
            <></>
          )}
        </Footer>
      </main>
    </>
  );
}
