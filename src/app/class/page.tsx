/**
 * 先必须刷新进入课中页，
 * 销毁重置状态逻辑有问题 退出后重新进入功能异常
 */
'use client';
import styles from './page.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppHeader } from './components/header/header';
import { Loading } from './components/loading/loading';
import { Footer } from './components/footer/footer';
import { Member, MemberList } from './components/member-list/member-list';
import { InfoPanel } from './components/info-panel/info-panel';
import { Chat } from './components/chat/chat';
import { Settings } from './components/settings/settings';
import { useVisible } from '../../../hooks/visible';
import { BootContext } from '../../../contexts/boot.context';
import {
  RoleName,
  TClassStatus,
  checkUserPermission,
  debugFatory,
} from '../lib';
import { InfoNav } from './components/nav/info-nav';
import { Tips } from './components/chat/tips';
import { Hoster } from './hoster';
import { Audience } from './audience';
import { ModalContext } from '../../../contexts/modal.context';
import { useSearchParams, useRouter } from 'next/navigation';
import { SysMsgContext } from '../../../contexts/sysmsg.context';
import { RoomContext } from '../../../contexts/room.context';
import { InteractionContext } from '../../../contexts/interaction.context';
// import VConsole from 'vconsole';

// import { useRouter } from "next/navigation";

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

type MemberHandsUp = {
  user_id: string;
  user_name: string;
  hand_up_times: number;
  hand_up_timestamp: number;
};

let debug = debugFatory('HomePage');

type MemberInfo = TCIC.Common.Item<{ role: RoleName }>;
/**
 *
 * @param Props
 * searchParams从查询参数中获取
 * 处理非角色业务逻辑.
 * 系统消息联动使用SysContext
 * @returns
 */
