"use client";
import Script from "next/script";
import cssModule from "./style.module.css";
import { useContext, useEffect, useState } from "react";
import { Loading } from "../loading/loading";
import { BootContext } from "../../../../../contexts/boot.context";

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

type MyInfo = {
  userId: string;
  classId: string;
  roleName: "student" | "teacher";
  detail: {
    user_name: string;
  };
};
/**
 *
 * @param Props uid 用户ID
 * cid 课堂ID
 * @returns
 */
export function AppHeader(Props: {
  whenReady: any;
  uid: string;
  token: string;
  cid: string;
  clickHandler?: {
    quit?: () => void;
    memberCounter?: () => void;
  };
}) {
  let { dispatch } = useContext(BootContext);
  let [tcicInfo, setTcicInfo] = useState<any>(null);
  let [loginUser, setLoginUser] = useState<any>(null);
  let tcicScriptLoaded = async () => {
    let global = window as any;
    console.log("useEffect TCIC", global.TCIC_SPY);
    let tcic: any = await initTcic({
      userId: Props.uid,
      classId: parseInt(Props.cid, 10),
      token: Props.token,
    });
    dispatch({
      type: "setTcic",
      arg: tcic,
    });

    setLoginUser(tcic.myInfo());
    console.log("tcic:", tcic);
    setTcicInfo(tcic);
    Props.whenReady && Props.whenReady(tcic);
  };

  let initTcic = (param: {
    userId: string;
    token: string;
    classId: number;
  }) => {
    let tcic = TCIC_SPY.create(param);
    return new Promise((resolve) => {
      tcic.init({
        ready: () => {
          console.log("myInfo:", tcic.myInfo());
          resolve(tcic);
        },
      });
    });
  };

  let quitHandler = () => {};

  return (
    <header>
      <Script
        src="http://localhost:9010/watch_sdk/dist/tcic_watch_sdk.1.0.0.js"
        onLoad={tcicScriptLoaded}
      ></Script>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top">
        <div className="container-fluid">
          {loginUser ? (
            <>
              <a className={`navbar-brand ${cssModule["user-name"]}`} href="#">
                {loginUser.detail.user_name}
              </a>
              <div>
                <span
                  className={cssModule["member-counter"]}
                  onClick={() => {
                    Props.clickHandler?.memberCounter?.();
                  }}
                >
                  {tcicInfo.memberInfo.online_number}人
                </span>
                <button
                  className={`btn ${cssModule["quit-btn"]}`}
                  onClick={() => {
                    Props.clickHandler?.quit?.();
                  }}
                ></button>
              </div>
            </>
          ) : (
            <>
              <Loading size={"small"}></Loading>
            </>
          )}
          {/* <button
            className="navbar-toggler collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              {loginUser ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">
                      消息
                    </a>
                  </li>
                </>
              ) : (
                <></>
              )}
            </ul>
            {loginUser ? (
              <div className={`d-flex ${cssModule["class-id"]}`}>
                {`classID:${loginUser.classId} userId:${loginUser.userId}`}
              </div>
            ) : logining ? (
              <div className={`d-flex ${cssModule["class-id"]}`}>登陆中..</div>
            ) : (
              <></>
            )}
          </div> */}
        </div>
      </nav>
    </header>
  );
}
