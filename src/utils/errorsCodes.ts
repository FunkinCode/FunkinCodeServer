enum UserAPIErrors {
    noUserID = 10001,
    userDontExists = 10002,
    invalidJsonUserUpdate = 10003,
    errorToUpdateUser = 10004,
}

enum AuthAPIErrors {
    noDiscordCode = 20001,
    invalidDiscordCode = 20002,
    errorCreatingToken = 20003,
    noPort = 20004,
    invalidToken = 20005,
    noToken = 20006,
}

enum ModAPIErrors {
    invalidVersionMod = 30001,
    noModID = 30002,
    modDontExists = 30003,
    invalidJsonModUpdate = 30004,
    errorToUpdateMod = 30005,
    errorToUploadMod = 30006,
    invalidURLMod = 30007,
}

export const APIErrors = {
    ...UserAPIErrors,
    ...AuthAPIErrors,
    ...ModAPIErrors
}