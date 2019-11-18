import * as likeAr from "like-ar";

type ReturnsTheSameThatReceives<T> = {
    [K in keyof T]: T[K] extends (param:infer U) => any ? (param:U) => U & {type:K} : never
}

type Reducer<TState, TPayload> = (payload:TPayload) => ((state:TState) => TState);

type Reducers<TState, TPayload, TActionNames extends string> = {
    [key in TActionNames] : Reducer<TState, TPayload>
}

type ActionsFrom<TPayload, TActionNames extends string> = {type:TActionNames, payload:TPayload};

export function createDispatchers<TState, TPayload, TActionNames extends string, T extends Reducers<TState, TPayload, TActionNames>>(actions:T){
    const dispatcher:ReturnsTheSameThatReceives<T> = 
        // @ts-ignore hay un problema con likeAr.map
        likeAr<T>(actions).map(function(_:Reducer<TState, TPayload>, name:string){
            return (payload:TPayload)=>({type:name, payload: payload});
        }).plain();
    return dispatcher;
}

export function createReducer<TState, TPayload, TActionNames extends string>(reducers:Reducers<TState, TPayload, TActionNames>, initialState:TState){
    return function reducerFunction(state:TState = initialState, action: ActionsFrom<TPayload, TActionNames>){
        if(action.type in reducers){
            return reducers[action.type](action.payload)(state);
        }
        return {...state};
    }
}


