import {promisify} from "util";
import query from "../../db/query";
import fs from "fs"
import path from "path"

export default (db: (sql : string, values : any) => Promise<any>, root: string) => {
    return {
        run: async() => {
            const photos = await db(query.allDeletedPhoto, []);
            let res: string[] = []
            for (const photo of photos) {
                await promisify(fs.unlink)(path.join(root, 'uploads', photo.id + '.jpg')).then(
                    () => {
                        res.push("Processing deleted photo " + photo.name + " (" + photo.id + "), finished.")
                    }
                ).catch(
                    (err) => {
                        res.push("Processing deleted photo " + photo.name + " (" + photo.id + "), skipped.")
                    }
                )
            }
            console.log("clean_up run")
            return res.join("<br>")
        },
        callback: async() => {
            console.log("clean_up callback")
        },
    }
}