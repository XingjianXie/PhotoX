import express from 'express';
import sharp from "sharp";
import query from "../../db/query";
import createError from "http-errors";
import {mkdir, unlink} from "fs";
import * as util from "util";
import crypto from "crypto";
import path from "path";
import log from "../../tools/log"
import upload_photo from '../../tools/upload_photo';
import auth from "../../tools/auth";
import StateObject from "../../class/state_object";
import multer from "multer";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        let rs : any[], total : number;
        if (!req.query.others) {
            rs = await state.db(query.queryUnPublishedPhotoWithLimit, [req.session.userID, (pg - 1) * maximum, maximum]);
            total = (await state.db(query.countQueryUnPublishedPhotoWithLimit, [req.session.userID]))[0]['COUNT(*)'];
        } else {
            rs = !req.query.wd
                ? await state.db(query.queryOthersUnPublishedPhotoWithLimit, [ (pg - 1) * maximum, maximum])
                : await state.db(query.searchOthersUnPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await state.db(query.countQueryOthersUnPublishedPhotoWithLimit, []))[0]['COUNT(*)']
                : (await state.db(query.countSearchOthersUnPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];
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
    router.post('/', multer({limits: {fileSize: 1e8, files: 50}}).array("photo", 50), async(req, res, next) => {
        if (!(req.files instanceof Array)) {
            throw req.files;
        }
        const t = await upload_photo(res.locals.config, state.db, req.files, req.session.userID, req.app.get("root"));
        res.send(t);
    });
    return router;
};