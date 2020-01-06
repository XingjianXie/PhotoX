import { exec } from "child_process";
import {promisify} from "util";

export default (db: (sql : string, values : any) => Promise<any>, root: string) => {
    return {
        run: async() => {
            console.log("restart_sever run")
            return "This is a callback script because reboot command has to be run after maintenance tag has been set to false.<br>"
                 + "The real result of reboot command is unknown but it is clear that the server has been restarted.<br>"
                 + "The website was started manually so that Mark Xie must connect to the sever and launch the node."
        },
        callback: async() => {
            console.log("restart_sever callback")
            await promisify(exec)("reboot")
        },
    }
}