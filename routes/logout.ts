import express = require('express');

export default (session_map : any) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        session_map[req.session.userID] = undefined;
        req.session.destroy((err) => {
            if (err) throw err;
            res.clearCookie('session');
            res.redirect('/login');
        });
    });
    return router;
};
