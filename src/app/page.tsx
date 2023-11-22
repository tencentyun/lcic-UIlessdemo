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

const enum MenuType {
  Audience = "0",
  Owner = "1",
}

export default function Home() {
  let [classId, setClassId] = useState("");
  let [currentType, setCurrentType] = useState<any>(MenuType.Audience);
  let [hostNick, setHostNick] = useState(
    `Host${Math.floor(Math.random() * 1000)}`
  );

  let changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^\d+$/.test(e.target.value)) {
      setClassId("");
      return;
    }
    setClassId(e.target.value);
  };
  let nickChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostNick(e.target.value);
  };

  let createRoomHandler = async () => {
    let getUnixTime = function (time: number) {
      return Math.floor(time / 1000);
    };

    let getCreateRoomParam = (uin: string, sdkId: string) => {
      let nowTime = new Date().getTime();
      let endTime = nowTime + 1000 * 60 * 60 * 3; //3小时结束
      return {
        Name: `测试房间${Math.floor(Math.random() * 1000)}`,
        TeacherId: hostNick,
        Assistants: [],
        StartTime: getUnixTime(nowTime),
        EndTime: getUnixTime(endTime),
        RoomType: 0, //班型，0-小班课，1-大班课
        MaxMicNumber: 10, // 最大连麦人数，不包括老师，[0, 16]
        // RTCAudienceNumber: parseInt(this.roomConfig.MaxMicNumber, 10) + 1, // rtc互动房间人数需要加上老师
        RTCAudienceNumber: 50, // 不能只加老师，还要包括其他不上台但是要拉rtc流的人，否则超出的用户只能拉快直播流
        /**
       * const innerLayoutConfig = {
          videodoc: {
            SubType: 'videodoc',
            VideoOrientation: 0,
          },
          video: {
            SubType: 'video',
            VideoOrientation: 0,
          },
          videoPortrait: {
            SubType: 'video',
            VideoOrientation: 1,
          },
       * };
       */
        SubType: "videodoc", // 教室布局
        VideoOrientation: 0, // 视频方向，0-横屏，1-竖屏
        RecordLayout: 1, //  录制模板，枚举值参考 https://cloud.tencent.com/document/product/1639/89744#dbdb018b-d36f-488b-b830-deb6689c9c64
        AudienceType: 1, //观看类型，1-RTC观看, 2-CDN观看（大班课）
        AutoMic: 0, // 是否允许学生自动上麦,1允许，0不允许
        EnableDirectControl: 0, //方向控制 ,0-不允许，1-允许
        AudioQuality: 0, // 音质，0-标准音质，1-高音质
        Resolution: 2, // 分辨率，1-标准，2-高清，3-全高清
        InteractionMode: 0, // 开启专注模式。0 收看全部角色音视频(默认) 1 只看老师和助教
        IsGradingRequiredPostClass: 0, // 是否开启课后评分，0-不开启，1-开启,Tips: 这种逻辑建议自行实现
        DisableRecord: 1, // 是否开启录制 1-开启，-0-关闭
        Uin: "this.uin",
        SdkAppId: "parseInt(this.sdkAppId, 10)",
        scene: "default", //场景值，控制可配用于加载自定义JS/CSS
        env: "prod",
      };
    };
  };
  let enterRoomHandler = async () => {
    let demoInfo = new Demo();
    if (!classId) {
      return;
    }
    let userInfo = await demoInfo.developInit(classId);
    console.log("enter room", userInfo);
    window.location.href = `${window.location.href}/class?cid=${classId}&uid=${userInfo.UserId}&token=${userInfo.Token}`;
  };

  let MenuList: TCIC.Common.Item<{
    placeHolder: string;
  }>[] = [
    {
      id: MenuType.Audience,
      text: "观众",
      val: {
        placeHolder: "输入房间号",
      },
    },
    {
      id: MenuType.Owner,
      text: "房主",
      val: {
        placeHolder: "输入昵称",
      },
    },
  ];

  return (
    <main className={`${styles.main} `}>
      <div className="container-lg">
        <div className="row">
          <div className="col">
            <h1 className={`${styles["demo-title"]}`}>LCIC-demo</h1>

            <div className={`${styles["inputWrap"]}`}>
              <div className="input-group mb-3">
                <button
                  className="btn  btn-secondary dropdown-toggle"
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
                        setCurrentType(item.id);
                      }}
                    >
                      <a className="dropdown-item">{item.text}</a>
                    </li>
                  ))}
                </ul>
                {currentType === MenuType.Audience ? (
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder={MenuList[Number(currentType)].val?.placeHolder}
                    aria-label="Search"
                    value={classId}
                    onChange={changeHandler}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder={MenuList[Number(currentType)].val?.placeHolder}
                    aria-label="Search"
                    value={hostNick}
                    onChange={nickChangeHandler}
                  />
                )}
              </div>
              {currentType === MenuType.Audience ? (
                <button
                  className={`btn btn-primary `}
                  onClick={enterRoomHandler}
                >
                  加入
                </button>
              ) : (
                <>
                  <div className="dropdown input-group mb-3">
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
                  </div>
                  <button
                    className={`btn btn-primary`}
                    onClick={createRoomHandler}
                  >
                    创建
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
