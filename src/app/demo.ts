export class Demo {
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
