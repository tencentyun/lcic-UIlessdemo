import { useContext, useEffect, useState } from 'react';
import style from './style.module.css';
import { BootContext } from '../../../../../contexts/boot.context';
import { SettingList } from '../setting-list/setting-list';
import { useVisible } from '../../../../../hooks/visible';
import { RoleName, TMemberActionType, debugFatory } from '@/app/lib';
import { ModalContext } from '../../../../../contexts/modal.context';
let debug = debugFatory('Settings');
type SettingItem = TCIC.Common.Item<{
  icon: string;
}>;
/**
 *
 * @param Props
 * @returns
 */
export function Settings(Props: {
  role: RoleName | null;
  trtcClient: any;
  tcic: any;
  start: boolean; // 是否开始
  callEnable: boolean; //是否允许连麦
}) {
  let { state } = useContext(BootContext);
  let [settingVisible, settingListShow, settingListHide] = useVisible();
  let [shareVisible, shareShow, shareHide] = useVisible();
  let [settingList, setSettingList] = useState<SettingItem[]>([]);
  let { showModal, hideModal, showCounterDown } = useContext(ModalContext);
  let [joinCall, setJoingCall] = useState(false);

  let clickHandler = (item: SettingItem) => {
    let settingHandlerMap: any = {
      call: () => {
        if (!joinCall) {
          if (Props.trtcClient) {
            showModal({
              content: '申请连麦',
              onConfirm: () => {
                debug('Props.trtcClient:', Props.tcic, Props.trtcClient);
                // Props.trtcClient.startLocalPreview()
                hideModal();
                setJoingCall(true);
                Props.tcic.memberAction({
                  classId: Props.tcic.classId,
                  userId: state.myInfo?.userId,
                  actionType: TMemberActionType.Hand_Up,
                });
              },
            });
          }
        } else {
          if (Props.trtcClient) {
            showModal({
              content: '取消连麦',
              onConfirm: () => {
                debug('Props.trtcClient:', Props.tcic, Props.trtcClient);
                // Props.trtcClient.startLocalPreview()
                hideModal();
                setJoingCall(false);
                Props.tcic.memberAction({
                  classId: Props.tcic.classId,
                  userId: state.myInfo?.userId,
                  actionType: TMemberActionType.Hand_Up_Cancel,
                });
                Props.trtcClient.unPublish();
              },
            });
          }
        }
      },
    };
    settingHandlerMap[item.id] && settingHandlerMap[item.id]();
  };

  let totalSettings: SettingItem[] = [
    {
      id: 'share',
      text: '分享',
      val: {
        icon: `${style['s-share-icon']}`,
      },
    },
    {
      id: 'setting',
      text: '设置',
      val: {
        icon: `${style['s-setting-icon']}`,
      },
    },
    {
      id: 'call',
      text: '连麦',
      val: {
        icon: `${style['s-call-icon']}`,
      },
    },

    {
      id: 'gift',
      text: '赠送礼物',
      val: {
        icon: `${style['s-gift-icon']}`,
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
  let hosterList = ['setting', 'share'];
  let audienceList = ['share', 'gift', 'call', 'awesome'];
  useEffect(() => {
    if (Props.trtcClient) {
      debug('Props.trtcClient mounted:', Props.trtcClient);
    }
  }, []);

  useEffect(() => {
    if (!Props.start) {
      /**
       * 没开始的不展示设置项
       */
      return setSettingList([]);
    }
    if (Props.role === RoleName.HOSTER) {
      setSettingList(
        totalSettings.filter((item) => hosterList.includes(item.id)),
      );
    } else {
      setSettingList(
        totalSettings.filter((item) => audienceList.includes(item.id)),
      );
    }
  }, [Props.role, Props.start]);

  useEffect(() => {
    /**
     * 房主不需要处理
     */
    if (Props.role === RoleName.HOSTER) {
      return;
    }
    if (!Props.start) {
      return;
    }
    debug('user Props', Props);
    /**
     * 表示此时用户在麦上
     */
    if (Props.callEnable) {
      setJoingCall(true);
      /**
       * 进入房间后，如果允许连麦，且已经申请连麦
       * 则自动推流
       */
      Props.trtcClient
        .localPreview({
          view: `${state.myInfo?.userId}`,
          // options: {
          //   objectFit: "",
          // },
        })
        .then(() => {
          Props.trtcClient.localPublish();
        });
    } else {
      /**
       * 表示用户在麦下,或者被踢下麦
       */
      setJoingCall(false);

      Props.trtcClient.unPublish().catch((e: any) => {
        /**
         * 取消发布的错误不影响运行
         */
        debug('unPublish error:', e);
      });
    }
  }, [Props.callEnable, Props.start]);

  return (
    <>
      <div className={`container`}>
        {Props.callEnable ? (
          joinCall ? (
            <div className="row">
              <div className="col px-1">
                <div id={state.myInfo?.userId}></div>
              </div>
            </div>
          ) : (
            <></>
          )
        ) : joinCall ? (
          <div className="row">
            <div className="col px-1">
              <div className={`${style['waiting']}`}>连麦申请中..</div>
            </div>
          </div>
        ) : (
          <></>
        )}

        <div className="row">
          {settingList.map((item) => {
            return (
              <div key={item.id} className={`col ${style['icon-wrap']} px-1`}>
                <i
                  className={`${item.val?.icon} ${
                    item.id === 'call'
                      ? joinCall
                        ? style['call-waiting']
                        : ''
                      : undefined
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
