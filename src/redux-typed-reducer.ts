import * as likeAr from "like-ar";

export type ReturnsTheSameThatReceives<T> = {
    [K in keyof T]: T[K] extends (param:infer U) => any ? (param:U) => U & {type:K} : {type:K}
}

export type Reducer<TState, TPayload> = (payload:TPayload) => ((state:TState) => TState);

export type Reducers<TState, T> = {
    [TActionNames in keyof T] : Reducer<TState, T[TActionNames]>
}

var dispatchOne = function <TState, T, TReducers extends Reducers<TState, T>>(reducers:TReducers, type:keyof TReducers){
    const dispatchers = createDispatchers<TState, T, TReducers>(reducers);
    const result = dispatchers[type];
    return result;
}

export type ActionsFrom2<TState, T, TReducers extends Reducers<TState, T>, TActionName extends keyof TReducers > = TReducers[TActionName];

export type ActionsFrom<TState, T, TReducers extends Reducers<TState, T>> = ReturnsTheSameThatReceives<TReducers>[keyof TReducers];

//    ReturnType<typeof dispatchOne<TState, T, TReducers>() >;

export function createDispatchers<TState, T, TReducers extends Reducers<TState, T>>(reducers:TReducers){
    const dispatcher:ReturnsTheSameThatReceives<TReducers> = 
        // @ts-ignore hay un problema con likeAr.map
        likeAr<TReducers>(reducers).map(function(_:Reducer<TState, T>, name:string){
            // @ts-ignore hay un problema con likeAr.map
            return (payload)=>({type:name, payload: payload});
        }).plain();
    return dispatcher;
}

export function createReducer<TState, T, TReducers extends Reducers<TState, T>>(reducers:TReducers, initialState:TState){
    return function reducerFunction(state:TState = initialState, action: ActionsFrom<TState, T, TReducers>){
        if(action.type in reducers){
            return reducers[action.type](action.payload)(state);
        }
        return {...state};
    }
}

