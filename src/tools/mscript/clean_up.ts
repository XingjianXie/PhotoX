import {promisify} from "util";

export default (db: (sql : string, values : any) => Promise<any>) => {
    return {
        run: async() => {
            console.log("clean_up run")
        },
        callback: async() => {
            console.log("clean_up run")
        },
    }
}