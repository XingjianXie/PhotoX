declare module 'express-session' {
    import {Store} from "express-session";
    import express = require('express');
    import node = require('events');
    global {
        namespace Express {
            interface Request {
                session: Session;
                sessionID: string;
                sessionStore: Store;
            }

            interface SessionData {
                [key: string]: any;
                cookie: SessionCookieData;
            }

            interface SessionCookieData {
                originalMaxAge: number;
                path: string;
                maxAge: number | null;
                secure?: boolean;
                httpOnly: boolean;
                domain?: string;
                expires: Date | boolean;
                sameSite?: boolean | string;
            }

            interface SessionCookie extends SessionCookieData {
                serialize(name: string, value: string): string;
            }

            interface Session extends SessionData {
                id: string;
                regenerate(callback: (err: any) => void): void;
                destroy(callback: (err: any) => void): void;
                reload(callback: (err: any) => void): void;
                save(callback: (err: any) => void): void;
                touch(): void;
                cookie: SessionCookie;
            }
        }
    }

    function session(options?: session.SessionOptions): express.RequestHandler;

    namespace session {
        interface SessionOptions {
            secret: string | string[];
            name?: string;
            store?: Store | MemoryStore;
            cookie?: express.CookieOptions;
            genid?(req: express.Request): string;
            rolling?: boolean;
            resave?: boolean;
            proxy?: boolean;
            saveUninitialized?: boolean;
            unset?: string;
            destroy_callback?: (session_id: string) => boolean;
        }

        interface BaseMemoryStore {
            get: (sid: string, callback: (err: any, session?: Express.SessionData | null) => void) => void;
            set: (sid: string, session: Express.Session, callback?: (err?: any) => void) => void;
            destroy: (sid: string, callback?: (err?: any) => void) => void;
            length?: (callback: (err: any, length?: number | null) => void) => void;
            clear?: (callback?: (err?: any) => void) => void;
        }

        abstract class Store extends node.EventEmitter {
            constructor(config?: any);

            regenerate: (req: express.Request, fn: (err?: any) => any) => void;
            load: (sid: string, fn: (err: any, session?: Express.SessionData | null) => any) => void;
            createSession: (req: express.Request, sess: Express.SessionData) => void;

            get: (sid: string, callback: (err: any, session?: Express.SessionData | null) => void) => void;
            set: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void;
            destroy: (sid: string, callback?: (err?: any) => void) => void;
            all: (callback: (err: any, obj?: { [sid: string]: Express.SessionData; } | null) => void) => void;
            length: (callback: (err: any, length?: number | null) => void) => void;
            clear: (callback?: (err?: any) => void) => void;
            touch: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void;
        }

        class MemoryStore implements BaseMemoryStore {
            get: (sid: string, callback: (err: any, session?: Express.SessionData | null) => void) => void;
            set: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void;
            destroy: (sid: string, callback?: (err?: any) => void) => void;
            all: (callback: (err: any, obj?: { [sid: string]: Express.SessionData; } | null) => void) => void;
            length: (callback: (err: any, length?: number | null) => void) => void;
            clear: (callback?: (err?: any) => void) => void;
            touch: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void;
        }
    }

    export = session;
}