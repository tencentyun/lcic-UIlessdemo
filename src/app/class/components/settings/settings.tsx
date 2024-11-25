import { useContext, useEffect, useState } from 'react';
import style from './style.module.css';
import { BootContext } from '../../../../../contexts/boot.context';
import { SettingList } from '../setting-list/setting-list';
import { useVisible } from '../../../../../hooks/visible';
import { CallState, debugFatory, RoomType, TMemberActionType } from '@/app/lib';
import { ModalContext } from '../../../../../contexts/modal.context';
import { InteractionContext } from '../../../../../contexts/interaction.context';

let debug = debugFatory('Settings');
type SettingItem = TCIC.Common.Item<{
  icon: string;
}>;
type RemoteItem = TCIC.Common.Item<any>;

const totalSettings: SettingItem[] = [
  // {
  //   id: 'share',
  //   text: '分享',
  //   val: {
  //     icon: `${style['s-share-icon']}`,
  //   },
  // },
  // {
  //   id: 'setting',
  //   text: '设置',
  //   val: {
  //     icon: `${style['s-setting-icon']}`,
  //   },
  // },
  {
    id: 'call',
    text: '连麦',
    val: {
      icon: `${style['s-call-icon']}`,
    },
  },

  // {
  //   id: 'gift',
  //   text: '赠送礼物',
  //   val: {
  //     icon: `${style['s-gift-icon']}`,
  //   },
  // },
  {
    id: 'video',
    text: '视频',
    val: {
      icon: `${style['s-video-icon']}`,
    },
  },
  {
    id: 'audio',
    text: '音频',
    val: {
      icon: `${style['s-audio-icon']}`,
    },
  },
  // {
  //   id: 'awesome',
  //   text: '点赞',
  //   val: {
  //     icon: `${style['s-awesome-icon']}`,
  //   },
  // },
  {
    id: 'speaker',
    text: '静音',
    val: {
      icon: `${style['s-speaker-icon']}`,
    },
  },
];
const hosterList = ['setting', 'share', 'video', 'audio'];
const audienceList = [
  'share',
  'gift',
  'call',
  'awesome',
  'video',
  'audio',
  'speaker',
];

/**
 *
 * @param Props
 * @returns
 */
