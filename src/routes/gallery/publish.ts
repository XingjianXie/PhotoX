import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import log from "../../tools/log";

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
        const rs : any[] = await db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0] || rs[0].type !== 1) {
            log(res.locals.config, db, req.session.userID, "Photo", Number(req.params.id), "Publish", false, "Error: Not Found");
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (!(req.session.type && res.locals.config.allow_admin_publish_others) && req.session.userID !== rs[0].uploader_id) {
            log(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        const category : any[] = await db(query.queryCategoryForQueryPhoto, []);
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
        const rs : any[] = await db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0] || rs[0].type !== 1) {
            log(res.locals.config, db, req.session.userID, "Photo", Number(req.body.photoID), "Publish", false, "Error: Not Found");
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (!(req.session.type && res.locals.config.allow_admin_publish_others) && req.session.userID !== rs[0].uploader_id) {
            log(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.category || !req.body.name) {
            log(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Bad Request");
            next(createError(400, 'Type or Name Required'));
            return;
        }
        if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Publish Confirmation',
                inf1: 'Are you sure to publish photo ' + rs[0].id.toString() + '?',
                inf2: (req.session.type ? '' : 'YOU MAY NOT UNDO THIS ACTION ONCE SOMEONE DOWNLOAD IT'),
                data: data1
            });
            return;
        }

        await db(query.publishPhoto, [req.body.name, req.body.category, rs[0].id]);
        log(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", true, null);

        for (let i = 1; i <= 10; i++) {
            if (!req.body['mark' + i.toString()]) break;
            await db(query.addMark, [rs[0].id, req.body['mark' + i.toString()]]);
            log(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Assign to Face", true, 'Face: ' + req.body['mark' + i.toString()]);
        }

        res.status(200);
        res.render('notification', {
            code: 200,
            msg: "Publish Successfully",
            bk2: true
        });
    });

    return router;
};
