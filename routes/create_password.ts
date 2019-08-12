import express from 'express';
import {create as ps_create} from "../tools/password";

export default () => {
    const router = express.Router();
    router.get('/', (req, res) => {
        if (!(req.app.get('env') === 'development')) {
            res.redirect('/');
            return;
        }
        const f = ps_create(req.query.q);
        res.send(
            "Password: " + req.query.q + "<br>"
            + "Key1: " + f[0] + "<br>"
            + "Key2: " + f[1] + "<br>"
        );
    });
    return router;
};
