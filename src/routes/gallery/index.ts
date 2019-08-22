import express from 'express';
import multer from "multer";
import upload_center from "./upload_center";
import _delete from "./delete";
import publish from "./publish";
import recall from "./recall";
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
        const rs : any[] = !req.query.wd
            ? await db(query.queryPublishedPhotoWithLimit, [(pg - 1) * maximum, maximum])
            : await db(query.searchPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryPublishedPhotoWithLimit, []))[0]['COUNT(*)']
            : (await db(query.countSearchPublishedPhotoWithLimit, [req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];


        if (!rs.length && total) {
            res.redirect("/gallery?pg=" + Math.ceil(total / maximum).toString() + "&max=" + maximum.toString());
            return;
        }

        const mark = await Promise.all(rs.map((val) => {
            return db(query.getMarkByPhotoId, [val.id]);
        }));

        const download = await Promise.all(rs.map((val) => {
            return db(query.getDownloadByPhotoId, [val.id]);
        }));

        res.render('gallery', {
            photos: rs,
            faces: mark,
            downloads: download,
            total: total,
            current: pg,
            maximum: maximum,
            uploadsLength: (await db(query.countUnPublishedPhotoWithLimit, [req.session.userID]))[0]['COUNT(*)'],
        });
    });
    router.use('/upload_center', upload_center(db, multer));
    router.use('/publish', publish(db));
    router.use('/delete', _delete(db));
    router.use('/recall', recall(db));
    return router;
};
