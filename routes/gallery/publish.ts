import express = require('express');
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0] || rs[0].type !== 1) {
            db(query.log, [req.session.userID, "Photo", Number(req.params.id), "Publish", false, "Error: Photo Not Found"]);
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (req.session.type <= rs[0].uploader_type && req.session.userID !== rs[0].uploader_id) {
            db(query.log, [req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        const category = await db(query.queryCategory, []);
        console.log(category);
        res.render('publish_photo', {
            category, p: rs[0]
        });
    });
    router.post('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0] || rs[0].type !== 1) {
            db(query.log, [req.session.userID, "Photo", Number(req.body.photoID), "Publish", false, "Error: Photo Not Found"]);
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (req.session.type <= rs[0].uploader_type && req.session.userID !== rs[0].uploader_id) {
            db(query.log, [req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.category || !req.body.name) {
            db(query.log, [req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Bad Request"]);
            next(createError(400, 'Type or Name Required'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Publish Confirmation',
                inf1: 'Are you sure to publish photo ' + rs[0].id.toString() + '?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION, AND YOU MAY NOT DELETE IT ONCE SOMEONE DOWNLOAD IT',
                data: data1
            });
            return;
        }

        //await db(query.deletePhoto, [rs[0].id]);

        //db(query.log, [req.session.userID, "Photo", rs[0].id, "Delete", true, null]);

        res.status(200);

    });

    return router;
};
