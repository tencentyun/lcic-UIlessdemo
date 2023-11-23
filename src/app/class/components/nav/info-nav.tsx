import { debugFatory } from "@/app/lib";
import cssModule from "./style.module.css";
import { useEffect, useState } from "react";
let debug = debugFatory("InfoNav");

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
    seconds
  )}`;
  return formattedTime;
}

function padZero(num: number) {
  return num.toString().padStart(2, "0");
}

export function InfoNav(Props: {
  title: string;
  online_number: string;
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
  let [timer, setTime] = useState<any>(null);
  let [duration, setDuration] = useState("00:00:00");
  if (Props.showMark) {
    useEffect(() => {
      if (!timer && Props.showMark?.startTime) {
        setTime(
          setInterval(() => {
            let now = new Date().getTime();
            let startTime = Props.showMark!.startTime;
            // debug("now - startTime:", now, startTime);
            setDuration(formatIncrementalTime(now - startTime));
          }, 1000)
        );
      }
      return () => {
        clearTimeout(timer);
      };
    }, [Props.showMark?.startTime]);
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top">
      <div className="container-fluid">
        <div
          className={`navbar-brand ${cssModule["user-name"]}`}
          onClick={() => {
            Props.clickHandler?.name?.();
          }}
        >
          {Props.title}
          {Props.showMark ? (
            <>
              <div
                className={`${
                  Props.showMark.isBegin
                    ? cssModule["begin"]
                    : cssModule["not-begin"]
                }`}
              >
                <span
                  className={`${cssModule["mark"]} ${
                    Props.showMark.isBegin ? cssModule["green-mark"] : ""
                  }`}
                ></span>
                {Props.showMark.isBegin ? (
                  <>
                    直播中
                    <span className={cssModule["time"]}>{duration}</span>
                  </>
                ) : (
                  "未开始"
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div>
          <span
            className={cssModule["member-counter"]}
            onClick={() => {
              Props.clickHandler?.memberCounter?.();
            }}
          >
            {Props.online_number}人
          </span>
          <button
            className={`btn ${cssModule["quit-btn"]}`}
            onClick={() => {
              Props.clickHandler?.quit?.();
            }}
          ></button>
        </div>
      </div>
    </nav>
  );
}
