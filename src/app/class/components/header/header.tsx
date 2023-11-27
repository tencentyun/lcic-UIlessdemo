'use client';
/**
 * 全局对象注册
 */
import Script from 'next/script';
import cssModule from './style.module.css';
import { cache, useContext, useEffect, useState } from 'react';
import { Loading } from '../loading/loading';
import { BootContext } from '../../../../../contexts/boot.context';
import { RoleName, debugFatory } from '@/app/lib';
let debug = debugFatory('Header');
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
  whenError: any;
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
      state.tcic = null;
      state.hostInfo = null;
      state.myInfo = null;
      dispatch({
        type: 'merge',
        arg: {
          ...state,
        },
      });
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
    debug('inited');
    state.tcic = tcic;
    state.tim = state.sdk.createTimClient(state.tcic);
    let roomInfo = tcic.classInfo.class_info.room_info;
    let hostIsTeacher = tcic.userId === roomInfo.teacher_id;
    let requestIds = hostIsTeacher
      ? [tcic.userId]
      : [tcic.userId, roomInfo.teacher_id];

    tcic.getUserInfoByIds(requestIds).then((users: any) => {
      /**
         * {
    "error_code": 0,
    "error_msg": "成功",
    "request_id": "93266ab96bcbf5934b550197540b1c26",
    "users": [
        {
            "user_id": "2YZPKmn5PNVoqrB5rekE2Je8yji",
            "school_id": 3923193,
            "nickname": "Audience_826",
            "avatar": "",
            "user_origin_id": ""
        },
        {
            "user_id": "2Srao3bzGyRLWIVX6Wg6HhBv1Ao",
            "school_id": 3923193,
            "nickname": "teacher8316",
            "avatar": "",
            "user_origin_id": ""
        }
    ]
}
         */
      debug('users', users);
      let [myinfo, hostInfo] = users;
      if (hostIsTeacher) {
        let myInfoResult: any = {
          userId: myinfo.user_id,
          roleName: 'teacher',
          classId: tcic.classId,
          detail: {
            role: RoleName.HOSTER,
            ...myinfo,
          },
        };
        state.myInfo = myInfoResult;
        state.hostInfo = myInfoResult;
      } else {
        state.myInfo = {
          userId: myinfo.user_id,
          roleName: 'student',
          classId: tcic.classId,
          detail: {
            role: RoleName.AUDIENCE,
            ...myinfo,
          },
        };
        state.hostInfo = {
          userId: hostInfo.user_id,
          roleName: 'teacher',
          classId: tcic.classId,
          detail: {
            role: RoleName.AUDIENCE,
            ...hostInfo,
          },
        };
      }
      /**
       * 注意这里时序，保证state更新时，所有信息都已经更新
       * todo: 时序可以再优化，这里阻塞时间比较长
       */
      dispatch({
        type: 'merge',
        arg: state,
      });

      debug('AppHeader tcic: merged', tcic);

      Props.whenReady && Props.whenReady(tcic);
    });
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
          // reject(err);
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
