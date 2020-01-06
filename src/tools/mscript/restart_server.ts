import { exec } from "child_process";
import {promisify} from "util";

export default (db: (sql : string, values : any) => Promise<any>) => {
    return {
        run: async() => {
            console.log("restart_sever run")
        },
        callback: async() => {
            console.log("restart_sever callback")
            return await promisify(exec)("reboot")
        },
    }
}