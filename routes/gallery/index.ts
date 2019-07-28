import express from 'express';
import multer from "multer";
import upload_center from "./upload_center";

export default (db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/', (req, res) => {
        if (!req.session.sign) {
            res.redirect('/');
            return;
        }
        //res.redirect('reset_password');
        res.render('gallery');
    });
    router.use('/upload_center', upload_center(db, multer));
    return router;
};
