"use client";
import { useContext, useEffect, useState } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";

export type Member = TCIC.Common.Item<any>;

let memberList = [{}];

export function MemberList(Props: {
  onHide: (evnet: any) => void;
  visible: boolean;
}) {
  let { state } = useContext(BootContext);
  let memberItem = function (data: Member) {
    return (
      <div className={`${styles["member"]}`} key={data.id}>
        {data.text}
      </div>
    );
  };

  return (
    <MyOffCanvas
      visible={Props.visible}
      classList={`${styles["bg"]}`}
      header={
        <div className={`${styles["header"]}`}>
          <h1 className={`${styles["title"]}`}>观众列表</h1>
          <div>
            {state.tcic
              ? `在线观众(${state.tcic.memberInfo.online_number})`
              : ""}
          </div>
        </div>
      }
      onHide={(evt) => {
        Props.onHide && Props.onHide(evt);
      }}
    >
      <>
        {state.tcic ? (
          state.tcic.memberInfo.members.map(
            (item: { user_id: string; user_name: string }) =>
              memberItem({
                id: item.user_id,
                text: item.user_name,
                val: item,
              })
          )
        ) : (
          <></>
        )}
        <div className={styles["foot-cover"]}></div>
      </>
    </MyOffCanvas>
  );
}
