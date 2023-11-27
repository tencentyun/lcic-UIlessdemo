import { MyOffCanvas } from '../../../../../components/offcanvas/offcanvas';
import styles from './style.module.css';
type EmojiItem = TCIC.Common.Item<{
  icon: string;
  img: string;
}>;

export let emojiList: EmojiItem[] = [
  {
    id: '1',
    text: '[鼓掌]',
    val: {
      icon: `${styles[`emoji-ic1`]}`,
      img: `${styles[`emoji-img1`]}`,
    },
  },
  {
    id: '2',
    text: '[强]',
    val: {
      icon: `${styles[`emoji-ic2`]}`,
      img: `${styles[`emoji-img2`]}`,
    },
  },
  {
    id: '3',
    text: '[玫瑰]',
    val: {
      icon: `${styles[`emoji-ic3`]}`,
      img: `${styles[`emoji-img3`]}`,
    },
  },
  {
    id: '4',
    text: '[爱心]',
    val: {
      icon: `${styles[`emoji-ic4`]}`,
      img: `${styles[`emoji-img4`]}`,
    },
  },
];

export function EmojiPanel(Props: {
  visible: boolean;
  onHide: any;
  onClicked: (data: EmojiItem) => void;
}) {
  return (
    <MyOffCanvas
      classList={`${styles['emoji-bg']}`}
      header={<></>}
      visible={Props.visible}
      onHide={Props.onHide}
    >
      <div className="container">
        <div className="row  row-cols-2">
          {emojiList.map((item) => (
            <div
              onClick={() => {
                Props.onClicked && Props.onClicked(item);
              }}
              className={`col ${styles['emoji-wrap']}`}
              key={item.id}
            >
              <div className={`${item.val?.icon}`}></div>
            </div>
          ))}
        </div>
      </div>
    </MyOffCanvas>
  );
}
