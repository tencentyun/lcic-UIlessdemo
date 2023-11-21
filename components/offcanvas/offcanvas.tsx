"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BootContext } from "../../contexts/boot.context";
import { debugFatory } from "@/app/lib";

let debug = debugFatory("OffCanvas");

export function MyOffCanvas(Props: {
  children?: any;
  header?: any;
  visible: boolean;
  classList?: string;
  // direction?: "top" | "bottom" | "start" | "end";
  onHide?: (event: any) => void;
}) {
  let { state: globalBoot } = useContext(BootContext);
  let targetEL = useRef<any>(null);
  let [bootstrapItem, setBootstrapItem] = useState<any>(null);
  let [mounted, setMounted] = useState(false);
  let [direction, setDirection] = useState<"bottom" | "start">("start");
  useEffect(() => {
    setMounted(true);
    let offcanvas = bootstrapItem;
    // /**
    //  *  初始化对象
    //  */
    if (globalBoot.boot && targetEL.current) {
      debug("init offcanvas");
      offcanvas = new globalBoot.boot.Offcanvas(targetEL.current);
      targetEL.current.addEventListener("hidden.bs.offcanvas", (event: any) => {
        Props.onHide && Props.onHide(event);
      });
      setBootstrapItem(offcanvas);
      if (Props.visible) {
        offcanvas.show();
      }
    }
    /**
     * 响应式交互优化，小屏幕从下方出，大屏幕从左边出
     * 浏览器相关行为要在effect里实现，避免服务端渲染报错b
     */
    if (window && window.innerWidth < 800) {
      setDirection("bottom");
    }
  }, [globalBoot.boot]);

  if (bootstrapItem) {
    if (Props.visible) {
      bootstrapItem.show();
    } else {
      bootstrapItem.hide();
    }
  }

  let BaseItem = (
    <div
      ref={targetEL}
      className={`offcanvas offcanvas-${direction} ${Props.classList}`}
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