export function Settings(Props: {
  start: boolean; // 是否开始
  onCancel?: any;
}) {
  const { state } = useContext(BootContext);
  const [settingVisible, settingListShow, settingListHide] = useVisible();
  const [shareVisible, shareShow, shareHide] = useVisible();
  const [published, setPublished] = useState(false);
  const [remoteList, setRemoteList] = useState([] as RemoteItem[]);
  const [settingList, setSettingList] = useState<SettingItem[]>([]);
  const { showModal, hideModal, showCounterDown } = useContext(ModalContext);
  const [callEnable, setCallEnable] = useState({
    able: false, //远端是否允许上麦
    ready: false, //本地上麦意愿
  });
  const { state: Interactions } = useContext(InteractionContext);
  let { dispatch: interactionUpdate } = useContext(InteractionContext);

  // 默认打开
  const [audioStatus, setAudioStatus] = useState<boolean>(true);
  const [videoStatus, setVideoStatus] = useState<boolean>(true);
  // 直播声音
  const [speakerStatus, setSpeakerStatus] = useState<boolean>(false);

  /**
   * 主动下台
   */
  const downStage = () => {
    state.tcic?.memberAction({
      classId: `${state.tcic.classId}`,
      userId: state.tcic?.myInfo().id,
      actionType: TMemberActionType.Stage_Down,
    });
    state.tcic?.memberAction({
      classId: `${state.tcic.classId}`,
      userId: state.tcic?.myInfo().id,
      actionType: TMemberActionType.Hand_Up_Cancel,
    });
    setCallEnable((pre) => {
      return {
        ...pre,
        ready: false,
      };
    });
    if (published) {
      // state.trtcClient?.unPublish();
      state.trtcClient?.stopLocalPreview();
      setPublished(false);
    }
  };

  /**
   * 申请上台
   */
  const upStage = () => {
    setCallEnable((pre) => {
      return { ...pre, ready: false };
    });
    state.tcic?.memberAction({
      classId: `${state.tcic.classId}`,
      userId: state.tcic?.myInfo().id,
      actionType: TMemberActionType.Hand_Up,
    });
  };
  const clickHandler = (item: SettingItem) => {
    const settingHandlerMap: any = {
      call: () => {
        if (!callEnable.ready) {
          if (state.trtcClient) {
            showModal({
              content: '申请连麦',
              onConfirm: () => {
                hideModal();
                upStage();
              },
            });
          }
        } else {
          if (state.trtcClient) {
            showModal({
              content: '取消连麦',
              onConfirm: () => {
                hideModal();
                downStage();
                interactionUpdate({
                  type: 'update',
                  state: {
                    callState: CallState.Unready,
                  },
                });
              },
            });
          }
        }
      },
      video: () => {
        if (!state.trtcClient) {
          return;
        }
        let p = Promise.resolve();
        if (videoStatus) {
          p = state.trtcClient.mute({ target: ['video'] });
        } else {
          p = state.trtcClient.unmute({ target: ['video'] });
        }
        p.then(() => {
          setVideoStatus((status) => !status);
        }).catch((e) => {
          console.error('trtc video error:', e.message);
        });
      },
      audio: () => {
        if (!state.trtcClient) {
          return;
        }
        let p = Promise.resolve();
        if (audioStatus) {
          p = state.trtcClient.mute({ target: ['audio'] });
        } else {
          p = state.trtcClient.unmute({ target: ['audio'] });
        }
        p.then(() => {
          setAudioStatus((status) => !status);
        }).catch((e) => {
          console.error('trtc audio error:', e.message);
        });
      },
      speaker: () => {
        if (!state.tcic || !state.trtcClient) {
          return;
        }
        const hostInfo = state.tcic.hostInfo();
        const player = state.trtcClient.getTcPlayerInstance({
          userId: hostInfo.id,
          streamType: 'main' as any,
        });
        if (player) {
          const isMuted = player.muted();
          if (isMuted) {
            player.muted(false);
          } else {
            player.muted(true);
          }
          setSpeakerStatus((status) => !status);
        }
      },
    };
    settingHandlerMap[item.id] && settingHandlerMap[item.id]();
  };

  useEffect(() => {
    if (!state.tcic || !state.tcic.classInfo) {
      return;
    }
    let hostInfo = state.tcic.hostInfo();
    let isHost = state.tcic.userId === hostInfo.id;
    const isLiveClass =
      state.tcic.classInfo.class_info?.room_info?.room_type === RoomType.LIVE;
    if (!Props.start) {
      /**
       * 没开始的不展示设置项
       */
      return setSettingList([]);
    }
    if (isHost) {
      setSettingList(
        totalSettings.filter((item) => hosterList.includes(item.id)),
      );
    } else {
      if (!isLiveClass) {
        setSettingList(
          totalSettings.filter(
            (item) => audienceList.includes(item.id) && item.id !== 'speaker',
          ),
        );
      } else {
        setSettingList(
          totalSettings.filter((item) => audienceList.includes(item.id)),
        );
      }
    }

    if (isHost) {
      return;
    }

    debug('连麦中');
    /**
     * 刷新进入页面时的提示
     */
    if (Props.start && callEnable.able) {
      showModal({
        content: '你在连麦中，是否继续',
        onConfirm: () => {
          hideModal();
          setCallEnable((pre) => {
            return { ...pre, ready: true };
          });
        },
        onCancel: () => {
          hideModal();
          downStage();
        },
      });
    }
  }, [Props.start]);

  useEffect(() => {
    debug('onStageMembers .settingList:', settingList);
    {
      if (!state.tcic) {
        return;
      }

      const myInfo = state.tcic.myInfo();
      const hostInfo = state.tcic.hostInfo();
      const invalidIds = [myInfo.id, hostInfo.id];
      console.log(
        '%c [ Interactions.onStageMembers ]-257',
        'font-size:13px; background:pink; color:#bf2c9f;',
        Interactions.onStageMembers,
      );
      const membersOnCalling = Interactions.onStageMembers.filter((item) => {
        return !invalidIds.includes(item.id);
      });
      debug('membersOnCalling:', membersOnCalling);
      setRemoteList(membersOnCalling);

      setTimeout(() => {
        membersOnCalling.forEach((item) => {
          try {
            state.trtcClient?.startRemote({
              view: item.id,
              userId: item.id,
              streamType: 'main' as any,
            });
          } catch (err) {
            /**
             * 切换用户时会出现 dom 时序问题，暂时忽略，不会影响主业务流程
             */
            debug('err:', err);
          }
        });
      }, 100);
    }
    /**
     *  房主不处理后续
     */
    if (!settingList.find((item) => item.id === 'call')) {
      console.log(
        '%c [ host ]-290',
        'font-size:13px; background:pink; color:#bf2c9f;',
      );
      return;
    }

    const checkIfOnStage = () => {
      const myInfo = state.tcic?.myInfo();
      return Interactions.onStageMembers.find((item) => item.id === myInfo.id);
    };
    const onStage = checkIfOnStage();
    /**
     * 没有发布流时，如果发现自己被邀请上台，开启连麦流程
     */
    if (!published) {
      debug(':::', onStage, Props);
      /**
       * 已经开始上课，并且本人在台上，则自动连麦
       */
      if (onStage && Props.start) {
        // 未加入trtc房间， 则先加入
        // if (!Interactions.hasEnterTrtcRoom) {
        //   console.log('not in trtc room, join...');
        //   interactionUpdate({
        //     type: 'update',
        //     state: {
        //       hasEnterTrtcRoom: true,
        //     },
        //   });
        // }
        showModal({
          content: '你被邀请连麦，是否同意',
          onConfirm: () => {
            hideModal();
            setCallEnable({
              able: true,
              ready: true,
            });
            interactionUpdate({
              type: 'update',
              state: {
                callState: CallState.Ready,
              },
            });
          },
          onCancel: () => {
            hideModal();
            downStage();
          },
        });
      }
      if (onStage && !Props.start) {
        setCallEnable((preObj) => {
          return { ...preObj, able: true };
        });
      }
    }

    /**
     * 正在发布中上台人员权限变更，发现自己不在授权列表时，自动下台
     */
    if (published && !onStage) {
      showModal({
        content: '你已经被请下台',
        onConfirm: () => {
          hideModal();
        },
        btn: {
          ok: '好的',
        },
      });
      downStage();
      interactionUpdate({
        type: 'update',
        state: {
          callState: CallState.Unready,
        },
      });
      setCallEnable({ ready: false, able: false });
    }
  }, [
    Interactions.onStageMembers,
    // Interactions.onStageMembers?.length,
    settingList,
    // published,
    // Props.start,
  ]);

  useEffect(() => {
    debug('totalSettings:', settingList);
    /**
     * 仅仅当连麦设置项存在时，才需要处理
     */
    if (!settingList.find((item) => item.id === 'call')) {
      return;
    }
    if (state.trtcClient && Interactions.hasEnterTrtcRoom && !published) {
      debug('callEnable: will set Call Enable', callEnable);
      if (callEnable.able && callEnable.ready) {
        setPublished(true);
        state.trtcClient.localPreview({
          view: `${state.tcic?.myInfo()?.id}`,
          publish: true,
          frameRate: 60,
          portrait: true,
        });
      }
    }
  }, [callEnable, Interactions.hasEnterTrtcRoom]);

  return (
    <>
      <div className="container">
        {remoteList.length > 0 ? (
          <div className="row remoteList">
            {remoteList.map((item) => {
              return (
                <div key={item.id} className="col px-1">
                  <div
                    id={item.id}
                    style={{
                      backgroundColor: 'black',
                      backgroundImage: `url('${item.val?.avatar}')`,
                      color: 'white',
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <></>
        )}
        {(() => {
          if (callEnable.able && callEnable.ready) {
            return (
              <div className="row local-preview">
                <div className="col px-1">
                  <div id={state.tcic?.myInfo()?.id}></div>
                </div>
              </div>
            );
          }
          if (callEnable.ready) {
            return (
              <div className="row call-wating">
                <div className="col px-1">
                  <div className={`${style['waiting']}`}>连麦申请中..</div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className="row">
          {settingList.map((item) => {
            const avOn =
              (item.id === 'audio' && audioStatus) ||
              (item.id === 'video' && videoStatus) ||
              (item.id === 'speaker' && speakerStatus);
            return (
              <div key={item.id} className={`col ${style['icon-wrap']} px-1`}>
                <i
                  className={`${item.val?.icon} ${
                    item.id === 'call'
                      ? callEnable.ready
                        ? style['call-waiting']
                        : ''
                      : ''
                  } `}
                  onClick={() => clickHandler(item)}
                  style={avOn ? { backgroundColor: 'red' } : {}}
                ></i>
              </div>
            );
          })}
        </div>
      </div>
      <SettingList
        visible={settingVisible}
        onHide={settingListHide}
      ></SettingList>
    </>
  );
}
