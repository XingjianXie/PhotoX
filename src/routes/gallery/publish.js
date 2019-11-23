"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var query_1 = __importDefault(require("../../db/query"));
var http_errors_1 = __importDefault(require("http-errors"));
var log_1 = __importDefault(require("../../tools/log"));
exports.default = (function (db) {
    var router = express_1.default.Router();
    router.get('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var rs, category;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session || !req.session.sign) {
                        res.redirect('/');
                        return [2 /*return*/];
                    }
                    if (isNaN(Number(req.params.id))) {
                        next(http_errors_1.default(400, 'Photo ID Should Be A Number'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.getPhotoById, [Number(req.params.id)])];
                case 1:
                    rs = _a.sent();
                    if (!rs[0] || rs[0].type !== 1) {
                        log_1.default(res.locals.config, db, req.session.userID, "Photo", Number(req.params.id), "Publish", false, "Error: Not Found");
                        next(http_errors_1.default(404, 'Photo Not Found'));
                        return [2 /*return*/];
                    }
                    if (!(req.session.type && res.locals.config.allow_admin_publish_others) && req.session.userID !== rs[0].uploader_id) {
                        log_1.default(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.queryCategoryForQueryPhoto, [])];
                case 2:
                    category = _a.sent();
                    res.render('publish_photo', {
                        category: category, p: rs[0]
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    router.post('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var rs, data1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session || !req.session.sign) {
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (isNaN(Number(req.params.id))) {
                        next(http_errors_1.default(400, 'Photo ID Should Be A Number'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.getPhotoById, [Number(req.params.id)])];
                case 1:
                    rs = _a.sent();
                    if (!rs[0] || rs[0].type !== 1) {
                        log_1.default(res.locals.config, db, req.session.userID, "Photo", Number(req.body.photoID), "Publish", false, "Error: Not Found");
                        next(http_errors_1.default(404, 'Photo Not Found'));
                        return [2 /*return*/];
                    }
                    if (!(req.session.type && res.locals.config.allow_admin_publish_others) && req.session.userID !== rs[0].uploader_id) {
                        log_1.default(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (!req.body.category || !req.body.name) {
                        log_1.default(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", false, "Error: Bad Request");
                        next(http_errors_1.default(400, 'Type or Name Required'));
                        return [2 /*return*/];
                    }
                    if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
                        data1 = req.body;
                        data1.confirm = '0';
                        res.render('confirm', {
                            msg: 'Publish Confirmation',
                            inf1: 'Are you sure to publish photo ' + rs[0].id.toString() + '?',
                            inf2: (req.session.type ? '' : 'YOU MAY NOT UNDO THIS ACTION ONCE SOMEONE DOWNLOAD IT'),
                            data: data1
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.publishPhoto, [req.body.name, req.body.category, rs[0].id])];
                case 2:
                    _a.sent();
                    log_1.default(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Publish", true, null);
                    i = 1;
                    _a.label = 3;
                case 3:
                    if (!(i <= 10)) return [3 /*break*/, 6];
                    if (!req.body['mark' + i.toString()])
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, db(query_1.default.addMark, [rs[0].id, req.body['mark' + i.toString()]])];
                case 4:
                    _a.sent();
                    log_1.default(res.locals.config, db, req.session.userID, "Photo", rs[0].id, "Assign to Face", true, 'Face: ' + req.body['mark' + i.toString()]);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    res.status(200);
                    res.render('notification', {
                        code: 200,
                        msg: "Publish Successfully",
                        bk2: true
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    return router;
});
