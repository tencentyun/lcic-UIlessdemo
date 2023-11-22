const SDK_APPID_MAP = {
  prod: {
    ultimate: 3923193,
    light: 3454016,
  },
  test: {
    ultimate: 3520371,
    light: 3223994,
  },
};

let getUnixTime = function (time: number) {
  return Math.floor(time / 1000);
};

export class Demo {
  private _demoHost = "https://tcic-demo-api.qcloudclass.com";
  private _sdkAppId = SDK_APPID_MAP.prod.ultimate;
  private _uins: string[] = [];
  /**
   * 目前测试只有这一个uin可以用
   * @returns
   */
  async getValidUin() {
    let uins = await this.getDemoUins();
    return uins[uins.length - 1];
  }
  async getDemoUins() {
    if (this._uins.length > 0) {
      return this._uins;
    }
    let uinRes = await this.demoRequest("/getDevelopers", {
      param: {
        Env: "prod",
        env: "prod",
      },
    });

    console.log("result:", uinRes);
    this._uins = uinRes.Uin;
    return this._uins;
  }
  /**
   * 初始化开发相关信息
   * 方便本地开发使用
   * @returns
   */
  async developInit(
    classId: string,
    nick?: string
  ): Promise<{
    RequestId: string;
    Token: string;
    UserId: string;
  }> {
    let uin = await this.getValidUin();
    let roomInfoRes = await this.describeRoomInfo(uin, classId);
    console.log("roomInfoRes", roomInfoRes);
    let login = await this.login({
      Id: nick || "testxxx",
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
    /**
     * 老师进房
     * {
    "scene": "default",
    "Uin": "100028186709",
    "SdkAppId": 3923193,
    "Id": "teacher8316",
    "env": "prod"
}
     * 
     */
    return this.demoRequest("/login", {
      param: {
        ...param,
        env: "prod",
      },
    });
  }
  async createRoom(param: { nick: string }): Promise<{
    RequestId: string;
    RoomId: string;
  }> {
    let uin = await this.getValidUin();
    let getCreateRoomParam = () => {
      let nowTime = new Date().getTime() + 1000 * 60 * 5;
      let endTime = nowTime + 1000 * 60 * 60 * 3; //3小时结束
      return {
        Name: `测试房间${Math.floor(Math.random() * 1000)}`,
        TeacherId: param.nick,
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
        Uin: uin, //创建房间时，好像只能用这个uin
        SdkAppId: this._sdkAppId,
        scene: "default", //场景值，控制可配用于加载自定义JS/CSS
        env: "prod",
      };
    };
    let result = await this.demoRequest("/createRoom", {
      param: getCreateRoomParam(),
    });
    console.log("result:", result);
    return result.Response;
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
