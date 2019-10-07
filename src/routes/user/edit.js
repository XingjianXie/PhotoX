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
    router.get('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var rs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session || !req.session.sign || !req.session.type) {
                        res.redirect('/');
                        return [2 /*return*/];
                    }
                    if (isNaN(Number(req.params.id))) {
                        next(http_errors_1.default(400, 'User ID Should Be A Number'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.getUserById, [Number(req.params.id)])];
                case 1:
                    rs = _a.sent();
                    if (!rs[0]) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", Number(req.params.id), "Edit", false, "Error: Not Found");
                        next(http_errors_1.default(404, 'User Not Found'));
                        return [2 /*return*/];
                    }
                    if (req.session.type <= rs[0].type && req.session.userID !== Number(req.params.id)) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (rs[0].type === 127) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (res.locals.config.disable_admin_edit_user) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Disabled");
                        next(http_errors_1.default(401, 'Disabled'));
                        return [2 /*return*/];
                    }
                    res.render('edit_user', { u: rs[0] });
                    return [2 /*return*/];
            }
        });
    }); });
    router.post('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var rs, data1, userID, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.session || !req.session.sign || !req.session.type) {
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (req.body.type && (isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type))) < 0) {
                        next(http_errors_1.default(400, 'Type Should Be A Number From 0 to 126'));
                        return [2 /*return*/];
                    }
                    if (req.body.phone_number && (isNaN(Number(req.body.phone_number)) || Number(req.body.phone_number).toString().length !== 11)) {
                        next(http_errors_1.default(400, 'Phone Number Invalid'));
                        return [2 /*return*/];
                    }
                    if (isNaN(Number(req.params.id))) {
                        next(http_errors_1.default(400, 'User ID Should Be A Number'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db(query_1.default.getUserById, [Number(req.params.id)])];
                case 1:
                    rs = _a.sent();
                    if (!rs[0]) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", Number(req.params.id), "Edit", false, "Error: Not Found");
                        next(http_errors_1.default(404, 'User Not Found'));
                        return [2 /*return*/];
                    }
                    if (req.session.type <= rs[0].type && req.session.userID !== rs[0].id) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (rs[0].type === 127) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (req.session.type < Number(req.body.type)) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
                        next(http_errors_1.default(401, 'Unauthorized'));
                        return [2 /*return*/];
                    }
                    if (!req.body.name && !req.body.type && !req.body.phone_number) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Bad Request");
                        next(http_errors_1.default(400, 'Type or Name Required'));
                        return [2 /*return*/];
                    }
                    if (res.locals.config.disable_admin_edit_user) {
                        log_1.default(res.locals.config, db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Disabled");
                        next(http_errors_1.default(401, 'Disabled'));
                        return [2 /*return*/];
                    }
                    if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
                        data1 = req.body;
                        data1.confirm = '0';
                        if (req.session.userID === rs[0].id && Number(req.body.type) < req.session.type) {
                            res.render('confirm', {
                                msg: 'Edit User Confirmation',
                                inf1: 'Are you sure to downgrade your type?',
                                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                                data: data1
                            });
                            return [2 /*return*/];
                        }
                        else if (req.session.userID !== rs[0].id && Number(req.body.type) === req.session.type) {
                            res.render('confirm', {
                                msg: 'Edit User Confirmation',
                                inf1: 'Are you sure to make ' + res.locals.typeName[rs[0].type] + ' ' + rs[0].name + ' (' + rs[0].id + ') have the same type with you?',
                                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                                data: data1
                            });
                            return [2 /*return*/];
                        }
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
                    if (!req.body.type) return [3 /*break*/, 4];
                    return [4 /*yield*/, db(query_1.default.resetUserType, [Number(req.body.type), rs[0].id])];
                case 3:
                    _a.sent();
                    log_1.default(res.locals.config, db, userID, "User", rs[0].id, "Reset Type", true, "Previous Type: " + res.locals.typeName[rs[0].type]);
                    _a.label = 4;
                case 4:
                    if (!req.body.name) return [3 /*break*/, 6];
                    return [4 /*yield*/, db(query_1.default.resetUserName, [req.body.name, rs[0].id])];
                case 5:
                    _a.sent();
                    log_1.default(res.locals.config, db, userID, "User", rs[0].id, "Reset Name", true, "Previous Name: " + rs[0].name);
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 9, , 10]);
                    if (!req.body.phone_number) return [3 /*break*/, 8];
                    return [4 /*yield*/, db(query_1.default.resetUserPhoneNumber, [req.body.phone_number, rs[0].id])];
                case 7:
                    _a.sent();
                    log_1.default(res.locals.config, db, userID, "User", rs[0].id, "Reset Phone Number", true, "Previous Phone Number: " + rs[0].phone_number);
                    _a.label = 8;
                case 8:
                    if (rs[0].id === userID) {
                        res.render('notification', {
                            code: 200,
                            msg: "Update Successfully",
                            inf: "Please login again",
                            home: true
                        });
                    }
                    else {
                        res.render('notification', {
                            code: 200,
                            msg: "Update Successfully",
                            inf: "The user just edited will be logout",
                            bk2: true
                        });
                    }
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _a.sent();
                    if (e_1.code === 'ER_DUP_ENTRY') {
                        log_1.default(res.locals.config, db, userID, "User", rs[0].id, "Reset Phone Number", false, "Error: Duplicate");
                        next(http_errors_1.default(400, 'Not Completely Finished: Phone Number Has Been Taken'));
                    }
                    else
                        throw e_1;
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
