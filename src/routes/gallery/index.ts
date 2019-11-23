import express from 'express';
import multer from "multer";
import upload_center from "./upload_center";
import _delete from "./delete";
import publish from "./publish";
import recall from "./recall";
import download from "./download";
import unuse from "./unuse";
import category from "./category/index"
import query from '../../db/query';

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 20, 1);
        const cur_category = Number(req.query.category) || 0;
        let rs : any[], total : number;
        if (cur_category) {
            rs = !req.query.wd
                ? await db(query.queryPublishedPhotoWithLimitSpecificCategory, [cur_category, (pg - 1) * maximum, maximum])
                : await db(query.searchPublishedPhotoWithLimitSpecificCategory, [req.query.wd, req.query.wd, req.query.wd, req.query.wd, cur_category, (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await db(query.countQueryPublishedPhotoWithLimitSpecificCategory, [cur_category]))[0]['COUNT(*)']
                : (await db(query.countSearchPublishedPhotoWithLimitSpecificCategory, [req.query.wd, req.query.wd, req.query.wd, req.query.wd, cur_category]))[0]['COUNT(DISTINCT photo.id)'];
        } else {
            rs = !req.query.wd
                ? await db(query.queryPublishedPhotoWithLimit, [(pg - 1) * maximum, maximum])
                : await db(query.searchPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await db(query.countQueryPublishedPhotoWithLimit, []))[0]['COUNT(*)']
                : (await db(query.countSearchPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(DISTINCT photo.id)'];
        }


        if (!rs.length && total) {
            res.redirect("/gallery?pg=" + Math.ceil(total / maximum).toString() + "&max=" + maximum.toString());
            return;
        }


        const t = await Promise.all(rs.map(async(val) => {
            return {
                face: await db(query.getMarkByPhotoId, [val.id]),
                download: await db(query.getDownloadByPhotoId, [val.id]),
                vd: !!(await db(query.isDownloadedByUser, [req.session!.userID, val.id])).length
            };
        }));

        const category : any[] = await db(query.queryCategoryForQueryPhoto, []);

        res.render('gallery', {
            photos: rs,
            mdata: t,
            total: total,
            current: pg,
            maximum: maximum,
            uploadsLength: (await db(query.countUnPublishedPhoto, [req.session.userID]))[0]['COUNT(*)'],
            category: category,
            cur_category: cur_category
        });
    });
    router.use('/upload_center', upload_center(db, multer));
    router.use('/publish', publish(db));
    router.use('/delete', _delete(db));
    router.use('/recall', recall(db));
    router.use('/download', download(db));
    router.use('/category', category(db));
    router.use('/unuse', unuse(db));
    return router;
};
