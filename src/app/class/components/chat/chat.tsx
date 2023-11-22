import { useContext, useEffect, useRef, useState } from "react";
import styles from "./style.module.css";
import { BootContext } from "../../../../../contexts/boot.context";
import { debugFatory } from "@/app/lib";
import { Loading } from "../loading/loading";
import { EmojiPanel, emojiList } from "./emoji";
import { useVisible } from "../../../../../hooks/visible";
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
let fake_counter = 0;
/**
 * @interface ChatProps
 */
export function Chat(Props: { children?: any }) {
  let { state } = useContext(BootContext);
  /**
   * 判断是否初始化成功
   */
  let [inited, setInited] = useState(false);
  let [msgList, setMsgList] = useState<MessageData[]>([]);
  let listEl = useRef<HTMLDivElement>(null);
  let [newmsgcounter, setMsgCounter] = useState(0);
  let [emojiVisible, emojiShow, emojiHide] = useVisible();
  let [timReady, setTimReady] = useState(false);

  function createMyMsg(msg: string): MessageData {
    // hostInfo.detail.user_name
    let myInfo = state.tcic?.myInfo();
    return {
      ID: `faked_${++fake_counter}`,
      Operator_Account: myInfo.detail.user_id,
      From_Account: myInfo.detail.user_id,
      GroupId: state.tcic?.classInfo.class_info.room_info.room_id,
      CallbackCommand: "Group.CallbackAfterSendMsg",
      NickName: myInfo.detail.user_name,
      Type: "AVChatRoom",
      MsgTime: Date.now(),
      MsgSeq: fake_counter,
      CloudCustomData: "",
      MsgBody: [
        {
          MsgType: "TIMTextElem",
          MsgContent: {
            Text: msg,
          },
        },
      ],
    };
  }
  /**
   * 获取历史消息
   */
  useEffect(() => {
    // debug("state: efected", state);
    if (state.tim) {
      let target = state.tim;
      target.whenReady(() => {
        setTimReady(true);
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
      });
    }
  }, [state.tim]);

  let renderHistoryMsg = msgList.map((item: MessageData, index) => {
    return (
      <div key={item.ID} className={`${styles["message"]}`}>
        <span className={`${styles["nick"]}`}>{item.NickName}：</span>
        {item.MsgBody.map((msg) => {
          /**
           * 检查是否表情
           */
          let target = emojiList.find(
            (emoji) => emoji.text === msg.MsgContent.Text
          );
          if (target) {
            return <div key={item.ID} className={target.val!.img}></div>;
          }
          return msg.MsgContent.Text;
        })}
      </div>
    );
  });

  /**
   * 每条消息的最小高度
   */
  const singleHeight = 54;
  let showNewMsgTips = false;
  if (listEl.current) {
    // debug(
    //   "listEl.current",
    //   listEl.current.scrollTop,
    //   listEl.current.scrollHeight
    // );
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
    <>
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
        {Props.children}
        <div
          className={`${styles["emoji"]}`}
          onClick={() => {
            inited && emojiShow();
          }}
        ></div>
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
      <EmojiPanel
        visible={emojiVisible}
        onHide={emojiHide}
        onClicked={(arg) => {
          if (state.tim) {
            let msgObj = createMyMsg(arg.text);
            setMsgList((preList) => {
              let newList = preList.concat();
              newList.push(msgObj);
              return [...newList];
            });
            state.tim.sendRoomMsg(arg.text);
          }
          emojiHide();
        }}
      ></EmojiPanel>
    </>
  );
}
