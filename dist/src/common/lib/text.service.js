"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
class TextService {
    static async encrypt(text) {
        return bcrypt.hash(text, 10);
    }
    static async compare(text, hash) {
        return bcrypt.compare(text, hash);
    }
    static generateUuid() {
        return (0, uuid_1.v4)();
    }
    static decodeBase64(encoded) {
        try {
            return Buffer.from(encoded, 'base64').toString('utf-8');
        }
        catch {
            return encoded;
        }
    }
}
exports.TextService = TextService;
//# sourceMappingURL=text.service.js.map