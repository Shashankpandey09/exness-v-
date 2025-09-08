"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastProcessedId = void 0;
class lastProcessedId {
    constructor() {
        this.processedId = '0-0';
    }
    static getInstance() {
        if (!lastProcessedId.instance)
            return lastProcessedId.instance = new lastProcessedId();
        return lastProcessedId.instance;
    }
    setLastProcessedId(id) {
        this.processedId = id;
    }
    getLastProcessedId() {
        return this.processedId;
    }
}
exports.lastProcessedId = lastProcessedId;
