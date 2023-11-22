import { useEffect, useState } from "react";
import { debugFatory } from "../lib";
import styles from "./page.module.css";
let debug = debugFatory("Hoster");

export type MemberStream = {
  type: string;
  user_id: string;
  url: string;
};

export function Hoster(Props: {
  children?: any;
  tcic: any;
  client: any;
  token: string;
  start: boolean;
}) {
  // debug("tcic", Props.tcic);
  let info = Props.tcic.myInfo();
  let [isPublished, setPublished] = useState(false);
  useEffect(() => {
    debug("Props.client;", Props.client);
    if (Props.client) {
      Props.client.localPreview({
        view: `${info.userId}`,
      });
    }
  }, [Props.client]);
  let videoPublish = async () => {
    setPublished(true);
    if (isPublished) {
      Props.client.resumePublish({
        target: {
          video: true,
          audio: true,
        },
      });
      return;
    }
    let needStartClass = false;
    // debug("Props.tcic:", Props.tcic);
    if (Props.tcic.classInfo.class_info.room_info.real_start_time === 0) {
      needStartClass = true;
    }
    if (needStartClass) {
      await Props.tcic.startClass(
        Props.tcic.classInfo.class_info.class_id,
        Props.token
      );
    }
    Props.client.enterRoom().then(() => {
      Props.client.localPublish();
    });
  };
  let videPause = () => {
    debug("Props.client:", Props.client);
    // Props.client.pausePublish({
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
  debug("tcic info", info);
  return (
    <div className={styles["stream-wrap"]}>
      <div className={styles["stream-view"]} id={`${info.userId}`}></div>
      {Props.children}
    </div>
  );
}
