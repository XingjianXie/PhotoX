import express from 'express';
import multer from "multer";
import upload_center from "./upload_center";
import _delete from "./delete";
import publish from "./publish";
import query from '../../db/query';

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
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
    router.use('/upload_center', upload_center(db, multer));
    router.use('/publish', publish(db));
    router.use('/delete', _delete(db));
    return router;
};
