import { useState } from "react";

export function useVisible() {
  let [visieble, setVisible] = useState(false);

  function show() {
    setVisible(true);
  }
  function hide() {
    setVisible(false);
  }
  return [visieble, show, hide] as const;
}
