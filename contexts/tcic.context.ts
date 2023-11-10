// import { createContext, useReducer } from 'react';

// export function contextFactory<S>(actions: any, defaultVal?: S) {
//   const Context = createContext<{
//     state: S;
//     dispatch: React.Dispatch<{ type: keyof typeof actions; arg?: any }>;
//   }>(null as any);
//   let myRducer = function (state: S, actionHandler: { type: keyof typeof actions }): S | Error {
//     console.log('Reducer,', state, actionHandler);
//     if (actions[actionHandler.type]) {
//       return actions[actionHandler.type](state as any, actionHandler as any) as any;
//     }
//     throw new Error(`传入了不存在的Action, ${String(actionHandler.type)}`);
//   };

//   let myProvider = function (props: any) {
//     const [state, dispatch]: [any, any] = useReducer<any>(myRducer, defaultVal);

//     return <Context.Provider value={{ state, dispatch }}>{props.children}</Context.Provider>;
//   };
//   return {
//     Provider: myProvider,
//     Context: Context,
//   };
// }
