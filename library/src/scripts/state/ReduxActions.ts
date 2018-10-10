/**
 * @author Adam (charrondev) Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license Proprietary
 */

import { IApiError, IApiResponse } from "@library/@types/api";
import { AxiosResponse, AxiosInstance } from "axios";

/**
 * Base class for creating redux actions.
 */
export default class ReduxActions {
    /**
     * Utility to create an action with our a without a payload of a given type.
     * The action generated can have its type narrowed in a reducer switch statement if the type T matches.
     *
     * @see ActionsUnion
     *
     * @param type The action type.
     * @param payload The payload data.
     */
    public static createAction<ActionType extends string>(type: ActionType): IAction<ActionType>;
    public static createAction<ActionType extends string, Payload>(
        type: ActionType,
        payload: Payload,
    ): IActionWithPayload<ActionType, Payload>;
    public static createAction<ActionType extends string, Payload>(type: ActionType, payload?: Payload) {
        return payload === undefined ? { type } : { type, payload };
    }

    /**
     * Create request, response, and error action creators.
     *
     * The dummy types are needed because typescript currently requires all generic types to be specified or all to be inferred. They cannot currently be mixed.
     *
     * @see https://github.com/Microsoft/TypeScript/issues/10571#issuecomment-345402872
     *
     * @param requestType The string for the request type. This should be a unique constant.
     * @param successType The string for the success type. This should be a unique constant.
     * @param errorType The string for the error type. This should be a unique constant.
     * @param dummyResponseType A placeholder to infer the type of the response. This isn't used for anything other than inferring a type.
     * @param dummyMetaType A placeholder to infer the type of the meta. This isn't used for anything other than inferringa  type.
     *
     * @example
     *
     * ```
     * const GET_THING_REQUEST = "GET_THING_REQUEST";
     * const GET_THING_SUCCESS = "GET_THING_SUCCESS";
     * const GET_THING_ERROR = "GET_THING_ERROR";
     * interface IThing { thing: string }
     * interface IThingOptions { page?: number }
     *
     * generateApiActionCreators(GET_THING_REQUEST, GET_THING_SUCCESS, GET_THING_ERROR, {} as IThing, {} as IThingOptions);
     * ```
     */
    public static generateApiActionCreators<
        RequestActionType extends string,
        SuccessActionType extends string,
        ErrorActionType extends string,
        ResponseDataType,
        Meta = any
    >(
        requestType: RequestActionType,
        successType: SuccessActionType,
        errorType: ErrorActionType,
        dummyResponseType?: ResponseDataType,
        dummyMetaType?: Meta,
    ): {
        request: (meta?: Meta) => IApiAction<RequestActionType, Meta>;
        success: (
            payload: IApiResponse<ResponseDataType>,
            meta?: Meta,
        ) => IApiSuccessAction<SuccessActionType, Meta, ResponseDataType>;
        error: (error: IApiError, meta?: Meta) => IApiErrorAction<ErrorActionType, Meta>;
    } {
        return {
            request: (meta: Meta) => ReduxActions.createApiRequestAction(requestType, meta),
            success: (response: IApiResponse<ResponseDataType>, meta: Meta) =>
                ReduxActions.createApiSuccessAction(successType, meta, response),
            error: (error: IApiError, meta: Meta) => ReduxActions.createApiErrorAction(errorType, meta, error),
        };
    }

    /**
     * Create an API request action. For use in createApiActions().
     *
     * @param type The action's type.
     * @param meta The type of the meta for the action.
     */
    private static createApiRequestAction<ActionType extends string, Meta>(
        type: ActionType,
        meta: Meta,
    ): IApiAction<ActionType, Meta> {
        return {
            type,
            meta,
        };
    }

    /**
     * Create an API error action. For use in createApiActions().
     *
     * @param type The action's type.
     * @param meta The type of the meta for the action.
     * @param error An API error.
     */
    private static createApiErrorAction<ActionType extends string, Meta>(
        type: ActionType,
        meta: Meta,
        error: IApiError,
    ): IApiErrorAction<ActionType, Meta> {
        return {
            type,
            meta,
            payload: error,
        };
    }

    /**
     * Create an API success action. For use in createApiActions().
     *
     * @param type The action's type.
     * @param meta The type of the meta for the action.
     * @param payload The shape of the IApiResponse data.
     */
    private static createApiSuccessAction<ActionType extends string, Meta, ResponseDataType>(
        type: ActionType,
        meta: Meta,
        payload: IApiResponse<ResponseDataType>,
    ): IApiSuccessAction<ActionType, Meta, ResponseDataType> {
        return {
            type,
            meta,
            payload,
        };
    }

    /**
     * Constructor for the redux actions.
     *
     * @param dispatch A redux dispatch function.
     * @param api An API instance.
     */
    constructor(protected dispatch: any, protected api: AxiosInstance) {}

    /**
     * Bind dispatch to an action creator.
     */
    protected bindDispatch = <T extends (...args) => void>(actionCreator: T): T => {
        return function() {
            return this.dispatch(actionCreator.apply(this, arguments));
        } as any;
    };

    /**
     * Generate a simple redux thunk for an API request using action creators.
     *
     * @param requestType The request method. Eg. post, patch, get, put.
     * @param endpoint The endpoint requested.
     * @param actionCreators Action creators generated from {@link ReduxActions.generateApiActionCreators()}
     * @param params A parameter object for the request. This will be serialized as a JSON body or query string.
     */
    protected async dispatchApi<T>(
        requestType: RequestType,
        endpoint: string,
        actionCreators: ReturnType<typeof ReduxActions.generateApiActionCreators>,
        params: any,
    ): Promise<AxiosResponse<T> | undefined> {
        this.dispatch(actionCreators.request(params));
        try {
            const response: AxiosResponse<T> = await this.api[requestType as any](endpoint, params);
            this.dispatch(actionCreators.success(response, params));
            return response;
        } catch (axiosError) {
            const error = axiosError.response ? axiosError.response.data : (axiosError as any);
            this.dispatch(actionCreators.error(error));
        }
    }
}

// Action interfaces
export interface IAction<T extends string> {
    type: T;
}

export interface IActionWithPayload<T extends string, P> extends IAction<T> {
    payload: P;
}

export interface IActionCreator<T extends string> {
    (): IAction<T>;
}

type FunctionType = (...args: any[]) => any;
interface IActionCreatorsMapObject {
    [actionCreator: string]: FunctionType;
}

// API Action interfaces
interface IApiAction<ActionType, Meta> {
    type: ActionType;
    meta: Meta;
}

interface IApiErrorAction<ActionType, Meta> extends IApiAction<ActionType, Meta> {
    payload: IApiError;
}

interface IApiSuccessAction<ActionType, Meta, ResponseDataType> extends IApiAction<ActionType, Meta> {
    payload: IApiResponse<ResponseDataType>;
}

type RequestType = "get" | "post" | "put" | "delete" | "patch";

// Utility to pull a group of action types out of an actions object
export type ActionsUnion<A extends IActionCreatorsMapObject> = ReturnType<A[keyof A]>;
