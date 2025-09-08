"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor() {
        this.userAccount = new Map();
        this.DEFAULT_BALANCE = 5000;
    }
    static getInstance() {
        if (!User.instance) {
            User.instance = new User();
        }
        return User.instance;
    }
    getBalance(userId) {
        let account = this.userAccount.get(userId);
        if (!account) {
            account = { userId, usd_balance: this.DEFAULT_BALANCE };
            this.userAccount.set(userId, account);
        }
        return account.usd_balance;
    }
    // optional if you want to add/subtract instead of replace
    updateBalance(userId, delta) {
        if (!Number.isFinite(delta))
            throw new Error("Invalid delta");
        let account = this.userAccount.get(userId);
        if (!account) {
            account = { userId, usd_balance: this.DEFAULT_BALANCE };
        }
        const newBalance = delta;
        // optional: prevent negative balances
        if (newBalance < 0) {
            throw new Error("Insufficient funds");
        }
        account.usd_balance = newBalance;
        this.userAccount.set(userId, account);
        return account.usd_balance;
    }
}
exports.User = User;
