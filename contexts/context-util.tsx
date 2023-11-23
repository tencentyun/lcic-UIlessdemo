import { createContext, useEffect, useReducer } from "react";

/**
 *
 * 保留type关键字 “_init”
 * 用于处理初始化数据
 * @param actions
 * @param defaultVal
 * @returns
 */
export function contextFactory<
  S,
  T extends Record<
    string,
    (state: S, action: { type: any; arg?: any; state: S }) => S
  >
>(actions: T, opts?: { defaultVal?: S; jsxEL?: any }) {
  const Context = createContext<{
    state: S;
    dispatch: React.Dispatch<{ type: keyof typeof actions; arg?: any }>;
  }>(opts?.defaultVal as any);
  let myRducer = function (
    state: S,
    actionHandler: { type: keyof typeof actions; arg: any }
  ): S | Error {
    if (actionHandler.type === "_init") {
      return { ...actionHandler.arg };
    }
    if (actions[actionHandler.type]) {
      return actions[actionHandler.type](
        state as any,
        actionHandler as any
      ) as any;
    }
    throw new Error(`传入了不存在的Action, ${String(actionHandler.type)}`);
  };

  let myProvider = function (props: { children: any; state: S }) {
    const [state, dispatch]: [any, any] = useReducer<any>(
      myRducer,
      opts?.defaultVal
    );
    useEffect(() => {
      if (props.state) {
        dispatch({
          type: "_init",
          arg: props.state,
        });
      }
    }, [props]);

    let JSXEL = opts?.jsxEL;
    return (
      <Context.Provider value={{ state: state, dispatch }}>
        {props.children}
        {JSXEL ? <JSXEL data={state}></JSXEL> : undefined}
      </Context.Provider>
    );
  };
  return {
    Provider: myProvider,
    Context: Context,
  };
}
