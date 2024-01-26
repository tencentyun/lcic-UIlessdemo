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
// import * as tcic from 'tric-sdk-v1';

type TCIC_SDK = typeof import('tric-sdk-v1');
// type TCIC_SDK = any;
let debug = debugFatory('Header');
let myLib: any;
let libPromise: any;
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
    // 保证只执行一次.
    if (libPromise || myLib) {
      return;
    }
    if (Props.uid && !ready) {
      /**
       * 基础不支持服务端渲染时，需要使用异步加载保证浏览器环境下才能加载
       */
      libPromise = import('tric-sdk-v1');
      libPromise.then((res: any) => {
        // const res = tcic;
        debug('myLibrary:', res);
        myLib = res;
        initBoot(myLib);
      });
      const domId = 'qc_vconsole';
      try {
        let dom = document.getElementById(domId);
        if (!dom) {
          dom = document.createElement('div');
          dom.setAttribute('id', domId);
          document.body.appendChild(dom);
          dom.style.display = 'none';
        }
        if (/(\?|&)vc=1/.test(location.search)) {
          dom.style.display = 'block';
          (async () => {
            console.log(
              '%c [ vconsole import ]-64',
              'font-size:13px; background:pink; color:#bf2c9f;',
            );
            const VConsole: any = (await import('vconsole')).default;
            console.log(
              '%c [ vconsole done ]-64',
              'font-size:13px; background:pink; color:#bf2c9f;',
              VConsole,
            );
            (window as any).vconsole = new VConsole({
              target: dom,
            });
          })();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [Props.uid, ready]);

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
    debug('init TCIC---->>>>', param);
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
