import { useContext, useEffect } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";
import { Loading } from "../loading/loading";

/**
 * 给数字串补充空格，每三位一个空格
 * @param num
 */
function addPadding(num: number) {
  let numStr = num.toString();
  let result = "";
  for (let i = 0; i < numStr.length; i++) {
    if (i % 3 === 0 && i !== 0) {
      result += " ";
    }
    result += numStr[i];
  }
  return result;
}

/**
 * 房间信息面板
 *
 * @param Props
 * @returns
 */
export function InfoPanel(Props: { visible: boolean; onHide: () => void }) {
  let { state } = useContext(BootContext);
  useEffect(() => {});
  return (
    <MyOffCanvas
      classList={styles["bg"]}
      visible={Props.visible}
      onHide={Props.onHide}
      header={
        state.tcic ? (
          <>
            <h1 className={`${styles["title"]}`}>
              {state.tcic.classInfo.class_info.room_info.name}
            </h1>
            <div className={`${styles["share-btn"]}`}></div>
          </>
        ) : (
          <Loading></Loading>
        )
      }
    >
      {state.tcic ? (
        <div className={`${styles["info"]}`}>
          <ul>
            <li>
              <span className={`${styles["weak-text"]}`}> ID:</span>
              {addPadding(state.tcic.classInfo.class_info.class_id)}
              <span className={`${styles["copy-btn"]}`}> </span>
            </li>
            <li>
              <span className={`${styles["weak-text"]}`}> 简介:</span>
              {state.tcic.classInfo.class_info.room_info.name}
            </li>
          </ul>
        </div>
      ) : (
        <></>
      )}
    </MyOffCanvas>
  );
}
