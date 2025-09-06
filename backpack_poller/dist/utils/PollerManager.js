"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollerManager = void 0;
//getting the ask price or sell price they both are a bit same here
class PollerManager {
    constructor() {
        this.latestStream = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PollerManager();
            return this.instance;
        }
        return this.instance;
    }
    set(symbol, askPrice, decimals) {
        this.latestStream.set(symbol, { asset: symbol, price: askPrice, decimals });
    }
    get() {
        return [...this.latestStream.values()];
    }
}
exports.PollerManager = PollerManager;
