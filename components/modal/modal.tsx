import { useContext, useEffect, useRef, useState } from "react";
import { BootContext } from "../../contexts/boot.context";
import { debugFatory } from "@/app/lib";

let debug = debugFatory("Modal");
export function MyModal(Props: {
  children?: any;
  onConfirm?: any;
  onCancel?: any;
  onHide?: any;
  visible: boolean;
  title?: string;
  btn?: {
    ok?: string;
    cancel?: string;
  };
}) {
  let { state } = useContext(BootContext);
  let [bootstrapItem, setBootstrapItem] = useState<any>(null);
  let targetEL = useRef<any>(null);
  let [mounted, setMounted] = useState(false);
  debug("renderModal", mounted);

  useEffect(() => {
    setMounted(true);
    if (state.boot && targetEL.current && !bootstrapItem) {
      let modal = new state.boot.Modal(targetEL.current);
      targetEL.current.addEventListener("hidden.bs.modal", (event: any) => {
        Props.onHide && Props.onHide(event);
      });
      setBootstrapItem(modal);
    }
  }, [state.boot, Props.visible]);

  if (bootstrapItem) {
    if (Props.visible) {
      bootstrapItem.show();
    } else {
      bootstrapItem.hide();
    }
  }

  return mounted ? (
    <div className="modal" ref={targetEL}>
      <div className="modal-dialog  modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{Props.title || ""}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">{Props.children}</div>
          <div className="modal-footer">
            {Props.btn ? (
              <>
                {Props.btn.cancel ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={Props.onCancel}
                  >
                    {Props.btn.cancel}
                  </button>
                ) : (
                  <></>
                )}
                {Props.btn.ok ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={Props.onConfirm}
                  >
                    {Props.btn.ok}
                  </button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={Props.onCancel}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={Props.onConfirm}
                >
                  确定
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
