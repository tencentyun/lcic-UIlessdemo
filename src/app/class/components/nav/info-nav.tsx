import { debugFatory } from '@/app/lib';
import cssModule from './style.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { RoomContext } from '../../../../../contexts/room.context';
import { InteractionContext } from '../../../../../contexts/interaction.context';
let debug = debugFatory('InfoNav');

/**
 *
 * 按类似“00:23:32”的格式显示增量时间
 * 传入参数为ms
 */
function formatIncrementalTime(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
    seconds,
  )}`;
  return formattedTime;
}

function padZero(num: number) {
  return num.toString().padStart(2, '0');
}

export function InfoNav(Props: {
  showRed: boolean;
  clickHandler?: {
    quit?: () => void;
    name?: () => void;
    memberCounter?: () => void;
  };
  showMark?: {
    isBegin: boolean;
    startTime: number;
  };
}) {
  let timerRef = useRef<any>(null);
  let [duration, setDuration] = useState('00:00:00');
  let [showRed, setShowRed] = useState(false);
  let { state: RoomState } = useContext(RoomContext);
  let { state: InterationState } = useContext(InteractionContext);
  useEffect(() => {
    if (!timerRef.current && Props.showMark?.startTime) {
      timerRef.current = setInterval(() => {
        let now = new Date().getTime();
        let startTime = RoomState.startTime;
        // debug("now - startTime:", now, startTime);
        setDuration(formatIncrementalTime(now - startTime));
      }, 1000);
    }
    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [Props]);

  useEffect(() => {
    debug('Props>showred', Props);
    if (Props.showRed) {
      setShowRed(true);
    }
  }, [Props.showRed]);

  let hideRed = () => {
    setShowRed(false);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top">
      <div className="container-fluid">
        <div
          className={`navbar-brand ${cssModule['user-name']}`}
          onClick={() => {
            Props.clickHandler?.name?.();
          }}
        >
          {RoomState.className}
          {Props.showMark ? (
            <>
              <div
                className={`${
                  Props.showMark.isBegin
                    ? cssModule['begin']
                    : cssModule['not-begin']
                }`}
              >
                <span
                  className={`${cssModule['mark']} ${
                    Props.showMark.isBegin ? cssModule['green-mark'] : ''
                  }`}
                ></span>
                {Props.showMark.isBegin ? (
                  <>
                    直播中
                    <span className={cssModule['time']}>{duration}</span>
                  </>
                ) : (
                  '未开始'
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className={`${cssModule['right-wrap']}`}>
          <span
            className={cssModule['member-counter']}
            onClick={() => {
              Props.clickHandler?.memberCounter?.();
              hideRed();
            }}
          >
            {InterationState.onlineAuienceNum}人
          </span>
          {showRed ? <span className={`${cssModule['red']}`}></span> : <></>}

          <button
            className={`btn ${cssModule['quit-btn']}`}
            onClick={() => {
              Props.clickHandler?.quit?.();
            }}
          ></button>
        </div>
      </div>
    </nav>
  );
}
