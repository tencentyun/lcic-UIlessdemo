import styles from "./style.module.css";

/**
 * @interface ChatProps
 */
export function Chat(Props: {}) {
  return (
    <div className={`${styles["wrap"]}`}>
      <div className={`${styles["message-list"]}`}>
        <div className={`${styles["message-padding"]}`}></div>
        <div className={`${styles["message"]}`}>
          <span className={`${styles["nick"]}`}>李子明：</span>
          话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗
        </div>
        <div className={`${styles["message"]}`}>
          <span className={`${styles["nick"]}`}>李子明：</span>
          话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗
        </div>
        <div className={`${styles["message"]}`}>
          <span className={`${styles["nick"]}`}>李子明：</span>
          话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗
        </div>
        <div className={`${styles["message"]}`}>
          <span className={`${styles["nick"]}`}>李子明：</span>
          话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗
        </div>
      </div>
      <div className={`${styles["emoji"]}`}></div>
      <input
        type="text"
        className={`form-control ${styles["chat-input"]}`}
        placeholder="聊聊吧～"
      />
    </div>
  );
}
