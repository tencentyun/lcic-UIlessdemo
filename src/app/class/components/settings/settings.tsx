import { useContext, useEffect, useState } from 'react';
import style from './style.module.css';
import { BootContext } from '../../../../../contexts/boot.context';
import { SettingList } from '../setting-list/setting-list';
import { useVisible } from '../../../../../hooks/visible';
import { RoleName, TMemberActionType, debugFatory } from '@/app/lib';
import { ModalContext } from '../../../../../contexts/modal.context';
import { InteractionContext } from '../../../../../contexts/interaction.context';
let debug = debugFatory('Settings');
type SettingItem = TCIC.Common.Item<{
  icon: string;
}>;
type RemoteItem = TCIC.Common.Item<any>;
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

  const [audioStatus, setAudioStatus] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<boolean>(false);

  /**
   * 主动下台
   */
  let downStage = () => {
    state.tcic?.memberAction({
      classId: `${state.tcic.classId}`,
      userId: state.tcic?.myInfo().id,
      actionType: TMemberActionType.Stage_Down,
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
  let upStage = () => {
    setCallEnable((pre) => {
      return { ...pre, ready: true };
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
              },
            });
          }
        }
      },
      video: () => {
        if (!state.trtcClient) {
          return;
        }
        if (videoStatus) {
          state.trtcClient.mute({ target: ['video'] });
        } else {
          state.trtcClient.unmute({ target: ['video'] });
        }
      },
      audio: () => {
        if (!state.trtcClient) {
          return;
        }
        if (audioStatus) {
          state.trtcClient.mute({ target: ['audio'] });
        } else {
          state.trtcClient.unmute({ target: ['audio'] });
        }
      },
    };
    settingHandlerMap[item.id] && settingHandlerMap[item.id]();
  };

  let totalSettings: SettingItem[] = [
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
    {
      id: 'awesome',
      text: '点赞',
      val: {
        icon: `${style['s-awesome-icon']}`,
      },
    },
  ];
  let hosterList = ['setting', 'share', 'video', 'audio'];
  let audienceList = ['share', 'gift', 'call', 'awesome', 'video', 'audio'];

  useEffect(() => {
    if (!state.tcic) {
      return;
    }
    let hostInfo = state.tcic.hostInfo();
    let isHost = state.tcic.userId === hostInfo.id;
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
      setSettingList(
        totalSettings.filter((item) => audienceList.includes(item.id)),
      );
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
    /**
     * 仅仅当连麦设置项存在时，才需要处理
     */
    if (!settingList.find((item) => item.id === 'call')) {
      if (!state.tcic) {
        return;
      }
      /**
       * 这里是房主逻辑
       */
      let myInfo = state.tcic.myInfo();
      let hostInfo = state.tcic.hostInfo();
      let invalidIds = [myInfo.id, hostInfo.id];
      let membersOnCalling = Interactions.onStageMembers.filter((item) => {
        return !invalidIds.includes(item.id);
      });
      debug('willSHow this', membersOnCalling);
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

      return;
    }

    let checkIfOnStage = () => {
      let myInfo = state.tcic?.myInfo();
      return Interactions.onStageMembers.find((item) => item.id === myInfo.id);
    };
    let onStage = checkIfOnStage();
    /**
     * 没有发布流时，如果发现自己被邀请上台，开启连麦流程
     */
    if (state.tcic && !published) {
      debug(':::', onStage, Props);
      /**
       * 已经开始上课，并且本人在台上，则自动连麦
       */
      if (onStage && Props.start) {
        showModal({
          content: '你被邀请连麦，是否同意',
          onConfirm: () => {
            hideModal();
            setCallEnable({
              able: true,
              ready: true,
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
      setCallEnable({ ready: false, able: false });
    }
  }, [Interactions.onStageMembers, settingList]);

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
        });
        // .then(() => {
        //   state.trtcClient?.localPublish();
        // });
      }
    }
  }, [callEnable, Interactions.hasEnterTrtcRoom]);

  return (
    <>
      <div className="container">
        {remoteList.length > 0 ? (
          <div className="row">
            {remoteList.map((item) => {
              return (
                <div key={item.id} className="col px-1">
                  <div id={item.id}></div>
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
              <div className="row">
                <div className="col px-1">
                  <div id={state.tcic?.myInfo()?.id}></div>
                </div>
              </div>
            );
          }
          if (callEnable.ready) {
            return (
              <div className="row">
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
            return (
              <div key={item.id} className={`col ${style['icon-wrap']} px-1`}>
                <i
                  className={`${item.val?.icon} ${
                    item.id === 'call'
                      ? callEnable.ready
                        ? style['call-waiting']
                        : ''
                      : undefined
                  } ${item.id === 'audio' && audioStatus ? 'av-on' : null} ${
                    item.id === 'video' && videoStatus ? 'av-on' : null
                  }`}
                  onClick={() => clickHandler(item)}
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
