enum UserAPIErrors {
    noUserID = 10001,
    userDontExists = 10002,
}

enum AuthAPIErrors {
    noDiscordCode = 20001,
    invalidDiscordCode = 20002,
    errorCreatingToken = 20003,
    noPort = 20004,
    invalidToken = 20005,
}

export const APIErrors = {
    ...UserAPIErrors,
    ...AuthAPIErrors
}

