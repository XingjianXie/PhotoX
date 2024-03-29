import express from 'express';
import query from "../../db/query";
import path from "path"
import createError from "http-errors";
import log from "../../tools/log";
import auth from "../../tools/auth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/:id', async(req, res, next) => {
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        const rs : any[] = await state.db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0]) {
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (rs[0].type !== 2) {
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (!(await state.db(query.isDownloadedByUser, [req.session.userID, rs[0].id])).length) {
            await state.db(query.addDownload, [req.session.userID, rs[0].id]);
            await state.db(query.addMessage, [0, rs[0].uploader_id,
                (
                    "The photo you uploaded has been downloaded by "+ req.session.name + " (" + req.session.userID + "). " + "<br>"
                    + '<div class="bkimg rounded" style="width: 200px; background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
                )
            ]);
            log(res.locals.config, state.db, req.session.userID, "Photo", rs[0].id, "Download", true, null);
        }
        res.send((await state.db(query.isDownloadedByUser, [req.session.userID, rs[0].id]))[0].uuid);
    });
    return router;
};
