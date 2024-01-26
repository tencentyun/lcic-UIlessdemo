'use client';
import { Dispatch, useContext, useEffect, useReducer, useState } from 'react';
import { MyOffCanvas } from '../../../../../components/offcanvas/offcanvas';
import styles from './style.module.css';
import { TMemberActionType, checkUserPermission, debugFatory } from '@/app/lib';
import { Loading } from '../loading/loading';
import { ModalContext } from '../../../../../contexts/modal.context';
import { BootContext } from '../../../../../contexts/boot.context';
import { RoomContext } from '../../../../../contexts/room.context';
import { InteractionContext } from '../../../../../contexts/interaction.context';

export type Member = TCIC.Common.Item<any>;

const debug = debugFatory('MemberList');
type MemberViewProps = {
  page: number;
  pageSize: number;
  members: Member[];
  myInfo: Member | null;
  hostInfo: Member | null;
};
export function getValidMembers(data: any, exceptIds: string[]) {
  return data
    .filter((item: any) => {
      /**
       * 不展示房主，并且只展示在线
       */
      return (
        !exceptIds.includes(item.user_id) &&
        item.current_state == TMemberStatus.Online
      );
    })
    .map((item: any) => {
      return {
        id: item.user_id,
        text: item.user_name,
        val: item,
      };
    });
}

export enum TMemberStatus {
  /**
   * 未到
   */
  Absent = 0,
  /**
   * 在线
   */
  Online = 1,
  /**
   * 已退出
   */
  Quited = 2,
  /**
   * 被踢出
   */
  KickOuted = 3,
  /**
   * 被永久踢出
   */
  KickOutedForever = 4,
  /**
   * 掉线
   */
  Offline = 5,
}
type ActionParam = { type: 'update'; arg: Partial<MemberViewProps> };
function memberReducer(state: MemberViewProps, actions: ActionParam) {
  switch (actions.type) {
    case 'update':
      return { ...state, ...actions.arg };
    default:
      return state;
  }
}

