import { debugFatory } from "@/app/lib";
import { MyModal } from "../components/modal/modal";
import { Context, createContext, useReducer, useState } from "react";
let debug = debugFatory("Modal_Context");

type ModalState = {
  visible?: boolean;
  title?: string;
  content?: string;
  children?: any;
};

type showModalParam = {
  content?: any;
  onConfirm?: any;
  onCancel?: any;
  visible?: boolean;
  title?: string;
  btn?: {
    ok?: string;
    cancel?: string;
  };
};

type ModalContextType = {
  showModal: (args?: showModalParam) => void;
};

let contextObj = createContext({
  showModal: (args: showModalParam) => {},
  hideModal: () => {},
});

/**
 * 先强制类型转换，因为只用了factory部分功能，可以考虑优化写法
 */
export let ModalContext = contextObj;

export let ModalProvider = function ModalProvider(Props: { children: any }) {
  let [modalState, setModalState] = useState<showModalParam>({
    visible: false,
  });

  debug("ModalProvider", Props);
  function showModal(args: showModalParam) {
    setModalState({
      visible: true,
      ...args,
    });
  }

  function hideModal() {
    setModalState({
      visible: false,
    });
  }
  return (
    <contextObj.Provider value={{ showModal, hideModal }}>
      {Props.children}
      <MyModal
        visible={modalState.visible || false}
        onHide={() => {
          modalState.onCancel && modalState.onCancel();
        }}
        onCancel={() => {
          modalState.onCancel && modalState.onCancel();
        }}
        onConfirm={() => {
          modalState.onConfirm && modalState.onConfirm();
        }}
        btn={modalState.btn || undefined}
      >
        {modalState.content}
      </MyModal>
    </contextObj.Provider>
  );
};
