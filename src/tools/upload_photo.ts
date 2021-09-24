import query from "../db/query";
import crypto from "crypto";
import log from "./log";
import sharp from "sharp";
import path from "path";
const exif = require('exif-reader');

export default async(config: any, db: (sql : string, values : any) => Promise<any>, files: Express.Multer.File[], userID: number, root: string) => {
    return await Promise.all(files.map(async(value) => {

        /*
	const buffer = await (new Promise<Buffer>(function (resolve, reject) {
            value.stream.on('end', () => {
                resolve(Buffer.concat(bufs))
            });
	}));
	*/
	const buffer = value.buffer;
        const photo_md5 = config.disable_photo_md5 ? null
            : crypto.createHash('md5').update(buffer).digest('base64');
        try {
            const id : number = (await db(query.addPhoto, [userID, photo_md5])).insertId;
            log(config, db, userID, "Photo", id, "Upload", true, null)

            const t = sharp(buffer);
            const metadata = await t.metadata();
            if (!metadata.width) throw "Can't get the size";

            await t.clone().resize(Math.min(metadata.width, 1000)).rotate().toFile(path.join(root, 'uploads', id + '.preview.jpg'));
            await t.withMetadata().toFile(path.join(root, 'uploads', id + '.jpg'));

            await db(query.convertPhoto, [
                (!metadata.orientation || (metadata.orientation >= 1 && metadata.orientation <= 4)) ? metadata.height : metadata.width,
                (!metadata.orientation || (metadata.orientation >= 1 && metadata.orientation <= 4)) ? metadata.width : metadata.height,
                metadata.exif && exif(metadata.exif).exif.DateTimeOriginal ? exif(metadata.exif).exif.DateTimeOriginal.getTime()/1000 + (new Date()).getTimezoneOffset() * 60: null, id]
            );

            log(config, db, userID, "Photo", id, "Convert", true, null);
            return true;
        } catch(err) {
            if (err.code === "ER_DUP_ENTRY") {
                const rs : any[] = await db(query.getPhotoByMd5, [photo_md5]);
                await db(query.addSpPreview, [userID, rs[0].id]);
                await db(query.addMessage, [
                    0,
                    userID,
                    (
                        "The photo you uploaded exists in the system" + (rs[0].type !==2 ? "(but not published) " : "") + ", uploaded by "+ rs[0].uploader_name + " (" + rs[0].uploader_id + "). " + "<br>"
                        + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
                    )
                ]);
                log(config, db, userID, "Photo", null, "Convert", false, null);
            }

            return false;
        }
    }));
}
