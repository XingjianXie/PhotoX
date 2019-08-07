import express = require('express');
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
        const dw = await db(query.getDownloadByPhotoId, [Number(req.body.photoID)]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "Photo", Number(req.body.photoID), "Delete", false, "Reason: Photo Not Found"]);
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (req.session.type <= rs[0].uploader_type && ( req.session.userID !== rs[0].uploader_id || dw.length)) {
            db(query.log, [req.session.userID, "Photo", rs[0].id, "Delete", false, "Reason: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Delete Confirmation',
                inf1: 'Are you sure to delete photo ' + rs[0].id.toString() + '?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }

        await db(query.deletePhoto, [rs[0].id]);

        db(query.log, [req.session.userID, "Photo", rs[0].id, "Photo", true, null]);

        res.status(200);
        if (dw.length) {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Delete Successfully",
                inf: "The user download this photo will be noticed",
                home: true
            });
        }
        else {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Delete Successfully",
            });
        }
    });

    return router;
};
