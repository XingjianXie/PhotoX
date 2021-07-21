import express from 'express';
import upload_center from "./upload_center";
import _delete from "./delete";
import publish from "./publish";
import recall from "./recall";
import download from "./download";
import unuse from "./unuse";
import category from "./category";
import query from '../../db/query';
import auth from "../../tools/auth";
import xauth from "../../tools/xauth";
import StateObject from "../../class/state_object";

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
            res.redirect("/gallery?pg=" + Math.ceil(total / maximum).toString() + "&max=" + maximum.toString());
            return;
        }


        const t = await Promise.all(rs.map(async(val) => {
            return {
                face: await state.db(query.getMarkByPhotoId, [val.id]),
                download: await state.db(query.getDownloadByPhotoId, [val.id]),
                vd: !!(await state.db(query.isDownloadedByUser, [req.session.userID, val.id])).length
            };
        }));

        const category : any[] = await state.db(query.queryCategoryForQueryPhoto, []);

        res.render('gallery', {
            photos: rs,
            mdata: t,
            total: total,
            current: pg,
            maximum: maximum,
            uploadsLength: (await state.db(query.countUnPublishedPhoto, [req.session.userID]))[0]['COUNT(*)'],
            category: category,
            cur_category: cur_category,
            wd: req.query.wd
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
