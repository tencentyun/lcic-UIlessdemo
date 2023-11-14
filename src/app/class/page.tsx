"use client";
import styles from "./page.module.css";
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

/**
 *
 * @param Props
 *  searchParams从查询参数中获取
 * @returns
 */
export default function Home(Props: {
  params: any;
  searchParams: {
    cid: string;
    token: string;
    uid: string;
  };
}) {
  let [members, setMembers] = useState<MemberStream[] | null>(null);
  let [start, setStart] = useState(false);
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
  let videoStart = () => {
    if (trtcClient) {
      setStart(true);
      if (members && members.length > 0) {
        let teacher = members[0];
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
    }
  };
  let whenReady = (tcic: any) => {
    console.log("tcic ready", tcic);
    let teachers = tcic.getMemberByRoleType(1);
    let trtcClient = new TCIC_SPY.createTrtcClient(tcic);
    setTrtcClient(trtcClient);
    // console.log("teachers", teachers);
    setMembers(teachers);
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
  return (
    <>
      <AppHeader
        whenReady={whenReady}
        cid={Props.searchParams.cid}
        uid={Props.searchParams.uid}
        token={Props.searchParams.token}
      ></AppHeader>
      <main className={`${styles.main} `}>
        <div className="container-lg">
          {/* <div>
            <Avatar></Avatar>
          </div> */}

          <div className="row">
            <div className="col">
              {start && members ? (
                members.map((member) => {
                  return (
                    <div className={styles["stream-wrap"]} key={member.user_id}>
                      {streamType.map((type) => {
                        console.log(`${member.user_id}_${type}`);
                        return (
                          <div
                            key={`${member.user_id}_${type}`}
                            className={styles["stream-view"]}
                            id={`${member.user_id}_${type}`}
                          ></div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className={styles["stream-wrap"]}>
                  {start ? (
                    <div
                      className="spinner-grow text-primary"
                      style={{ width: "3rem", height: "3rem" }}
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <div>
                      <button className="btn btn-primary" onClick={videoStart}>
                        开始
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/**
             * 本地流
             */
            /* <div className="col">
              {myId ? (
                <>
                  <div id={myId}></div>
                  {!isPublished ? (
                    <button
                      type="button"
                      onClick={publishHandler}
                      className="btn btn-primary"
                    >
                      推流
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          togglePublishMedia({
                            multimedia: ["audio"],
                          });
                        }}
                        className="btn btn-primary"
                      >
                        {mediaToggle.audio ? "关闭音频" : "开启音频"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          togglePublishMedia({
                            multimedia: ["video"],
                          })
                        }
                        className="btn btn-primary"
                      >
                        {mediaToggle.video ? "关闭视频" : "开启视频"}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <></>
              )}
            </div> */}

            {/* <div>
            <Board></Board>
          </div> */}
          </div>
        </div>
      </main>
    </>
  );
}
