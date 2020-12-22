import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import log from "../../tools/api/log";
import auth from "../../tools/auth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        const rs : any[] = await state.db(query.getPhotoById, [Number(req.body.photoID)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session!.userID, "Photo", Number(req.body.photoID), "Recall", false, "Error: Not Found");
            next(createError(404, 'Photo Not Found'));
            return;
        }
        const dw : any[] = await state.db(query.getDownloadByPhotoId, [Number(req.body.photoID)]);
        if (!req.session!.type && (req.session!.userID !== rs[0].uploader_id)) {
            log(res.locals.config, state.db, req.session!.userID, "Photo", rs[0].id, "Recall", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }

        await state.db(query.recallPhoto, [rs[0].id]);
        await state.db(query.clearMark, [rs[0].id]);
        const recall_notification : any[] = await state.db(query.getDownloadByPhotoId, [rs[0].id]);
        for (const val of recall_notification) {
            await state.db(query.addSpPreview, [val.user, rs[0].id]);
            await state.db(query.addMessage, [0, val.user,
                (
                    "The photo you downloaded has been recalled by "+ req.session!.name + " (" + req.session!.userID + "). " + "<br>"
                    + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
                )
            ]);
        }
        await state.db(query.clearDownload, [rs[0].id]);
        await state.db(query.addSpPreview, [rs[0].uploader_id, rs[0].id]);
        await state.db(query.addMessage, [0, rs[0].uploader_id,
            (
                "The photo you uploaded has been recalled by "+ req.session!.name + " (" + req.session!.userID + "). " + "<br>"
                + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
            )
        ]);

        log(res.locals.config, state.db, req.session!.userID, "Photo", rs[0].id, "Recall", true, null);

        if (dw.length) {
            res.json({
                code: 200,
                msg: "Recall Successfully",
                inf: "The user download this photo will be noticed",
            });
        }
        else {
            res.json({
                code: 200,
                msg: "Recall Successfully",
            });
        }
    });

    return router;
};
