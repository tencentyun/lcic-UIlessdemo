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
import { create, createTimClient, createTrtcClient } from '@tcic/watch_sdk';
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
    if (Props.uid && !ready) {
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
    let tcic: any = await initTcic({
      userId: Props.uid,
      classId: parseInt(Props.cid, 10),
      token: Props.token,
    });
    let trtcClient = createTrtcClient(tcic);
    debug('inited');
    state.trtcClient = trtcClient;
    state.tcic = tcic;
    state.tim = createTimClient(state.tcic!);
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
  let initTcic = (param: {
    userId: string;
    token: string;
    classId: number;
  }) => {
    debug('inite TCIC---->>>>', param);
    let tcic = create(param);
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
