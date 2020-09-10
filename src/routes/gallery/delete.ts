import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import log from "../../tools/log";
import auth from "../../tools/auth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        const rs : any[] = await state.db(query.getPhotoById, [Number(req.body.photoID)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session!.userID, "Photo", Number(req.body.photoID), "Delete", false, "Error: Not Found");
            next(createError(404, 'Photo Not Found'));
            return;
        }
        const dw : any[] = await state.db(query.getDownloadByPhotoId, [Number(req.body.photoID)]);
        if (!(req.session!.type && res.locals.config.allow_admin_publish_others) && (req.session!.userID !== rs[0].uploader_id || (dw.length && !req.session!.type))) {
            log(res.locals.config, state.db, req.session!.userID, "Photo", rs[0].id, "Delete", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
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

        await state.db(query.deletePhoto, [rs[0].id]);
        await state.db(query.clearMark, [rs[0].id]);
        const recall_notification : any[] = await state.db(query.getDownloadByPhotoId, [rs[0].id]);
        for (const val of recall_notification) {
            await state.db(query.addSpPreview, [val.user, rs[0].id]);
            await state.db(query.addMessage, [0, val.user,
                (
                    "The photo you downloaded has been deleted by "+ req.session!.name + " (" + req.session!.userID + "). " + "<br>"
                    + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
                )
            ]);
        }
        await state.db(query.clearDownload, [rs[0].id]);
        await state.db(query.addSpPreview, [rs[0].uploader_id, rs[0].id]);
        await state.db(query.addMessage, [0, rs[0].uploader_id,
            (
                "The photo you uploaded has been deleted by "+ req.session!.name + " (" + req.session!.userID + "). " + "<br>"
                + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
            )
        ]);

        log(res.locals.config, state.db, req.session!.userID, "Photo", rs[0].id, "Delete", true, null);

        res.status(200);
        if (dw.length) {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Delete Successfully",
                inf: "The user download this photo will be noticed",
            });
        }
        else {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Delete Successfully",
            });
        }
    });

    return router;
};
