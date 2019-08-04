import express = require('express');
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const rs = await db(query.getPhotoById, [Number(req.body.photoID)]);
        const dw = await db(query.getDownloadByPhotoId, [Number(req.body.photoID)]);
        if (!rs[0]) {
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (req.session.type <= rs[0].uploader_type && ( req.session.userID !== rs[0].uploader_id || dw.length)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Delete Confirmation',
                inf1: 'Are you sure to delete photo ' + req.body.photoID + '?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }

        await db(query.deletePhoto, [Number(req.body.photoID)]);
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
