"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Avatar } from "../../components/video-call/avatar";
import { Board } from "../../components/whiteboard/board";
import { useEffect, useState } from "react";
import Script from "next/script";
import { AppHeader } from "./components/header/header";
// import { AppHeader } from "./components/header/header";

// type
// :
// "main"
// url
// :
// "webrtc://29734.liveplay.myqcloud.com/live/1400313729_326322678_tic_push_user_326322678_168497_main?txSecret=644ab9465ed91dd7f6cfe1a5fc35a1b7&txTime=654B9520"
// user_id
// :
// "tic_push_user_326322678_168497"
type MemberStream = {
  type: string;
  user_id: string;
  url: string;
};

export default function Home() {
  let [members, setMembers] = useState<MemberStream[] | null>(null);
  let [myId, setMyId] = useState<string | null>(null);
  let [isPublished, setIsPublished] = useState<boolean>(false);
  let [trtcClient, setTrtcClient] = useState<any>(null);
  let whenReady = (tcic: any) => {
    console.log("tcic ready", tcic);
    let teachers = tcic.getMemberByRoleType(1);
    setMyId(tcic.userId);
    console.log("teachers", teachers);
    setMembers(teachers);
    if (teachers && teachers.length > 0) {
      let teacher = teachers[0];
      let trtcClient = new TCIC_SPY.createTrtcClient(tcic);
      setTrtcClient(trtcClient);
      trtcClient.enterRoom().then(() => {
        trtcClient.wantedView({
          view: `${teacher.user_id}`,
          userId: teacher.user_id,
        });
        trtcClient.localPreview({
          view: `${tcic.userId}`,
        });
      });
    }
    console.log("tcic:", tcic);
  };
  let publishHandler = () => {
    setIsPublished(true);
    if (trtcClient) {
      trtcClient.localPublish();
    }
  };
  return (
    <>
      <AppHeader whenReady={whenReady}></AppHeader>
      <main className={`flex-shrink-0 ${styles.main}`}>
        <div className="container">
          {/* <div>
            <Avatar></Avatar>
          </div> */}

          <div className="row">
            <div className="col">
              {members ? (
                members.map((member) => (
                  <div
                    key={member.user_id}
                    className={styles["stream-view"]}
                    id={`${member.user_id}`}
                  ></div>
                ))
              ) : (
                <div>请加入课堂</div>
              )}
            </div>

            <div className="col">
              {myId ? (
                <>
                  <div id={myId}></div>
                  {!isPublished && (
                    <button
                      type="button"
                      onClick={publishHandler}
                      className="btn btn-primary"
                    >
                      推流
                    </button>
                  )}
                </>
              ) : (
                <></>
              )}
            </div>

            {/* <div>
            <Board></Board>
          </div> */}
          </div>
        </div>
      </main>
    </>
  );
}
