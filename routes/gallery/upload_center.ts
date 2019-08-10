import express from 'express';
import multer from "multer";
import sharp from "sharp";
import query from "../../db/query";
import createError from "http-errors";
import {mkdir, unlink} from "fs";
import * as util from "util";

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
            ? await db(query.queryUnPublishedPhotoWithLimit, [req.session.type, req.session.userID, (pg - 1) * maximum, maximum])
            : await db(query.searchUnPublishedPhotoWithLimit, [req.session.type, req.session.userID, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryUnPublishedPhotoWithLimit, [req.session.type, req.session.userID]))[0]['COUNT(*)']
            : (await db(query.countSearchUnPublishedPhotoWithLimit, [req.session.type, req.session.userID, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];


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
            const id = (await db(query.addPhoto, [req.session!.userID])).insertId;
            db(query.log, [req.session!.userID, "Photo", id, "Upload", true, null]);
            try {
                const bufs : any[] = [];
                value.stream.on('data', (d) => { bufs.push(d); });

                const rs = await (new Promise<Buffer>(function (resolve, reject) {
                    value.stream.on('end', () => {
                        resolve(Buffer.concat(bufs))
                    });
                }));

                const t = sharp(rs);
                const metadata = await t.metadata();
                if (!metadata.width) throw "Can't get the size";

                await t.toFile('public/uploads/' + id + '.png');
                await t.resize(Math.min(metadata.width, 800)).toFile('public/uploads/' + id + '.preview.png');

                //console.log(t);

                await db(query.convertPhoto, [id]);
                db(query.log, [req.session!.userID, "Photo", id, "Convert", true, null]);
                return true;
            } catch(err) {
                db(query.log, [req.session!.userID, "Photo", id, "Convert", false, null]);
                return false;
            }
        }));

        res.send(t);
    });
    return router;
};