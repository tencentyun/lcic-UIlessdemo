"use client";
import Script from "next/script";
import cssModule from "./style.module.css";
import { useEffect, useState } from "react";

// type
// :
// "main"
// url
// :
// "webrtc://29734.liveplay.myqcloud.com/live/1400313729_326322678_tic_push_user_326322678_168497_main?txSecret=644ab9465ed91dd7f6cfe1a5fc35a1b7&txTime=654B9520"
// user_id
// :
// "tic_push_user_326322678_168497"
type MemberStream = {
  type: string;
  user_id: string;
  url: string;
};

class Demo {
  private _demoHost = "https://tcic-demo-api.qcloudclass.com";
  /**
   * 初始化开发相关信息
   * 方便本地开发使用
   * @returns
   */
  async developInit(classId: string): Promise<{
    RequestId: string;
    Token: string;
    UserId: string;
  }> {
    let uinRes = await this.demoRequest("/getDevelopers", {
      param: {
        Env: "prod",
        env: "prod",
      },
    });

    console.log("result:", uinRes);
    let uin = uinRes.Uin[uinRes.Uin.length - 1];
    let roomInfoRes = await this.describeRoomInfo(uin, classId);
    console.log("roomInfoRes", roomInfoRes);
    let login = await this.login({
      Id: "testxxx",
      // Role: "student",
      Uin: uin,
      SdkAppId: roomInfoRes.Response.SdkAppId,
    });
    return login.Response;
  }
  describeRoomInfo(uin: string, classId: string) {
    const describeRoomParams = {
      Uin: uin,
      RoomId: parseInt(classId, 10),
    };
    return this.demoRequest("/describeRoom", {
      param: {
        scene: "default",
        env: "prod",
        ...describeRoomParams,
      },
    });
  }
  login(param: { Id: string; Role?: string; Uin: string; SdkAppId: string }) {
    return this.demoRequest("/login", {
      param: {
        ...param,
        env: "prod",
      },
    });
  }
  private async demoRequest(path: string, opts: { param: any }) {
    let res = await fetch(`${this._demoHost}${path}`, {
      method: "POST",
      headers: new Headers({
        "Content-type": "application/json",
      }),
      body: JSON.stringify(opts.param),
    });
    return await res.json();
  }
}

export function AppHeader(Props: { whenReady: any }) {
  let [ready, setReady] = useState(false);
  let [logining, setLoginging] = useState(false);
  let [classId, setClassId] = useState("");
  let [loginUser, setLoginUser] = useState<any>(null);
  let initTCIC = () => {
    setReady(true);
  };
  useEffect(() => {
    if (ready) {
      let cacahedClassId = localStorage.getItem("cached_classId");
      if (cacahedClassId) {
        setClassId(cacahedClassId);
        // loginHandler();
      }
    }
  }, [ready]);
  let initTcic = (param: {
    userId: string;
    token: string;
    classId: number;
  }) => {
    let tcic = TCIC_SPY.create(param);
    return new Promise((resolve) => {
      tcic.init({
        ready: () => {
          resolve(tcic);
        },
      });
    });
  };
  let changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^\d+$/.test(e.target.value)) {
      setClassId("");
      return;
    }
    setClassId(e.target.value);
  };
  let loginHandler = async () => {
    if (logining) {
      alert("初始化中,请稍后再试");
      return;
    }
    if (ready) {
      if (classId !== "") {
        localStorage.setItem("cached_classId", classId);
      }
      setLoginging(true);
      let global = window as any;
      console.log("useEffect TCIC", global.TCIC_SPY);
      let demoInfo = new Demo();
      let userInfo = await demoInfo.developInit(classId);
      let tcic: any = await initTcic({
        userId: userInfo.UserId,
        classId: parseInt(classId, 10),
        token: userInfo.Token,
      });

      setLoginUser(tcic);
      Props.whenReady && Props.whenReady(tcic);
    } else {
      alert("资源加载中,请稍后再试");
    }
  };
  return (
    <header>
      <Script
        src="http://localhost:9010/watch_sdk/dist/tcic_watch_sdk.1.0.0.js"
        onLoad={initTCIC}
      ></Script>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            tcic
          </a>
          <button
            className="navbar-toggler collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              {loginUser ? (
                <>
                  <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">
                      消息
                    </a>
                  </li>
                  {/* <li className="nav-item">
                    <a className="nav-link" href="#">
                      Link
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" aria-disabled="true">
                      Disabled
                    </a>
                  </li> */}
                </>
              ) : (
                <></>
              )}
            </ul>
            {loginUser ? (
              <div className={`d-flex ${cssModule["class-id"]}`}>
                {`classID:${loginUser.classId} userId:${loginUser.userId}`}
              </div>
            ) : logining ? (
              <div className={`d-flex ${cssModule["class-id"]}`}>登陆中..</div>
            ) : (
              <form className="d-flex" role="search">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="输入课堂号"
                  aria-label="Search"
                  value={classId}
                  onChange={changeHandler}
                />
                <button
                  className={`btn btn-outline-success ${cssModule["login-btn"]}`}
                  type="button"
                  onClick={loginHandler}
                >
                  进入
                </button>
              </form>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
