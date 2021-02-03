declare module '@ndustrial/contxt-sdk' {
    type sdkConstructorOptions = {
        config: {
            auth: {
                clientId: String
            }
        },
        sessionType: String
    }
    
    class ContxtSdk {
        constructor(options: sdkConstructorOptions)

        facilities: {
            getAll: () => Promise<[]>
        }
    }

    export = ContxtSdk;
}

