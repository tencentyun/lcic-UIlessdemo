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
  let info = Props.tcic.hostInfo();
  let [start, setStart] = useState(false);
  const streamType = ["main"];
  let trtcClient = Props.client;
  let videoStart = () => {
    setStart(true);
    /**
     * 互动课
     */
    trtcClient.enterRoom().then(() => {
      streamType.forEach((type) => {
        trtcClient.wantedView({
          view: `${info.userId}`,
          type,
          userId: info.userId,
        });
      });
    });
  };
  debug("info:", info);
  return (
    <div className={styles["stream-wrap"]}>
      <div className={styles["stream-view"]} id={`${info.userId}`}></div>
      {Props.children}
      {/* <div className={styles["stream-wrap"]} key={member.user_id}><div></div> */}
    </div>
  );
}
