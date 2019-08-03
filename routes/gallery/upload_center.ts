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
        const maximum = Math.max(Number(req.query.max) || 20, 1);
        const rs = await db(query.queryUnPublishedPhotoWithLimit, [req.session.type,  (pg - 1) * maximum, maximum]);
        const total = (await db(query.countQueryUnPublishedPhotoWithLimit, [req.session.type]))[0]['COUNT(*)'];


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
    router.post('/', multer.array("photo", Infinity), async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }

        if (!(req.files instanceof Array)) {
            throw req.files;
        }

        const t = await Promise.all(req.files.map(async(value) => {
            const id = (await db(query.addPhoto, [req.session!.userID])).insertId;
            try {
                const bufs : any[] = [];
                value.stream.on('data', (d) => { bufs.push(d); });

                const rs = await (new Promise<Buffer>(function (resolve, reject) {
                    value.stream.on('end', () => {
                        resolve(Buffer.concat(bufs))
                    });
                }));

                await sharp(rs).toFile('public/uploads/' + id + '.png');
                await db(query.updatePhoto, [id]);
                return true;
            } catch(err) {
                return false;
            }
        }));

        res.send(t);
    });
    return router;
};