import express from 'express';
import upload_center from "./upload_center";
import download from "./download";
import unuse from "./unuse";
import category from "./category";
import query from '../../db/query';
import auth from "../../tools/api/auth";
import xauth from "../../tools/api/xauth";
import StateObject from "../../class/state_object";
import createError from "http-errors";
import log from "../../tools/api/log";
import publish from './publish';
import recall from './recall';
import _delete from './delete';

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 20, 1);
        const cur_category = Number(req.query.category) || 0;
        let rs : any[], total : number;
        if (cur_category) {
            rs = !req.query.wd
                ? await state.db(query.queryPublishedPhotoWithLimitSpecificCategory, [cur_category, (pg - 1) * maximum, maximum])
                : await state.db(query.searchPublishedPhotoWithLimitSpecificCategory, [req.query.wd, req.query.wd, req.query.wd, req.query.wd, cur_category, (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await state.db(query.countQueryPublishedPhotoWithLimitSpecificCategory, [cur_category]))[0]['COUNT(*)']
                : (await state.db(query.countSearchPublishedPhotoWithLimitSpecificCategory, [req.query.wd, req.query.wd, req.query.wd, req.query.wd, cur_category]))[0]['COUNT(DISTINCT photo.id)'];
        } else {
            rs = !req.query.wd
                ? await state.db(query.queryPublishedPhotoWithLimit, [(pg - 1) * maximum, maximum])
                : await state.db(query.searchPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await state.db(query.countQueryPublishedPhotoWithLimit, []))[0]['COUNT(*)']
                : (await state.db(query.countSearchPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(DISTINCT photo.id)'];
        }


        if (!rs.length && total) {
            res.json({
                code: 416,
                total: total,
            });
            return;
        }


        const t = await Promise.all(rs.map(async(val) => {
            return {
                photo: val,
                tag: await state.db(query.getMarkByPhotoId, [val.id]),
                usage: (await state.db(query.getDownloadByPhotoId, [val.id]))[0] ?? null,
                downloaded: !!(await state.db(query.isDownloadedByUser, [req.session.userID, val.id])).length
            };
        }));

        const category : any[] = await state.db(query.queryCategoryForQueryPhoto, []);

        res.json({
            code: 200,
            content: t,
            total: total,
        });
    });

    //router.use(xauth("sign"))
    router.use('/upload_center', upload_center(state));
    router.use('/publish', publish(state));
    router.use('/delete', _delete(state));
    router.use('/recall', recall(state));
    router.use('/download', download(state));
    router.use('/unuse', unuse(state));

    router.use(xauth("admin"));
    router.use('/category', category(state));

    return router;
};
