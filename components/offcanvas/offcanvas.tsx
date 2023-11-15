"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BootContext } from "../../contexts/boot.context";

export function MyOffCanvas(Props: {
  children?: any;
  header?: any;
  visible: boolean;
  classList?: string;
  direction?: "top" | "bottom" | "start" | "end";
  onHide?: (event: any) => void;
}) {
  let { state: globalBoot } = useContext(BootContext);
  let targetEL = useRef<any>(null);
  let [bootstrapItem, setBootstrapItem] = useState<any>(null);
  let [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    console.log("globalBoot:", globalBoot, targetEL);
    let offcanvas = bootstrapItem;
    // /**
    //  *  初始化对象
    //  */
    if (globalBoot.boot && targetEL.current) {
      offcanvas = new globalBoot.boot.Offcanvas(targetEL.current);
      targetEL.current.addEventListener("hidden.bs.offcanvas", (event: any) => {
        Props.onHide && Props.onHide(event);
      });
      setBootstrapItem(offcanvas);
      if (Props.visible) {
        offcanvas.show();
      }
    }
    if (offcanvas) {
      if (Props.visible) {
        offcanvas.show();
      } else {
        offcanvas.hide();
      }
    }
  }, [Props.visible, globalBoot]);
  let BaseItem = (
    <div
      ref={targetEL}
      className={`offcanvas offcanvas-${Props.direction || "bottom"} ${
        Props.classList
      }`}
      aria-labelledby="offcanvasExampleLabel"
    >
      <div className="offcanvas-header">
        {Props.header ? (
          Props.header
        ) : (
          <>
            <h5 className="offcanvas-title">Offcanvas</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </>
        )}
      </div>
      <div className="offcanvas-body">{Props.children}</div>
    </div>
  );
  return mounted ? createPortal(BaseItem, document.body) : <></>;
}
