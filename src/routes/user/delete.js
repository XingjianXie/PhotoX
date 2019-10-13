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
exports.default = (function (session_map, db) {
    var router = express_1.default.Router();
    router.post('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var rs, data1, userID;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session || !req.session.sign || !req.session.type) {
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (isNaN(Number(req.body.userID))) {
                        next(http_errors_1.default(400, 'User ID Should Be A Number'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.getUserById, [Number(req.body.userID)])];
                case 1:
                    rs = _a.sent();
                    if (!rs[0]) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", Number(req.body.userID), "Delete", false, "Error: Not Found");
                        next(http_errors_1.default(404, 'User Not Found'));
                        return [2 /*return*/];
                    }
                    if (req.session.type <= rs[0].type && req.session.userID !== Number(req.body.userID)) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Delete", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (rs[0].type === 127) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Delete", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (res.locals.config.disable_admin_delete_user) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Delete", false, "Error: Disabled");
                        next(http_errors_1.default(401, 'Disabled'));
                        return [2 /*return*/];
                    }
                    if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
                        data1 = req.body;
                        data1.confirm = '0';
                        if (req.session.userID === Number(req.body.userID))
                            res.render('confirm', {
                                msg: 'Delete Confirmation',
                                inf1: 'Are you sure to delete your own user?',
                                inf2: res.locals.config.completely_delete_user ?
                                    'YOU MAY NOT UNDO THIS ACTION: PHOTO ON IT\'S UPLOAD CENTER WILL BE GONE' :
                                    'YOU MAY NOT UNDO THIS ACTION: YOU MAY NOT USE ITS PHONE NUMBER TO SIGN UP',
                                data: data1
                            });
                        else
                            res.render('confirm', {
                                msg: 'Delete Confirmation',
                                inf1: 'Are you sure to delete ' + res.locals.typeName[rs[0].type] + ' ' + rs[0].name + ' (' + rs[0].id + ')?',
                                inf2: res.locals.config.completely_delete_user ?
                                    'YOU MAY NOT UNDO THIS ACTION: PHOTO ON IT\'S UPLOAD CENTER WILL BE GONE' :
                                    'YOU MAY NOT UNDO THIS ACTION: YOU MAY NOT USE ITS PHONE NUMBER TO SIGN UP',
                                data: data1
                            });
                        return [2 /*return*/];
                    }
                    userID = req.session.userID;
                    return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = req.sessionStore).destroy;
                                        return [4 /*yield*/, session_map[rs[0].id]];
                                    case 1:
                                        _b.apply(_a, [(_c.sent()), function (err) {
                                                if (err)
                                                    reject(err);
                                                else
                                                    resolve();
                                            }]);
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    session_map[rs[0].id] = undefined;
                    return [4 /*yield*/, db(res.locals.config.completely_delete_user ? query_1.default.deleteUserC : query_1.default.deleteUser, [rs[0].id])];
                case 3:
                    _a.sent();
                    log_1.default(res.locals.config, db, userID, "User", rs[0].id, "Delete", true, null);
                    if (rs[0].id === userID) {
                        res.render('notification', {
                            code: 200,
                            msg: "Delete Successfully",
                            inf: "Your account is deleted",
                            home: true
                        });
                    }
                    else {
                        res.render('notification', {
                            code: 200,
                            msg: "Delete Successfully",
                            inf: "The user just deleted will be logout",
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    return router;
});
