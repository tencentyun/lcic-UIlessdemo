import { useContext, useEffect, useState } from 'react';
import { debugFatory } from '../lib';
import styles from './page.module.css';
import { BootContext } from '../../../contexts/boot.context';
import { InteractionContext } from '../../../contexts/interaction.context';
let debug = debugFatory('Hoster');

export type MemberStream = {
  type: string;
  user_id: string;
  url: string;
};

export function Hoster(Props: {
  children?: any;
  token: string;
  start: boolean;
}) {
  // debug("tcic", Props.tcic);

  let [isPublished, setPublished] = useState(false);
  let { state } = useContext(BootContext);
  let { dispatch: interactionUpdate } = useContext(InteractionContext);
  useEffect(() => {
    if (state.tcic) {
      let info = state.tcic?.myInfo()!;
      if (state.trtcClient) {
        state.trtcClient.localPreview({
          view: `${info.id}`,
          publish: true,
          frameRate: 60,
          portrait: true,
          // options: {
          //   objectFit: "",
          // },
        });
      }
    }
  }, [state.trtcClient]);
  let videoPublish = async () => {
    setPublished(true);
    if (isPublished) {
      state.trtcClient?.resumePublish({
        target: ['video', 'audio'],
      });
      return;
    }
    /**
     * 判断是否已经开始上课
     */
    let needStartClass = false;
    if (state.tcic?.classInfo?.class_info.room_info.real_start_time === 0) {
      needStartClass = true;
    }
    if (needStartClass) {
      await state.tcic?.start();
    }
    state.trtcClient?.enterRoom().then(() => {
      interactionUpdate({
        type: 'update',
        state: {
          hasEnterTrtcRoom: true,
        },
      });
      // state.trtcClient?.localPublish();
    });
  };
  let videPause = () => {
    debug('state.trtcClient:', state.trtcClient);
    // state.trtcClient.pausePublish({
    //   target: {
    //     video: true,
    //     audio: true,
    //   },
    // });
  };
  if (Props.start) {
    if (!isPublished) {
      videoPublish();
    }
  } else {
    videPause();
  }

  /**
   * 暂停推流
   * 音视频
   */
  /**
   *     video: true,
    audio: true,
   */
  // trtcClient.pausePublish({
  //   target: opts.multimedia,
  // });
  /**
   * 恢复推流
   *     trtcClient.resumePublish({
            target: opts.multimedia,
          });
   *
   */
  // debug('tcic info', info);
  return (
    <div className={styles['stream-wrap']}>
      <div
        className={styles['stream-view']}
        id={`${state.tcic?.myInfo().id}`}
      ></div>
      {Props.children}
    </div>
  );
}
