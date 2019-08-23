import express from 'express';
import multer from "multer";
import sharp from "sharp";
import query from "../../db/query";
import createError from "http-errors";
import {mkdir, unlink} from "fs";
import * as util from "util";
import crypto from "crypto";
import path from "path";
const exif = require('exif-reader');

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs = !req.query.wd
            ? await db(query.queryUnPublishedPhotoWithLimit, [req.session.userID, (pg - 1) * maximum, maximum])
            : await db(query.searchUnPublishedPhotoWithLimit, [req.session.userID, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryUnPublishedPhotoWithLimit, [req.session.userID]))[0]['COUNT(*)']
            : (await db(query.countSearchUnPublishedPhotoWithLimit, [req.session.userID, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];


        if (!rs.length && total) {
            res.redirect("/gallery/upload_center?pg=" + Math.ceil(total / maximum).toString() + "&max=" + maximum.toString());
            return;
        }

        res.render('upload_center', {
            photos: rs,
            total: total,
            current: pg,
            maximum: maximum,
        });
    });
    router.post('/', multer.array("photo", 20), async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }

        if (!(req.files instanceof Array)) {
            throw req.files;
        }

        const t = await Promise.all(req.files.map(async(value) => {
            const bufs : any = [];
            value.stream.on('data', (d) => { bufs.push(d); });

            const buffer = await (new Promise<Buffer>(function (resolve, reject) {
                value.stream.on('end', () => {
                    resolve(Buffer.concat(bufs))
                });
            }));
            const photo_md5 = crypto.createHash('md5').update(buffer).digest('base64');
            try {
                const id = (await db(query.addPhoto, [req.session!.userID, photo_md5])).insertId;
                db(query.log, [req.session!.userID, "Photo", id, "Upload", true, null]);

                const t = sharp(buffer);
                const metadata = await t.metadata();
                if (!metadata.width) throw "Can't get the size";

                await t.withMetadata().toFile(path.join(req.app.get('root'), 'uploads', id + '.jpg'));
                await t.clone().resize(Math.min(metadata.width, 400)).toFile(path.join(req.app.get('root'), 'uploads', id + '.preview.jpg'));

                await db(query.convertPhoto, [metadata.height, metadata.width, exif(metadata.exif).exif.DateTimeOriginal ? exif(metadata.exif).exif.DateTimeOriginal.getTime()/1000 + (new Date()).getTimezoneOffset() * 60: null, id]);

                db(query.log, [req.session!.userID, "Photo", id, "Convert", true, null]);
                return "";
            } catch(err) {
                console.log(err);
                if (err.code === "ER_DUP_ENTRY") {
                    const rs = await db(query.getPhotoByMd5, [photo_md5]);
                    await db(query.addMessage, [
                        0,
                        req.session!.userID,
                        (
                            "The photo you uploaded has been uploaded by "+ rs[0].uploader_name + " (" + rs[0].uploader_id + "). " + "<br>"
                            + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
                        )
                    ]);
                    db(query.log, [req.session!.userID, "Photo", null, "Convert", false, null]);
                }

                return false;
            }
        }));
        res.send(t);

    });
    return router;
};