import styles from "./style.module.css";

export function Tips(Props: { tips: any }) {
  return (
    <div
      className={`${styles["message"]} ${styles["msg-tips"]} ${styles["msg-tips-show"]}`}
    >
      {Props.tips}
    </div>
  );
}
