import express from 'express';
import query from "../../../db/query";
import createError from "http-errors";
import log from "../../../tools/api/log";
import StateObject from "../../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.use('/:id', async(req, res, next) => {
        if (isNaN(Number(req.params.id)) || Number(req.params.id) === 0) {
            next(createError(400, 'Category ID Should Be A Nonzero Number'));
            return;
        }
        if (!req.body.name) {
            log(res.locals.config, state.db, req.session.userID, "Category", Number(req.params.id), "Edit", false, "Error: Bad Request");
            next(createError(400, 'Name Required'));
            return;
        }
        let rs = await state.db(query.getCategoryById, [Number(req.params.id)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session.userID, "Category", Number(req.params.id), "Edit", false, "Error: Not Found");
            next(createError(404, 'Category Not Found'));
            return;
        }
        if (req.session.type <= rs[0].owner_type && req.session.userID !== Number(rs[0].owner)) {
            log(res.locals.config, state.db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_edit_category) {
            log(res.locals.config, state.db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Disabled");
            next(createError(400, 'Disabled'));
            return;
        }
        try {
            await state.db(query.updateCategory, [req.body.name, rs[0].id]);
            log(res.locals.config, state.db, req.session.userID, "Category", rs[0].id, "Edit", true, null);
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                log(res.locals.config, state.db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Exists");
                next(createError(400, 'Category Name ' + req.body.name + ' Exists'));
            } else throw e;
            return
        }
        res.json({
            code: 200,
            msg: "Update Successfully",
        });
    });

    return router;
};
