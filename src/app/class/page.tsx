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
import { debugFatory } from "../lib";
import { InfoNav } from "./components/nav/info-nav";
import { Tips } from "./components/chat/tips";
import { Hoster } from "./hoster";
import { Audience } from "./audience";

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

type MyInfo = {
  userId: string;
  classId: string;
  roleName: "student" | "teacher";
  detail: {
    user_name: string;
  };
};
export const enum RoleName {
  AUDIENCE,
  HOSTER,
}
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
  let [start, setStart] = useState(false);
  let [onlineNumber, setOnlineNumber] = useState(0);
  let [name, setName] = useState("");
  let [trtcClient, setTrtcClient] = useState<any>(null);
  let [memberListVisible, memberListShow, memberListHide] = useVisible();
  let [roomInfoVisible, roomInfoShow, roomInfoHide] = useVisible();
  let [tipsArray, setTipsArray] = useState<any[]>([]);
  let [myRole, setMyRole] = useState<RoleName | null>(null);
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
      let hostInfo = state.tcic.hostInfo();
      debug("hostInfo:", hostInfo);
      setMyRole(hostInfo.detail.role);
      /**
       * 先获取一次成员列表
       */
      state.tcic
        .getMembers(cid, {
          page: 0,
          limit: 10,
        })
        .then((res: any) => {
          setOnlineNumber(res.total - res.member_offline_number - 1); //减去host自己
          setMemberListInitData({
            members: getValidMembers(res.members, hostInfo.userId),
            onlineNumber: res.total - res.member_offline_number - 1, //减去host自己
            total: res.total,
            page: 0,
          });
        });

      /**
       * 获取房主信息
       */
      setName(hostInfo.detail.user_name);
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
          control: () => {},
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

  let startRover = start ? (
    <></>
  ) : (
    <div className={`${styles["ready-cover"]}`}>
      <button className={`btn btn-primary `} onClick={() => setStart(true)}>
        开始
      </button>
    </div>
  );

  return (
    <>
      <AppHeader
        whenReady={whenReady}
        cid={Props.searchParams.cid}
        uid={Props.searchParams.uid}
        token={token}
      >
        {state.tcic ? (
          <InfoNav
            user_name={name}
            online_number={`${onlineNumber}`}
            clickHandler={{
              memberCounter: () => {
                memberListShow();
              },
              name: () => {
                roomInfoShow();
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
          ></MemberList>
        ) : (
          <></>
        )}

        <InfoPanel visible={roomInfoVisible} onHide={roomInfoHide}></InfoPanel>

        <Footer>
          <div className="row">
            <div className="col-8">
              {start ? <Chat>{tipsArray.map((item) => item)}</Chat> : <></>}
            </div>
            <div className="col-4">
              <Settings></Settings>
            </div>
          </div>
        </Footer>
      </main>
    </>
  );
}
