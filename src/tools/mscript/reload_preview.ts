export default (db: (sql : string, values : any) => Promise<any>, root: string) => {
    return {
        run: async() => {
            console.log("reload_preview run")
        },
        callback: async() => {
            console.log("reload_preview callback")
        },
    }
}