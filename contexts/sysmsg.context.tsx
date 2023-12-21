import { createContext, use, useContext, useEffect } from 'react';
import { BootContext } from './boot.context';
import { RoleName, debugFatory } from '@/app/lib';
import { ModalContext } from './modal.context';
import { RoomContext } from './room.context';
import { InteractionContext } from './interaction.context';
import { PermissionContext } from './permission.context';
let debug = debugFatory('sysMsg');

let defaultVal = {};

let contextObj = createContext(defaultVal);

/**
 * 系统消息上下文
 */
export let SysMsgContext = contextObj;

// let leaveRoom = () => {
//     /**
//      * 页面被销毁时，重置状态
//      */
//     setStart(false);
//     debug('unmounted class Page', state.tcic);
//     state.tcic?.destroy();
//     state.tim?.destroy();
//     state.trtcClient?.destroy();
//     setTimeout(() => {
//       router.push(`/`);
//     }, 300);
//   };

/**
 * 系统消息提供者
 */
export function SysMsgProvider(Props: { children: any }) {
  let { state } = useContext(BootContext);
  let { state: RoomState, dispatch: roomDispatch } = useContext(RoomContext);
  let { state: InterationState, dispatch: interationUpdate } =
    useContext(InteractionContext);

  let { state: permissions, dispatch: permissionUpdate } =
    useContext(PermissionContext);
  let { showModal, hideModal, showCounterDown } = useContext(ModalContext);
  useEffect(() => {
    if (state.tim) {
      state.tim.on('saasadminMsgReceived', (payload: any, data: any) => {
        debug('saasadminMsgReceived: payload', payload, data);
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
                debug('member_quit:', payload);
              },
              member_join: () => {
                debug('member_join:', payload);
                interationUpdate({
                  type: 'update',
                  state: {
                    onlineAuienceNum: InterationState.onlineAuienceNum + 1,
                    newEnterRoomMembers: payload.data.data.map((item: any) => {
                      return {
                        id: item.user_id,
                        text: item.nickname,
                        val: item,
                      };
                    }),
                  },
                });
              },
              member_online: () => {
                debug('member_online', payload);
                let result = payload.data.data.map(
                  (
                    item: {
                      avatar: string;
                      nickname: string;
                      user_id: string;
                    },
                    index: any,
                  ) => {
                    //   return (
                    //     <Tips
                    //       key={`${
                    //         item.user_id
                    //       }_${index}_${new Date().getTime()}`}
                    //       styles={{
                    //         bottom: `${350 + index * 54}px`,
                    //       }}
                    //     >{`${item.nickname}来了`}</Tips>
                    //   );
                  },
                );
                //   setTipsArray((preList) => {
                //     let pre = preList.concat();
                //     return [...pre, ...result];
                //   });
              },
              change_member_stream: () => {
                debug('change_member_stream', payload);
                state.tcic?.setStreamConfigs(
                  payload.data.data,
                  payload.data.stream_list_seq,
                );
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
                debug('control got classInfoChanged', payload);

                roomDispatch({
                  type: 'update',
                  state: {
                    classState: payload.data.data.status,
                    startTime: payload.data.data.real_start_time * 1000,
                  },
                });
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
              class_end: () => {
                showModal({
                  content: '已结束',
                  onConfirm: () => {
                    hideModal();
                  },
                });
              },
            };
            eventActionMap[payload.data.action] &&
              eventActionMap[payload.data.action]();
          },

          /**
           *  用户举手，申请连麦功能
           */
          'v1/hand_up': () => {
            //   let resutMembers: MemberHandsUp[] = payload.data.hand_ups;
            debug('v1/hand_up:', payload);

            interationUpdate({
              type: 'update',
              state: {
                handsUpMembers: payload.data.hand_ups.map((item: any) => {
                  return {
                    id: item.user_id,
                    text: item.user_name,
                    val: item,
                  };
                }),
              },
            });
            //   /**
            //    * 过滤掉自己，避免重复出现小红点
            //    */
            //   let handUpsMember = resutMembers.filter(
            //     (item) => item.user_id != uid,
            //   );
            //   if (!timerRef.current && handUpsMember.length > 0) {
            //     timerRef.current = setTimeout(() => {
            //       timerRef.current = null;
            //       setStageMemberInfo((preList) => {
            //         return {
            //           ...preList,
            //           red: false,
            //         };
            //       });
            //     }, 3000);
            //     setStageMemberInfo({
            //       ...stageMemberInfo,
            //       red: true,
            //       handsup: handUpsMember.map((item) => {
            //         return {
            //           id: item.user_id,
            //           text: item.user_name,
            //           val: item,
            //         };
            //       }),
            //     });
            //   }
            //   let result = handUpsMember.map((item, index) => {
            //     return (
            //       <Tips
            //         key={`${item.user_id}_${index}_${new Date().getTime()}`}
            //         styles={{
            //           bottom: `${350 + index * 54}px`,
            //         }}
            //       >{`${item.user_name}申请连麦`}</Tips>
            //     );
            //   });
            //   setTipsArray((preList) => {
            //     let pre = preList.concat();
            //     return [...pre, ...result];
            //   });
          },
          /**
           * trtc房间权限更新，主要涵盖音视频/白板相关内容，
           * 例如屏幕分享，音视频，白板操作等等
           */
          'v1/permissions': () => {
            // debug('v1/permissions:', payload);
            // //   debug('saasadminMsgReceived: ', payload.data.permissions);
            // let myPermission = payload.data.permissions.find((item: any) => {
            //   return item.user_id == state.tcic.userId;
            // });

            interationUpdate({
              type: 'update',
              state: {
                onStageMembers: payload.data.permissions.map((item: any) => {
                  return {
                    id: item.user_id,
                    text: item.user_name,
                    val: item,
                  };
                }),
              },
            });

            //   let myInfo = state.tcic.myInfo();
            //   if (myPermission && myInfo.val.role != RoleName.HOSTER) {
            //     /**
            //      * 直播场景简单处理，只要上台就允许连麦
            //      */
            //     debug('myPermission:', myPermission);
            //     showModal({
            //       content: '你已被邀请，是否连麦',
            //       onConfirm: () => {
            //         // Props.trtcClient.startLocalPreview()
            //         hideModal();
            //       },
            //     });
            //     //   } else {
            //     //     // setCallEnable(false);
            //   }
          },
          /**
           * 房间信息同步
           */
          'v1/sync': () => {
            interationUpdate({
              type: 'update',
              state: {
                onlineAuienceNum:
                  payload.data.online_number -
                  payload.data.teacher_online_number,
                onlineNum: payload.data.online_number,
              },
            });
            //   debug('v1/sync:', payload);
            //   /**
            //    * 更新在线人数
            //    */
            //   setOnlineNumber(
            //     payload.data.online_number - payload.data.teacher_online_number, //在线人数减去老师在线人数
            //   );
          },
        };

        msgTypeMap[payload.type] && msgTypeMap[payload.type]();
      });
    }
  }, [state.tim]);

  return (
    <contextObj.Provider value={defaultVal}>
      {Props.children}
    </contextObj.Provider>
  );
}
