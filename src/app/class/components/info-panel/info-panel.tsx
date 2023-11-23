import { useContext, useEffect } from "react";
import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";
import { Loading } from "../loading/loading";
import { debugFatory } from "@/app/lib";
import { ModalContext } from "../../../../../contexts/modal.context";

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
let debug = debugFatory("InfoPanel");
function copyToClipboard(text: any) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

/**
 * 房间信息面板
 *
 * @param Props
 * @returns
 */
export function InfoPanel(Props: { visible: boolean; onHide: () => void }) {
  let { state } = useContext(BootContext);
  let { showModal, hideModal } = useContext(ModalContext);
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
              <span
                className={`${styles["copy-btn"]}`}
                onClick={() => {
                  copyToClipboard(state.tcic.classInfo.class_info.class_id);
                  showModal({
                    content: "复制成功",
                    onConfirm: () => {
                      hideModal();
                    },
                    btn: {
                      ok: "确定",
                    },
                  });
                }}
              >
                {" "}
              </span>
            </li>
            {/* <li>
              <span className={`${styles["weak-text"]}`}> 简介:</span>
              {state.tcic.classInfo.class_info.room_info.name}
            </li> */}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </MyOffCanvas>
  );
}
