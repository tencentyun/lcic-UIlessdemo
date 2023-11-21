import { MyOffCanvas } from "../../../../../components/offcanvas/offcanvas";
import { useVisible } from "../../../../../hooks/visible";

type EmojiItem = TCIC.Common.Item<{
  icon: string;
}>;
export function EmojiPanel(Props: { visible: boolean; onHide: any }) {
  let emojiList: EmojiItem[] = [
    {
      id: "1",
      text: "[鼓掌]",
      val: {
        icon: "1",
      },
    },
    {
      id: "2",
      text: "[强]",
      val: {
        icon: "1",
      },
    },
    {
      id: "3",
      text: "[玫瑰]",
      val: {
        icon: "1",
      },
    },
    {
      id: "3",
      text: "[爱心]",
      val: {
        icon: "1",
      },
    },
  ];
  return (
    <MyOffCanvas header={"表情"} visible={Props.visible} onHide={Props.onHide}>
      <div className="container">
        <div className="row">
          <div className="col"></div>
        </div>
      </div>
    </MyOffCanvas>
  );
}
