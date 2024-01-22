'use client';
import styles from './page.module.css';
import { useState } from 'react';
import { Demo } from './demo';
import { RoleName } from './lib';
import { useRouter } from 'next/navigation';

// import { AppHeader } from "./components/header/header";

// type
// :
// "main"
// url
// :
// "webrtc://29734.liveplay.myqcloud.com/live/1400313729_326322678_tic_push_user_326322678_168497_main?txSecret=644ab9465ed91dd7f6cfe1a5fc35a1b7&txTime=654B9520"
// user_id
// :
// "tic_push_user_326322678_168497"

let getRandomName = (name: string) => {
  return `${name}_${Math.floor(Math.random() * 1000)}`;
};

export default function Home() {
  let [classId, setClassId] = useState('');
  let router = useRouter();
  let [currentType, setCurrentType] = useState<any>(RoleName.AUDIENCE);
  let [nick, setNick] = useState(getRandomName('Audience'));
  let [creatingRoom, setCreatingRoom] = useState(false);
  let changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^\d+$/.test(e.target.value)) {
      setClassId('');
      return;
    }
    setClassId(e.target.value);
  };
  let nickChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNick(e.target.value);
  };

  let createRoomHandler = async () => {
    if (creatingRoom) {
      return;
    }
    creatingRoom = true;
    setCreatingRoom(true);
    let demoInfo = new Demo();
    let result = await demoInfo.createRoom({
      nick: nick,
    });
    console.log('demoInfo.createRoom:', result);
    jumpToRoom(result.RoomId, nick);
    // result.RoomId;
  };
  let jumpToRoom = async (class_id: string, nick: string) => {
    let demoInfo = new Demo();
    let userInfo = await demoInfo.developInit(class_id, nick);
    console.log('enter room', userInfo);
    router.push(
      `/class?cid=${class_id}&uid=${userInfo.UserId}&token=${userInfo.Token}`,
    );
  };

  let enterRoomHandler = async () => {
    if (!classId) {
      return;
    }
    jumpToRoom(classId, nick);
  };

  let MenuList: TCIC.Common.Item<{
    placeHolder: string;
  }>[] = [
    {
      id: RoleName.AUDIENCE,
      text: 'Audience',
      val: {
        placeHolder: 'Input your room number',
      },
    },
    {
      id: RoleName.HOSTER,
      text: 'Hoster',
      val: {
        placeHolder: 'Input your nick name',
      },
    },
  ];

  return (
    <main className={`${styles.main} `}>
      <div className="container-lg">
        <div className="row">
          <div className="col">
            <h1 className={`${styles['demo-title']}`}>LCIC-demo</h1>

            <div className={`${styles['inputWrap']}`}>
              <div className="input-group mb-3">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {MenuList[Number(currentType)].text}
                </button>
                <ul className="dropdown-menu">
                  {MenuList.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        if (creatingRoom) {
                          return;
                        }
                        if (item.id === RoleName.AUDIENCE) {
                          setNick(getRandomName('Audience'));
                        } else {
                          setNick(getRandomName('Host'));
                        }
                        setCurrentType(item.id);
                      }}
                    >
                      <a className="dropdown-item">{item.text}</a>
                    </li>
                  ))}
                </ul>
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder={MenuList[Number(currentType)].val?.placeHolder}
                  aria-label="Search"
                  value={nick}
                  onChange={nickChangeHandler}
                />
              </div>
              {currentType === RoleName.AUDIENCE ? (
                <>
                  <div className="dropdown input-group mb-3">
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder={
                        MenuList[Number(currentType)].val?.placeHolder
                      }
                      aria-label="Search"
                      value={classId}
                      onChange={changeHandler}
                    />
                  </div>
                  <button
                    className={`btn btn-primary `}
                    onClick={enterRoomHandler}
                  >
                    加入
                  </button>
                </>
              ) : (
                <>
                  {/* <div className="dropdown input-group mb-3">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Dropdown button
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                      </li>
                    </ul>
                  </div> */}
                  <button
                    className={`btn btn-primary`}
                    onClick={createRoomHandler}
                  >
                    {creatingRoom ? 'Creating...' : 'Create'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
