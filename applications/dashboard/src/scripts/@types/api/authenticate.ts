/**
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import { IUserFragment } from "@dashboard/@types/api";

export interface IUserAuthenticator {
    authenticatorID: string;
    type: string;
    isUnique: boolean;
    name: string;
    ui: {
        url: string;
        buttonName: string;
        photoUrl: string | null;
        backgroundColor: string | null;
        foregroundColor: string | null;
    };
    isUserLinked?: boolean;
    sso?: any;
}

export const enum AuthenticationStep {
    AUTHENTICATED = "authenticated",
    LINK_USER = "linkUser",
}

export interface IAuthenticateResponse {
    authenticationStep: AuthenticationStep;
    user?: IUserFragment;
    authSessionID?: string;
    targetUrl?: string;
}

export interface IAuthenticatePasswordParams {
    username: string;
    password: string;
    persist?: boolean;
}

export interface IAuthenticatePasswordResponseData extends IUserFragment {}