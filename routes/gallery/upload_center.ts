import express from 'express';
import multer from "multer";
import sharp from "sharp";
import query from "../../db/query";
import createError from "http-errors";
import {mkdir, unlink} from "fs";
import * as util from "util";

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', (req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        res.render('upload_center');
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