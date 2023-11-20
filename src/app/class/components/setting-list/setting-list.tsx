"use client";
import { useContext, useEffect, useState } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";

export type Member = TCIC.Common.Item<any>;

export function SettingList(Props: {
  onHide: (evnet: any) => void;
  visible: boolean;
}) {
  let { state } = useContext(BootContext);

  return (
    <MyOffCanvas
      visible={Props.visible}
      classList={`${styles["bg"]}`}
      header={
        <div className={`${styles["header"]}`}>
          <h1 className={`${styles["title"]}`}>设置</h1>
        </div>
      }
      onHide={(evt) => {
        Props.onHide && Props.onHide(evt);
      }}
    >
      <>
        <div className={styles["foot-cover"]}></div>
      </>
    </MyOffCanvas>
  );
}
