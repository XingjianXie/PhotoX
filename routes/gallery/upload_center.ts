import express from 'express';
import multer from "multer";

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', (req, res) => {
        if (!req.session.sign) {
            res.redirect('/');
            return;
        }
        res.render('upload_center');
    });
    return router;
};

