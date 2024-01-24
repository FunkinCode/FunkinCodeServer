import { Context as OldContext } from "https://deno.land/x/oak@v12.6.2/context.ts";
import { Request as OldRequest } from "https://deno.land/x/oak@v12.6.2/request.ts";
export interface DiscordUserData {
    discordId: string;
    username: string;
    displayname?: string;
    discriminator?: string;
    avatar?: string;
    email?: string;
    verified: boolean
    locale: string;
    flags: number;
    premium_type: number;
    mfa_enabled: boolean;
}

export interface UserData {
    ID: string;
    Username: string;
    DisplayUsername: string | undefined;
    AvatarURL: string | undefined;
    Flags: number;
    CreatedAt: Date;
}

export interface UsersDatabaseData extends UserData {
    _id?: string;
    Email: string | undefined;
    DiscordID: string | undefined;
    GithubID: string | undefined;
    LastUpdated: Date;
    Private: boolean;
}

export interface Request extends OldRequest {
    auth: boolean;
    user?: UsersDatabaseData;
    typeOfToken?: string;
}

export interface Context extends OldContext {
    request: Request;
}


export interface TokensInterface {
    ID: string;
    Token: string;
    Deleted: boolean;
}

export interface TokenPayloadInterface {
    ID: string;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
}

export interface UpdateAppUserData {
    DisplayUsername: string;
    Private: boolean;
    AvatarURL: string;
}