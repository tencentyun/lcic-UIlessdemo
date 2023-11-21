"use client";
/**
 * 全局对象注册
 */
import Script from "next/script";
import cssModule from "./style.module.css";
import { useContext, useEffect, useState } from "react";
import { Loading } from "../loading/loading";
import { BootContext } from "../../../../../contexts/boot.context";
import { debugFatory } from "@/app/lib";
let debug = debugFatory("Header");
// type
// :
// "main"
// url
// :
// "webrtc://29734.liveplay.myqcloud.com/live/1400313729_326322678_tic_push_user_326322678_168497_main?txSecret=644ab9465ed91dd7f6cfe1a5fc35a1b7&txTime=654B9520"
// user_id
// :
// "tic_push_user_326322678_168497"

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
  children?: any;
}) {
  let { state, dispatch } = useContext(BootContext);
  let tcicScriptLoaded = async () => {
    let global = window as any;
    state.sdk = global.TCIC_SPY;
    debug("debug loaed!");
    let tcic: any = await initTcic({
      sdk: state.sdk,
      userId: Props.uid,
      classId: parseInt(Props.cid, 10),
      token: Props.token,
    });
    state.tcic = tcic;
    state.tim = state.sdk.createTimClient(state.tcic);
    dispatch({
      type: "merge",
      arg: state,
    });
    Props.whenReady && Props.whenReady(tcic);
  };

  let initTcic = (param: {
    sdk: any;
    userId: string;
    token: string;
    classId: number;
  }) => {
    let tcic = param.sdk.create(param);
    return new Promise((resolve) => {
      tcic.init({
        ready: () => {
          resolve(tcic);
        },
      });
    });
  };

  return (
    <header>
      <Script
        src="http://localhost:9010/watch_sdk/dist/tcic_watch_sdk.1.0.0.js"
        onLoad={tcicScriptLoaded}
      ></Script>
      {Props.children}
    </header>
  );
}
