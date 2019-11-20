import * as likeAr from "like-ar";

export type ActionsFrom<TReducers, Name extends string = 'payload'> = {
    [K in keyof TReducers]: TReducers[K] extends (param1:infer U) => any ? {type:K} & {[x in Name]:U} : {type:K}
}[keyof TReducers];

export type ReturnsTheSameThatReceives<TReducers, Name extends string = 'payload'> = {
    [K in keyof TReducers]: TReducers[K] extends (param1:infer U) => any ? (param1:U) => {type:K} & {[x in Name]:U} : () => {type:K}
};

export type Reducer<TState, TPayload> = (payload:TPayload) => ((state:TState) => TState);

export type Reducers<TState, T> = {
    [TActionNames in keyof T] : Reducer<TState, T[TActionNames]>
}

export function createDispatchers<TState, T, TReducers extends Reducers<TState, T>>(reducers:TReducers){
    const dispatcher:ReturnsTheSameThatReceives<TReducers> = 
        // @ts-ignore hay un problema con likeAr.map
        likeAr<TReducers>(reducers).map(function(_:Reducer<TState, T>, name:string){
            // @ts-ignore hay un problema con likeAr.map
            return (payload)=>({type:name, payload: payload});
        }).plain();
    return dispatcher;
}

//export function createReducer<TState, T, TReducers extends Reducers<TState, T>>(reducers:TReducers, initialState:TState){
export function createReducer<TState, T, TReducers extends Reducers<TState, T>>(reducers:TReducers, initialState:TState){
    return function reducerFunction(state:TState = initialState, action: ActionsFrom<TReducers>){
        if(action.type in reducers){
            return reducers[action.type](
                // @ts-ignore payload debería existir siempre o ser undefined si no hay parámetros de la acción, lo cual no molesta
                action.payload
            )(state);
        }
        return {...state};
    }
}