export default function Home(Props: { params: any }) {
  /**
   * start为授权交互，表示客户本地推流是否开始
   */
  let [start, setStart] = useState(false);
  let { showModal, hideModal, showCounterDown } = useContext(ModalContext);
  let {} = useContext(SysMsgContext);
  let { state: interactionState, dispatch: interactionDispatch } =
    useContext(InteractionContext);
  let [memberListVisible, memberListShow, memberListHide] = useVisible();
  let [roomInfoVisible, roomInfoShow, roomInfoHide] = useVisible();
  let [tipsArray, setTipsArray] = useState<any[]>([]);
  let [btnVisible, setBtnVisible] = useState(true);
  // let timerRef = useRef<any>(null);
  let { state: roomState, dispatch } = useContext(RoomContext);

  let { state } = useContext(BootContext);
  const router = useRouter();
  let searchParams = useSearchParams();
  let token = searchParams.get('token') as string;
  let cid = searchParams.get('cid') as string;
  let uid = searchParams.get('uid') as string;
  useEffect(() => {
    if (state.tcic) {
      let roomInfo: any = state.tcic.classInfo.class_info.room_info;
      debug('state.tcic.memberInfo:', state.tcic.memberInfo);
      /**
       * 设置房间信息
       */
      dispatch({
        type: 'update',
        state: {
          startTime: roomInfo.real_start_time * 1000,
          className: roomInfo.name,
          classState: roomInfo.status,
          classId: `${state.tcic.classInfo.class_info.class_id}`,
          endTime: 0,
        },
      });

      /**
       * 设置用户互动信息
       */
      interactionDispatch({
        type: 'update',
        state: {
          onlineNum: state.tcic.memberInfo.online_number,
          onStageMembers: state.tcic.memberInfo.members.map((item: any) => {
            return {
              id: item.user_id,
              text: item.user_name,
              val: item,
            };
          }),
        },
      });
    }
  }, [state.tcic]);

  useEffect(() => {
    let myInfo = state.tcic?.myInfo();
    let showHandsUpMember = interactionState.handsUpMembers.filter(
      (item) => myInfo.id !== item.id,
    );
    let result = showHandsUpMember.map((item, index: any) => {
      return (
        <Tips
          onClick={() => {
            memberListShow();
          }}
          key={`${item.id}_${index}_${new Date().getTime()}`}
          styles={{
            bottom: `${350 + index * 54}px`,
          }}
        >{`${item.text}申请连麦`}</Tips>
      );
    });
    setTipsArray((preList) => {
      let pre = preList.concat();
      return [...pre, ...result];
    });
  }, [interactionState.handsUpMembers]);

  let leaveRoom = () => {
    /**
     * 页面被销毁时，重置状态
     */
    // setStart(false);
    debug('unmounted class Page', state.tcic);
    state.tcic?.destroy();
    state.tim?.destroy();
    state.trtcClient.unPublish();
    state.trtcClient?.destroy();
    setTimeout(() => {
      router.push(`/`);
    }, 300);
  };

  let whenError = (err: any) => {
    debug('trtcClient:err', err.data);
    if (err.data.error_code != 0) {
      // alert(err.data.error_msg);
      showModal({
        title: `错误码：${err.data.error_code}`,
        content: <div>{`${err.data.error_msg}`}</div>,
        onConfirm: () => {
          hideModal();
          leaveRoom();
        },
        btn: {
          ok: '好的',
        },
      });
    }
  };

  let hostStart = () => {
    debug('wille show counter down');
    setBtnVisible(false);
    debug('wille show counter down');
    showCounterDown({
      counter: 3,
      callback: () => {
        setStart(true);
      },
    });
  };

  let audienceStart = () => {
    setStart(true);
    // let oncallingMembers = state.tcic.memberInfo.members; //台上用户信息
    // // let myInfo = state.myInfo!;
    // debug('Settings Hea roomInfo:', oncallingMembers);
    // debug('Settings myInfo:', myInfo);
    // let isOnCalling = oncallingMembers.find((item: any) => {
    //   return item.user_id === myInfo.userId;
    // });
    // debug('Settings isOnCalling:', isOnCalling);
    // if (isOnCalling && myInfo.detail.role != RoleName.HOSTER) {
    //   showModal({
    //     content: '你已被邀请，是否连麦',
    //     onConfirm: () => {
    //       // Props.trtcClient.startLocalPreview()
    //       hideModal();
    //       setCallEnable(true);
    //     },
    //   });
    // }
  };

  let myRole = RoleName.AUDIENCE;
  if (state.tcic) {
    myRole = state.tcic.myInfo().val.role;
  }
  let isHost = myRole === RoleName.HOSTER;
  let startRover =
    roomState.classState === TClassStatus.Already_Start ? (
      start ? (
        <></>
      ) : (
        btnVisible && (
          <div className={`${styles['ready-cover']}`}>
            <button
              className={`btn btn-primary `}
              onClick={() => {
                isHost ? hostStart() : audienceStart();
              }}
            >
              {isHost ? '恢复直播' : '进入'}
            </button>
          </div>
        )
      )
    ) : (
      <>
        <div className={`${styles['beifore-begin']}`}>
          {myRole === RoleName.HOSTER
            ? '正在准备,请稍后'
            : '主播正在准备,请稍后'}
        </div>
      </>
    );

  return (
    <>
      <AppHeader whenError={whenError} cid={cid} uid={uid} token={token}>
        {state.tcic ? (
          <InfoNav
            showMark={
              isHost
                ? {
                    isBegin:
                      roomState.classState === TClassStatus.Already_Start,
                    startTime: roomState.startTime,
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
                /**
                 * 课程还未开始
                 */
                if (roomState.classState === TClassStatus.Not_Start) {
                  leaveRoom();
                  return;
                }
                let canEndClass = false;
                let myInfo = state.tcic.myInfo();
                if (myInfo && checkUserPermission(myInfo, 'endClass')) {
                  canEndClass = true;
                }
                /**
                 * 课堂未开始不能结束？
                 */
                showModal({
                  content: canEndClass ? '确定结束?' : '确定离开?',
                  onConfirm: () => {
                    hideModal();
                    if (canEndClass) {
                      state.tcic.endClass();
                    }
                    leaveRoom();
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
              {state.tcic ? (
                isHost ? (
                  <Hoster
                    tcic={state.tcic}
                    // client={trtcClient}
                    token={token}
                    start={start}
                  >
                    {startRover}
                  </Hoster>
                ) : (
                  <Audience
                    tcic={state.tcic}
                    // client={trtcClient}
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

        {roomState.classId ? (
          <MemberList
            visible={memberListVisible}
            onHide={memberListHide}
          ></MemberList>
        ) : (
          <></>
        )}
        <InfoPanel visible={roomInfoVisible} onHide={roomInfoHide}></InfoPanel>
        <Footer>
          <div className="row mb-4">
            <div
              className={`${isHost ? 'col-8' : 'col-8'} align-self-end px-1`}
            >
              {roomState.classId && start ? (
                <Chat>{tipsArray.map((item) => item)}</Chat>
              ) : (
                <></>
              )}
            </div>
            <div
              className={`${isHost ? 'col-4' : 'col-4'} align-self-end px-1`}
            >
              <Settings start={start}></Settings>
            </div>
          </div>
          {isHost &&
          roomState.classState === TClassStatus.Not_Start &&
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
                        开始直播
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
