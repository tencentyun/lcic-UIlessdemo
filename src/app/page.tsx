"use client";
import styles from "./page.module.css";
import { useContext, useEffect, useState } from "react";
import { Demo } from "./demo";
import { BootContext } from "../../contexts/boot.context";

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

export default function Home() {
  let [classId, setClassId] = useState("");
  let changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^\d+$/.test(e.target.value)) {
      setClassId("");
      return;
    }
    setClassId(e.target.value);
  };

  let enterRoomHandler = async () => {
    let demoInfo = new Demo();
    let userInfo = await demoInfo.developInit(classId);
    console.log("enter room", userInfo);
    window.location.href = `${window.location.href}/class?cid=${classId}&uid=${userInfo.UserId}&token=${userInfo.Token}`;
  };
  return (
    <main className={`${styles.main} `}>
      <div className="container-lg">
        <div className="row">
          <div className="col">
            <h1 className={`${styles["demo-title"]}`}>LCIC-demo</h1>
            <div className={`${styles["inputWrap"]}`}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="输入课堂号"
                aria-label="Search"
                value={classId}
                onChange={changeHandler}
              />
              <button
                className={`btn btn-lg btn-primary ${styles["login-btn"]}`}
                onClick={enterRoomHandler}
              >
                进入
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
