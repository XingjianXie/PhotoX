import express = require('express');

export default (session_map : any) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
        session_map[req.session.userID] = undefined;
        req.session.destroy((err) => {
            if (err) throw err;
            res.clearCookie('session');
            res.redirect('/login');
        });
    });
    return router;
};
