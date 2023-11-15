"use client";
import { useContext, useEffect, useState } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";

export type Member = TCIC.Common.Item<{
  userId: string;
  userName: string;
}>;

export function MemberList(Props: {
  onHide: (evnet: any) => void;
  visible: boolean;
}) {
  let [direction, setDirection] = useState<"start" | "bottom">("start");
  let { state } = useContext(BootContext);
  let memberItem = function (data: Member) {
    return <div>{data.text}</div>;
  };

  useEffect(() => {
    console.log("state: MemberList", state);
    /**
     * 响应式交互优化，小屏幕从下方出，大屏幕从左边出
     * 浏览器相关行为要在effect里实现，避免服务端渲染报错b
     */
    if (window && window.innerWidth < 800) {
      setDirection("bottom");
    }
  }, [state]);
  return (
    <MyOffCanvas
      visible={Props.visible}
      classList={`${styles["bg"]}`}
      direction={direction}
      header={
        <div className={`${styles["header"]}`}>
          <h1 className={`${styles["title"]}`}>观众列表</h1>
          <div>在线观众({1})</div>
        </div>
      }
      onHide={(evt) => {
        Props.onHide && Props.onHide(evt);
      }}
    >
      {/* {Props.members.map((item) => memberItem(item))} */}
    </MyOffCanvas>
  );
}
