import express from 'express';
import multer from "multer";
import sharp from "sharp";
import {unlink} from "fs";
import * as util from "util";
import query from "../../db/query";

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', (req, res) => {
        if (!req.session.sign) {
            res.redirect('/');
            return;
        }
        res.render('upload_center');
    });
    router.post('/', multer.array("photo", Infinity), async(req, res) => {
        if (!(req.files instanceof Array)) {
            throw req.files;
        }

        const t = await Promise.all(Array.from(req.files.map(async(value) => {
            await db(query.addPhoto, [req.session.userID]);
            try {
                const path = 'public/uploads/' + value.filename + '.png';
                await sharp(value.path).toFile(path);
                await util.promisify(unlink)(value.path);
                await db(query.updatePhoto, [path]);
                return true;
            } catch {
                return false;
            }
        })));

        res.send(t);
    });
    return router;
};