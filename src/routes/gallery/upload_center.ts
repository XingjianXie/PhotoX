import express from 'express';
import multer from "multer";
import sharp from "sharp";
import query from "../../db/query";
import createError from "http-errors";
import {mkdir, unlink} from "fs";
import * as util from "util";
import crypto from "crypto";
import path from "path";
import log from "../../tools/log"
import upload_photo = require('../../tools/upload_photo');

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        let rs : any[], total : number;
        if (!req.query.others) {
            rs = await db(query.queryUnPublishedPhotoWithLimit, [req.session.userID, (pg - 1) * maximum, maximum]);
            total = (await db(query.countQueryUnPublishedPhotoWithLimit, [req.session.userID]))[0]['COUNT(*)'];
        } else {
            rs = !req.query.wd
                ? await db(query.queryOthersUnPublishedPhotoWithLimit, [ (pg - 1) * maximum, maximum])
                : await db(query.searchOthersUnPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await db(query.countQueryOthersUnPublishedPhotoWithLimit, []))[0]['COUNT(*)']
                : (await db(query.countSearchOthersUnPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];
        }


        if (!rs.length && total) {
            res.redirect("/gallery/upload_center?pg=" + Math.ceil(total / maximum).toString() + "&max=" + maximum.toString());
            return;
        }

        res.render(!req.query.others ? 'upload_center' : 'upload_center_others', {
            photos: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
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
        const t = await upload_photo(res.locals.config, db, req.files, req.session.userID, req.app.get("root"));
        res.send(t);
    });
    return router;
};