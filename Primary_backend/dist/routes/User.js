"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const __1 = require("..");
dotenv_1.default.config();
exports.UserRouter = (0, express_1.Router)();
const SECRET_KEY = process.env.SECRET_KEY;
console.log(SECRET_KEY);
exports.UserRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    //checking in db wether user exist or not
    try {
        const user = yield prisma_1.prisma.user.findUnique({ where: { username: email } });
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }
        //hashing password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        //creating db in user
        const User = yield prisma_1.prisma.user.create({
            data: {
                username: email,
                password: hashedPassword,
                usd_balance: 5000,
            },
            select: { id: true, usd_balance: true },
        });
        //creating a magic link sir with token
        const token = jsonwebtoken_1.default.sign({ email, hashedPassword }, SECRET_KEY, { expiresIn: '1h' });
        //write send email to the user (magic link)
        //pushing something to the streams as soon as user signUp
        const args = ['XADD', 'trades', '*', 'user', `${User.id}`, 'balance', `${User.usd_balance}`];
        const id = yield __1.redisClient.sendCommand(args);
        console.log(id);
        return res.json({
            message: "user created successfully",
            id: User.id,
            balance: User.usd_balance,
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error occurred while creating user" });
    }
}));
