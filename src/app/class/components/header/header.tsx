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
let debug = debugFatory('Header');

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
    let global = window as any;
    debug('header mounted', Props.uid, ready, global.TCIC_SPY);
    if (Props.uid && !ready && global.TCIC_SPY) {
      initBoot('effected ');
    }
    return () => {
      setReady(false);
      // // state.tcic.destroy();
      // state.tcic = null;
      // dispatch({
      //   type: 'merge',
      //   arg: {
      //     ...state,
      //   },
      // });
      debug('header unmounted');
    };
  }, [Props.uid]);
  let initBoot = async (reson: string) => {
    debug('reson:', reson, Props);
    setReady(true);
    let global = window as any;
    state.sdk = global.TCIC_SPY;
    let tcic: any = await initTcic({
      sdk: state.sdk,
      userId: Props.uid,
      classId: parseInt(Props.cid, 10),
      token: Props.token,
    });
    let trtcClient = new state.sdk.createTrtcClient(tcic);
    debug('inited');
    state.trtcClient = trtcClient;
    state.tcic = tcic;
    state.tim = state.sdk.createTimClient(state.tcic);
    /**
     * dispatch的时序非常重要
     * 保证SDK 初始化完后才更新，否则容易出现数据无法获取的情况
     */
    dispatch({
      type: 'merge',
      arg: state,
    });

    Props.whenReady && Props.whenReady(tcic, state.sdk);
  };
  /**
   *
   */
  let tcicScriptLoaded = async () => {
    if (!ready) {
      initBoot('scriptLoaded');
    }
  };

  /**
   * 如果初始化失败，就挂起阻塞后续逻辑执行,不抛出reject
   * @param param
   * @returns
   */
  let initTcic = (param: {
    sdk: any;
    userId: string;
    token: string;
    classId: number;
  }) => {
    debug('inite TCIC---->>>>', param);
    let tcic = param.sdk.create(param);
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

  return (
    <header>
      <Script
        src={process.env.NEXT_PUBLIC_SDK_URL}
        onLoad={tcicScriptLoaded}
      ></Script>
      {Props.children}
    </header>
  );
}
