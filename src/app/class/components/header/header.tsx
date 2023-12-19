'use client';
/**
 * 全局对象注册
 */
import Script from 'next/script';
import cssModule from './style.module.css';
import { useContext, useEffect, useState } from 'react';
import { Loading } from '../loading/loading';
import { BootContext } from '../../../../../contexts/boot.context';
import { debugFatory } from '@/app/lib';
// import * as tcic from '@tencent/tcic-watch-sdk';
type TCIC_SDK = typeof import('@tencent/tcic-watch-sdk');
// type TCIC_SDK = any;
let debug = debugFatory('Header');
let myLib: any;

/**
 *
 * @param Props uid 用户ID
 * cid 课堂ID
 * @returns
 */
export function AppHeader(Props: {
  whenReady?: any;
  whenError?: any;
  uid: string;
  token: string;
  cid: string;
  children?: any;
}) {
  let { state, dispatch } = useContext(BootContext);
  let [ready, setReady] = useState(false);

  useEffect(() => {
    if (!myLib && Props.uid && !ready) {
      /**
       * 基础不支持服务端渲染时，需要使用异步加载保证浏览器环境下才能加载
       */
      let libPromise = import('@tencent/tcic-watch-sdk');
      libPromise.then((res) => {
        // const res = tcic;
        debug('myLibrary:', res);
        myLib = res;
        initBoot(myLib);
      });
    }
  }, [Props.uid]);

  let initBoot = async (sdk: TCIC_SDK) => {
    // debug('reson:', sdk, Props);
    setReady(true);
    let tcic: any = await initTcic(sdk, {
      userId: Props.uid,
      classId: parseInt(Props.cid, 10),
      token: Props.token,
    });
    let trtcClient = sdk.createTrtcClient(tcic);
    debug('inited');
    state.trtcClient = trtcClient;
    state.tcic = tcic;
    state.tim = sdk.createTimClient(state.tcic!);
    /**
     * dispatch的时序非常重要
     * 保证SDK 初始化完后才更新，否则容易出现数据无法获取的情况
     */
    dispatch({
      type: 'merge',
      arg: state,
    });

    Props.whenReady && Props.whenReady(tcic);
  };

  /**
   * 如果初始化失败，就挂起阻塞后续逻辑执行,不抛出reject
   * @param param
   * @returns
   */
  let initTcic = (
    sdk: TCIC_SDK,
    param: {
      userId: string;
      token: string;
      classId: number;
    },
  ) => {
    debug('inite TCIC---->>>>', param);
    let tcic = sdk.create(param);
    return new Promise((resolve, reject) => {
      tcic
        .init({
          ready: () => {
            resolve(tcic);
          },
        })
        .catch((err: any) => {
          debug(err);
          Props.whenError && Props.whenError(err);
        });
    });
  };

  return <header>{Props.children}</header>;
}
