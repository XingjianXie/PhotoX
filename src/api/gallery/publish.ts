import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import log from "../../tools/api/log";
import auth from "../../tools/auth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.post('/:id', async(req, res, next) => {
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        const rs : any[] = await state.db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0] || rs[0].type !== 1) {
            log(res.locals.config, state.db, req.session.userID, "Photo", Number(req.body.photoID), "Publish", false, "Error: Not Found");
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (!res.locals.config.allow_publish_others && req.session.userID !== rs[0].uploader_id) {
            log(res.locals.config, state.db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.category || !req.body.name) {
            log(res.locals.config, state.db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Bad Request");
            next(createError(400, 'Category or Name Required'));
            return;
        }

        await state.db(query.publishPhoto, [req.body.name, req.body.category, rs[0].id]);
        log(res.locals.config, state.db, req.session.userID, "Photo", rs[0].id, "Publish", true, null);

        for (let i = 1; i <= 10; i++) {
            if (!req.body['mark' + i.toString()]) break;
            await state.db(query.addMark, [rs[0].id, req.body['mark' + i.toString()]]);
            log(res.locals.config, state.db, req.session.userID, "Photo", rs[0].id, "Assign to Face", true, 'Face: ' + req.body['mark' + i.toString()]);
        }

        res.json({
            code: 200,
            msg: "Publish Successfully",
        });
    });

    return router;
};
