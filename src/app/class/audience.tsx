import { useContext, useEffect, useState } from 'react';
import styles from './page.module.css';
import { debugFatory } from '../lib';
import { BootContext } from '../../../contexts/boot.context';
import { InteractionContext } from '../../../contexts/interaction.context';
let debug = debugFatory('Audience');

export function Audience(Props: {
  children?: any;
  tcic: any;
  token: string;
  start: boolean;
}) {
  const streamType = ['main'];
  let { state } = useContext(BootContext);
  let [start, setStart] = useState(false);
  let { dispatch: interactionUpdate } = useContext(InteractionContext);
  let trtcClient = state.trtcClient;
  let roomInfo = Props.tcic?.classInfo.class_info.room_info || {};
  debug('auidence roomInfo:', roomInfo);
  let videoStart = () => {
    /**
     * 互动课
     */
    trtcClient?.enterRoom().then(() => {
      interactionUpdate({
        type: 'update',
        state: {
          hasEnterTrtcRoom: true,
        },
      });
      streamType.forEach((streamType: any) => {
        trtcClient?.startRemote({
          view: `${roomInfo.teacher_id}`,
          streamType,
          userId: roomInfo.teacher_id,
          tcic: state.tcic,
        });
      });
    });
  };

  useEffect(() => {
    if (!start) {
      if (Props.start) {
        setStart(true);
        videoStart();
      }
    }
  }, [Props.start]);
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
