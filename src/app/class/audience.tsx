import { useState } from "react";
import styles from "./page.module.css";
import { debugFatory } from "../lib";
let debug = debugFatory("Audience");

export function Audience(Props: {
  children?: any;
  tcic: any;
  client: any;
  token: string;
  start: boolean;
}) {
  let [start, setStart] = useState(false);
  const streamType = ["main"];
  let roomInfo = Props.tcic.classInfo.class_info.room_info;
  let trtcClient = Props.client;
  let videoStart = () => {
    setStart(true);
    /**
     * 互动课
     */
    trtcClient.enterRoom().then(() => {
      streamType.forEach((type) => {
        trtcClient.wantedView({
          view: `${roomInfo.teacher_id}`,
          type,
          userId: roomInfo.teacher_id,
        });
      });
    });
  };
  if (Props.start) {
    if (!start) {
      videoStart();
    }
  }
  //   else {
  //     videPause();
  //   }
  return (
    <div className={styles["stream-wrap"]}>
      <div
        className={styles["stream-view"]}
        id={`${roomInfo.teacher_id}`}
      ></div>
      {Props.children}
      {/* <div className={styles["stream-wrap"]} key={member.user_id}><div></div> */}
    </div>
  );
}
