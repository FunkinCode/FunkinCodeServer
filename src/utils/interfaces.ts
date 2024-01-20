export interface DiscordUserData {
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email: string | null;
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