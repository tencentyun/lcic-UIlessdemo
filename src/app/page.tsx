"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Script from "next/script";
import { AppHeader } from "./class/components/header/header";
import { Demo } from "./demo";

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
  let [classId, setClassId] = useState("");
  let [members, setMembers] = useState<MemberStream[] | null>(null);
  let [myId, setMyId] = useState<string | null>(null);
  let [enterRoomClass, setEnterRoomClass] = useState<string | null>(null);
  let [isPublished, setIsPublished] = useState<boolean>(false);
  let [trtcClient, setTrtcClient] = useState<any>(null);
  let [mediaToggle, setMediaToggle] = useState({
    video: true,
    audio: true,
  });

  /**
   *  获取流类型
   * main为主流 ， auxiliary为辅流,电商场景，没有辅流
   */
  const streamType = ["main"];
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
        streamType.forEach((type) => {
          trtcClient.wantedView({
            view: `${teacher.user_id}_${type}`,
            type,
            userId: teacher.user_id,
          });
        });

        /**
         * 本地预览
         */
        // trtcClient.localPreview({
        //   view: `${tcic.userId}`,
        // });
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
  let togglePublishMedia = (opts: { multimedia: ("video" | "audio")[] }) => {
    if (trtcClient) {
      if (opts.multimedia.includes("video")) {
        if (mediaToggle.video) {
          trtcClient.pausePublish({
            target: opts.multimedia,
          });
          setMediaToggle({
            ...mediaToggle,
            video: false,
          });
        } else {
          trtcClient.resumePublish({
            target: opts.multimedia,
          });
          setMediaToggle({
            ...mediaToggle,
            video: true,
          });
        }
      }
      if (opts.multimedia.includes("audio")) {
        if (mediaToggle.audio) {
          trtcClient.pausePublish({
            target: opts.multimedia,
          });
          setMediaToggle({
            ...mediaToggle,
            audio: false,
          });
        } else {
          trtcClient.resumePublish({
            target: opts.multimedia,
          });
          setMediaToggle({
            ...mediaToggle,
            audio: true,
          });
        }
      }
    }
  };
  let changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^\d+$/.test(e.target.value)) {
      setClassId("");
      return;
    }
    setClassId(e.target.value);
  };

  let enterRoomHandler = async () => {
    let demoInfo = new Demo();
    let userInfo = await demoInfo.developInit(classId);
    console.log("enter room", userInfo);
    window.location.href = `${window.location.href}/class?cid=${classId}&uid=${userInfo.UserId}&token=${userInfo.Token}`;
  };
  return (
    <>
      {/* <AppHeader whenReady={whenReady}></AppHeader> */}
      <main className={`${styles.main} `}>
        <div className="container-lg">
          <div className="row">
            <div className="col">
              <h1 className={`${styles["demo-title"]}`}>LCIC-demo</h1>
              <div className={`${styles["inputWrap"]}`}>
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="输入课堂号"
                  aria-label="Search"
                  value={classId}
                  onChange={changeHandler}
                />
                <button
                  className={`btn btn-lg btn-primary ${styles["login-btn"]}`}
                  onClick={enterRoomHandler}
                >
                  进入
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
