import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const rs = await db(query.getPhotoById, [Number(req.body.photoID)]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "Photo", Number(req.body.photoID), "Recall", false, "Error: Photo Not Found"]);
            next(createError(404, 'Photo Not Found'));
            return;
        }
        const dw = await db(query.getDownloadByPhotoId, [Number(req.body.photoID)]);
        if (req.session.type <= rs[0].uploader_type && (req.session.userID !== rs[0].uploader_id || (dw.length && !req.session.type))) {
            db(query.log, [req.session.userID, "Photo", rs[0].id, "Recall", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Recall Confirmation',
                inf1: 'Are you sure to recall photo ' + rs[0].id.toString() + '?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }

        await db(query.recallPhoto, [rs[0].id]);

        db(query.log, [req.session.userID, "Photo", rs[0].id, "Recall", true, null]);

        res.status(200);
        if (dw.length) {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Recall Successfully",
                inf: "The user download this photo will be noticed",
            });
        }
        else {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Recall Successfully",
            });
        }
    });

    return router;
};
