import { useContext, useEffect, useState } from 'react';
import styles from './page.module.css';
import { CallState, debugFatory, RoomType } from '../lib';
import { BootContext } from '../../../contexts/boot.context';
import { InteractionContext } from '../../../contexts/interaction.context';

let debug = debugFatory('Audience');

export function Audience(Props: {
  children?: any;
  tcic: any;
  token: string;
  start: boolean;
  liveMode?: boolean; // 直播模式，只观看不连麦
}) {
  const streamType = ['main'];
  let { state } = useContext(BootContext);
  let [start, setStart] = useState(false);
  let [callReady, setCallReady] = useState(false);
  let [callState, setCallState] = useState(CallState.Unready);
  let { dispatch: interactionUpdate } = useContext(InteractionContext);
  const { state: Interactions } = useContext(InteractionContext);
  let trtcClient = state.trtcClient;
  let roomInfo = Props.tcic?.classInfo.class_info.room_info || {};
  const roomType = roomInfo.room_type; // 0 互动课 1 直播课
  // console.log('auidence roomInfo:', roomInfo);
  let _firstLivePlay = true; // 第一次播放，需要静音
  let videoStart = () => {
    console.log('run video start');
    // const checkIfOnStage = () => {
    //   const myInfo = state.tcic?.myInfo();
    //   return Interactions.onStageMembers.find((item) => item.id === myInfo.id);
    // };
    // const isOnStage = checkIfOnStage();
    /**
     * 互动课
     */
    if (
      roomType === RoomType.RTC ||
      (roomType === RoomType.LIVE && Interactions.callState === CallState.Ready)
    ) {
      console.log('run in RTC mode', Interactions.callState);
      // 互动课需要进trtc房间
      // 直播课上麦需要进trtc房间
      trtcClient?.enterRoom().then(() => {
        interactionUpdate({
          type: 'update',
          state: {
            hasEnterTrtcRoom: true,
          },
        });
        streamType.forEach(async (streamType: any) => {
          console.log('start remote in rtc mode', trtcClient);
          const tcPlayerIns = trtcClient?.getTcPlayerInstance({
            userId: roomInfo.teacher_id,
            streamType,
          });
          if (tcPlayerIns) {
            await trtcClient?.stopRemote({
              userId: roomInfo.teacher_id,
              streamType,
            });
          }
          await trtcClient?.startRemote({
            view: `${roomInfo.teacher_id}`,
            streamType,
            userId: roomInfo.teacher_id,
          });
        });
      });
    } else if (
      roomType === RoomType.LIVE &&
      Interactions.callState === CallState.Unready
    ) {
      let currIsEnterRoom = Interactions.hasEnterTrtcRoom;
      console.log('run in LIVE mode', Interactions.callState);
      // 直播课， 默认不用进trtc房间
      interactionUpdate({
        type: 'update',
        state: {
          hasEnterTrtcRoom: false,
        },
      });
      streamType.forEach(async (streamType: any) => {
        console.log('start remote in live class', streamType);
        // 如果已经在trtc房间， 退房
        if (currIsEnterRoom) {
          await trtcClient?.stopRemote({
            userId: roomInfo.teacher_id,
            streamType,
          });
          await trtcClient?.leaveRoom();
        }
        // 启动远端视频，使用tcplayer
        await trtcClient?.startRemote({
          view: `${roomInfo.teacher_id}`,
          streamType,
          userId: roomInfo.teacher_id,
          useTcPlayer: true,
        });

        const tcPlayerIns = trtcClient?.getTcPlayerInstance({
          userId: roomInfo.teacher_id,
          streamType,
        });
        if (tcPlayerIns) {
          // 拿到tcplayer实例后可以监听方法
          tcPlayerIns.on('ready', () => {
            console.log('tc-player is ready...');
            const isMuted = tcPlayerIns.muted();
            console.log('is muted ==', isMuted);
            // 第一次播放自动静音， 后面的话可以代码调节不静音
            if (_firstLivePlay) {
              _firstLivePlay = false;
            } else {
              if (isMuted) {
                tcPlayerIns.muted(true);
              }
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    let hasChangeCallState = false;
    let hasChangeStartState = false;
    if (start !== Props.start) {
      hasChangeStartState = true;
    }
    if (callState !== Interactions.callState) {
      hasChangeCallState = true;
    }
    if (Props.start && (hasChangeCallState || hasChangeStartState)) {
      setStart(Props.start);
      // setCallReady(Interactions.callState);
      setCallState(Interactions.callState);
      videoStart();
    }

    // if (!start) {
    //   if (Props.start) {
    //     setStart(true);
    //     videoStart();
    //   }
    // }
  }, [Props.start, Interactions.callState]);
  //   else {
  //     videPause();
  //   }
  return (
    <div className={styles['stream-wrap']}>
      <div
        className={styles['stream-view']}
        id={`${roomInfo.teacher_id}`}
      ></div>
      {Props.children}
      {/* <div className={styles["stream-wrap"]} key={member.user_id}><div></div> */}
    </div>
  );
}
