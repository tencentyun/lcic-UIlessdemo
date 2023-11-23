import { debugFatory } from "@/app/lib";
import { MyModal } from "../components/modal/modal";
import { createContext, useState } from "react";
import { CounterDown } from "@/app/class/components/counter-down/counter-down";
let debug = debugFatory("Modal_Context");

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

type showCounterDownParam = { counter: number; callback: any };

let contextObj = createContext({
  showModal: (args: showModalParam) => {},
  hideModal: () => {},
  showCounterDown: (arg: showCounterDownParam) => {},
});

/**
 * 先强制类型转换，因为只用了factory部分功能，可以考虑优化写法
 */
export let ModalContext = contextObj;

export let ModalProvider = function ModalProvider(Props: { children: any }) {
  let [modalState, setModalState] = useState<showModalParam>({
    visible: false,
  });
  let [counterState, setCounterState] = useState({
    value: 0,
  });

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

  function showCounterDown(arg: showCounterDownParam) {
    let counter = arg.counter;
    let counterDown = setInterval(() => {
      if (counter <= 0) {
        clearInterval(counterDown);
        arg.callback && arg.callback();
      }
      setCounterState({
        value: counter--,
      });
    }, 1000);
    setCounterState({
      value: counter--,
    });
  }
  return (
    <contextObj.Provider value={{ showModal, hideModal, showCounterDown }}>
      {Props.children}
      <MyModal
        visible={modalState.visible || false}
        onHide={modalState.onCancel}
        onCancel={modalState.onCancel}
        onConfirm={modalState.onConfirm}
        btn={modalState.btn || undefined}
      >
        {modalState.content}
      </MyModal>
      <CounterDown value={counterState.value}></CounterDown>
    </contextObj.Provider>
  );
};
