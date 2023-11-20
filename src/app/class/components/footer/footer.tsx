import css from "./style.module.css";

export function Footer(Props: { children?: any }) {
  return <div className={`container ${css["wrap"]}`}>{Props.children}</div>;
}
