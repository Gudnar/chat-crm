"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseUrlAssets = void 0;
function baseUrlAssets() {
    const base = process.env.ASSETS_URL || process.env.APP_URL || 'http://localhost:3001';
    return base.replace(/\/$/, '');
}
exports.baseUrlAssets = baseUrlAssets;
//# sourceMappingURL=url-assets.util.js.map