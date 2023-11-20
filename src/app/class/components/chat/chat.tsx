import { useContext, useEffect, useRef, useState } from "react";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";
import { debugFatory } from "@/app/lib";
import { Loading } from "../loading/loading";
let debug = debugFatory("Chat");
/**
 * {
    "GroupId": "336929693",
    "CallbackCommand": "Group.CallbackAfterSendMsg",
    "From_Account": "2Srao3bzGyRLWIVX6Wg6HhBv1Ao",
    "Operator_Account": "2Srao3bzGyRLWIVX6Wg6HhBv1Ao",
    "NickName": "teacher8316",
    "Type": "AVChatRoom",
    "MsgTime": 1700448788,
    "MsgSeq": 74,
    "CloudCustomData": "",
    "MsgBody": [
        {
            "MsgType": "TIMTextElem",
            "MsgContent": {
                "Text": "qwep"
            }
        }
    ]
}
 * 
 */
type SubType =
  | "v1/stage"
  | "v1/sync"
  | "v1/permissions"
  | "v1/hand_up"
  | "v1/stage_loop";
export interface MessageData {
  ID: string;
  GroupId: string;
  CallbackCommand: string;
  From_Account: string;
  Operator_Account: string;
  NickName: string;
  Type: string;
  MsgTime: number;
  MsgSeq: number;
  CloudCustomData: string;
  MsgBody: MessageBody[];
}

export interface MessageBody {
  MsgType: string;
  MsgContent: {
    Text: string;
  };
}
/**
 * @interface ChatProps
 */
export function Chat(Props: {}) {
  let { state } = useContext(BootContext);
  /**
   * 判断是否初始化成功
   */
  let [inited, setInited] = useState(false);
  let [timObj, setTimObj] = useState<any>(null);
  let [msgList, setMsgList] = useState<MessageData[]>([]);
  let listEl = useRef<HTMLDivElement>(null);
  let [newmsgcounter, setMsgCounter] = useState(0);

  /**
   * 获取历史消息
   */
  useEffect(() => {
    debug("state: efected", state);
    let target: any = null;
    if (state.sdk && state.tcic && !timObj) {
      target = state.sdk.createTimClient(state.tcic);
      debug("timObj:", target);
      target.getHistoryList().then((data: MessageData[]) => {
        data.reverse();
        data.forEach((item, index) => {
          item.ID = `${item.Operator_Account}_${index}}`;
        });
        setMsgList(data);
        setInited(true);
      });

      target.on("groupMsgReceived", (msg: any) => {
        debug("groupMsgReceived groupMsgReceived:", msg);

        let newMsg: MessageData = {
          ID: msg.ID,
          GroupId: msg.to,
          CallbackCommand: "Group.CallbackAfterSendMsg",
          From_Account: msg.from,
          Operator_Account: msg.from,
          NickName: msg.nick,
          Type: msg.type,
          MsgTime: msg.time,
          MsgSeq: msg.seq,
          CloudCustomData: msg.cloudCustomData,
          MsgBody: [
            {
              MsgType: msg.data.type,
              MsgContent: {
                Text: msg.data.content.text,
              },
            },
          ], //已经包装过一次，
        };
        setMsgList((preList) => {
          let newList = preList.concat();
          newList.push(newMsg);
          return [...newList];
        });
        setMsgCounter((prevCounter) => prevCounter + 1);
      });
      target.whenReady(() => {
        debug("IM ready");
        setTimObj(target);
        // target.tim.on(target.EVENT.MESSAGE_RECEIVED, (msg: any) => {
        //   debug("MESSAGE_RECEIVED msg: >>>>--->>", msg);
        //   msg.data.forEach((item: any) => {
        //     debug("messsG getElements: foreach", item.getElements());
        //   });
        //   debug("messsG getElements:", msg.data);
        // });
      });
    }
    return () => {
      if (target) {
        target.off("groupMsgReceived");
        target.destroy();
      }
    };
  }, [state, Props]);

  //   <div className={`${styles["message"]}`}>
  //   <span className={`${styles["nick"]}`}>李子明：</span>
  //   话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗话字字什么梗，话字字什么梗
  // </div>
  let renderHistoryMsg = msgList.map((item: MessageData, index) => {
    return (
      <div key={item.ID} className={`${styles["message"]}`}>
        <span className={`${styles["nick"]}`}>{item.NickName}：</span>
        {item.MsgBody.map((msg) => {
          return msg.MsgContent.Text;
        })}
      </div>
    );
  });

  debug("changed---");

  /**
   * 每条消息的最小高度
   */
  const singleHeight = 54;
  let showNewMsgTips = false;
  if (listEl.current) {
    debug(
      "listEl.current",
      listEl.current.scrollTop,
      listEl.current.scrollHeight
    );
    listEl.current.clientHeight;
    /**
     * 如果滚动高度接近底部，则表示用户已经看完所有消息，
     * 如果此时滚动高度不在底部，则可能用户看不到新消息，提示有新增消息
     * 暂时先标记为一半高度
     */
    if (
      listEl.current.scrollHeight - listEl.current.scrollTop >
      listEl.current.clientHeight / 2
    ) {
      showNewMsgTips = true;
    } else {
      showNewMsgTips = false;
    }
    // debug(
    //   " listEl.current.scrollHeight - listEl.current.scrollTop",
    //   listEl.current.scrollHeight - listEl.current.scrollTop
    // );
  }

  let jumpToNewMsg = () => {
    if (listEl.current) {
      listEl.current.scrollTop = listEl.current.scrollHeight;
      setMsgCounter(0);
    }
  };

  return (
    <div className={`${styles["wrap"]}`}>
      <div ref={listEl} className={`${styles["message-list"]}`}>
        {inited ? (
          /**
           * 消息列表保持滚动最小高度
           * 为后续做无限滚动准备
           * todo: 性能优化，无限滚动
           */
          <div style={{ minHeight: `${msgList.length * singleHeight}px` }}>
            {renderHistoryMsg}
          </div>
        ) : (
          <Loading></Loading>
        )}
      </div>
      <div className={`${styles["emoji"]}`}></div>
      <div
        className={`${styles["new-tips"]} ${
          showNewMsgTips && newmsgcounter
            ? styles["new-show"]
            : styles["new-hide"]
        }`}
        onClick={jumpToNewMsg}
      >
        有{newmsgcounter}条新消息<i className={`${styles["down-icon"]}`}></i>
      </div>
      <input
        type="text"
        className={`form-control ${styles["chat-input"]}`}
        placeholder="聊聊吧～"
      />
    </div>
  );
}