export function MemberList(Props: {
  onHide: (evnet: any) => void;
  visible: boolean;
}) {
  debug('Props:', Props.visible);
  /**
   * 暂时先不做分页，一次性拉50条数据
   */
  const [state, dispatch]: [MemberViewProps, Dispatch<ActionParam>] =
    useReducer(memberReducer, {
      page: 0,
      pageSize: 50,
      members: [],
      total: -1,
      myInfo: null,
      hostInfo: null,
    } as MemberViewProps);

  const { state: BootState } = useContext(BootContext);

  const { state: RoomState } = useContext(RoomContext);
  const { state: InterationState, dispatch: interationDispatch } =
    useContext(InteractionContext);

  const { showModal, hideModal } = useContext(ModalContext);

  const [loading, setLoading] = useState(false);

  /**
   * 初始化用户信息
   */
  useEffect(() => {
    debug('debug:', BootState.tcic);
    if (BootState.tcic) {
      dispatch({
        type: 'update',
        arg: {
          myInfo: BootState.tcic.myInfo(),
          hostInfo: BootState.tcic.hostInfo(),
        },
      });
    }
  }, [BootState.tcic]);

  function updateState(res: any) {
    const onlineMember = res.total - res.member_offline_number;
    const updateData = {
      members: getValidMembers(res.members, [state.hostInfo?.id]),
      onlineNumber: state.hostInfo ? onlineMember - 1 : onlineMember, //减去host自己
      total: res.total,
    };

    dispatch({
      type: 'update',
      arg: updateData,
    });
  }

  useEffect(() => {
    /**
     * RoomState的时序在BootState之后
     */
    if (RoomState.classId) {
      debug('WIll request init memberList');
      /**
       * 暂时先拉一页
       */
      BootState.tcic!.getMembersDetail(RoomState.classId, {
        page: state.page,
        limit: state.pageSize,
      }).then((res: any) => {
        debug('res.members:', res.members);
        res.members = getValidMembers(res.members, [state.hostInfo?.id || '']);

        /**
         * 先直接减去host数量,host有可能不在线，
         * todo 改为更严峻的逻辑计算
         */
        interationDispatch({
          type: 'update',
          arg: {
            onlineAuienceNum: res.member_number - res.member_offline_number - 1,
          },
        });

        updateState(res);
      });
    }
  }, [RoomState.classId]);

  useEffect(() => {
    if (!BootState.tcic) {
      throw new Error('初始化sdk后才能展示用户列表');
    }
    /**
     * 没有初始化房间信息
     */
    if (!RoomState.classId) {
      throw new Error('初始化roomState后才能用户列表');
    }
    if (Props.visible) {
      setLoading(true);

      BootState.tcic
        .getMembersDetail(RoomState.classId, {
          page: state.page,
          limit: state.pageSize,
        })
        .then((res: any) => {
          setLoading(false);
          updateState(res);
        });
    }
  }, [Props.visible, RoomState]);

  const kickoutUser = (udata: Member) => {
    debug('userId', udata);
    showModal({
      content: `确定踢出用户${udata.text}？`,
      onCancel: () => {
        hideModal();
      },
      onConfirm() {
        hideModal();
        const updateData = {
          members: getValidMembers(state.members, [
            state.hostInfo?.id || '',
            udata.id,
          ]),
          onlineNumber: InterationState.onlineAuienceNum - 1, //减去刚踢的用户
          total: InterationState.historyOnlineNum - 1,
        };
        dispatch({
          type: 'update',
          arg: updateData,
        });
        BootState.tcic!.memberAction({
          classId: RoomState.classId,
          userId: udata.id,
          actionType: 18,
          /**
           * 参考用户行为, 18: 踢出,
           * todo: 将类型引入到项目
           **/
        });
      },
    });
  };

  const callUser = (udata: Member, uninvite: boolean = false) => {
    debug('userId', udata);
    /**
     * 一次最多邀请一个用户上台
     */
    // if (!uninvite) {
    //   if (InterationState.onStageMembers.length > 1) {
    //     showModal({
    //       content: `最多只能邀请一个用户连麦,请先将其它用户取消连麦`,
    //       onCancel: () => {
    //         hideModal();
    //       },
    //       onConfirm() {
    //         hideModal();
    //       },
    //     });
    //     return;
    //   }
    // }

    showModal({
      content: uninvite
        ? `是否取消与${udata.text}连麦？`
        : `是否邀请${udata.text}连麦？`,
      onCancel: () => {
        hideModal();
      },
      onConfirm() {
        hideModal();
        // const updateData = {
        //   members: getValidMembers(state.members, [
        //     roomInfo.teacher_id || '',
        //     udata.id,
        //   ]),
        //   onlineNumber: state.onlineNumber - 1, //减去刚踢的用户
        //   total: state.total - 1,
        // };
        // Props.onUpdate && Props.onUpdate(updateData);
        // dispatch({
        //   type: 'update',
        //   arg: updateData,
        // });

        /**
         * 先让用户下台，再上台，保证有提示
         */
        BootState.tcic!.memberAction({
          classId: RoomState.classId,
          userId: udata.id,
          actionType: TMemberActionType.Stage_Down,
        }).finally(() => {
          if (!uninvite) {
            /**
             * todo: 将类型引入到项目
             **/
            BootState.tcic?.memberAction({
              classId: RoomState.classId,
              userId: udata.id,
              actionType: TMemberActionType.Stage_Up,
            });
          }
        });
      },
    });
  };

  const hasKickPermission = state.myInfo
    ? checkUserPermission(state.myInfo, 'kickOut')
    : false;
  const memberItem = function (member: Member) {
    debug('dataL Member', member, Props);
    if (member.id === state.hostInfo?.id) {
      return;
    }
    let text = member.text;
    if (state.myInfo?.id === member.id) {
      text = `${member.text}(我)`;
    }
    const isHandsUp = InterationState.handsUpMembers.find(
      (item) => item.id === member.id,
    );
    text = `${isHandsUp ? `${text} [申请连麦]` : `${text}`}`;
    let isOnStage = false;

    const isInvated = InterationState.onStageMembers.find(
      (item) => item.id === member.id,
    );
    isOnStage = !!isInvated;
    return (
      <div className={`${styles['member']}`} key={member.id}>
        {text}
        {hasKickPermission ? (
          <>
            <i
              className={`${styles['kickout-icon']} float-end`}
              onClick={() => {
                kickoutUser(member);
              }}
            ></i>

            <i
              className={` ${styles['call-icon']} ${
                isOnStage ? styles['red-icon'] : ''
              } float-end`}
              onClick={() => {
                callUser(member, isOnStage);
              }}
            ></i>
          </>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <MyOffCanvas
      visible={Props.visible}
      classList={`${styles['bg']}`}
      header={
        <div className={`${styles['header']}`}>
          <h1 className={`${styles['title']}`}>观众列表</h1>
          <div className="container">
            <div className="row">
              <div className="col text-start">
                {`在线观众(${InterationState.onlineAuienceNum})`}
                {loading ? (
                  <div className={`${styles['member-loading']}`}>
                    <Loading size="small"></Loading>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              {hasKickPermission ? (
                <>
                  <div className="col text-end">
                    <span>连麦</span> <span>移出</span>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      }
      onHide={(evt) => {
        Props.onHide && Props.onHide(evt);
      }}
    >
      {state.members.map((item) => memberItem(item))}
      <div className={styles['foot-cover']}></div>
    </MyOffCanvas>
  );
}
