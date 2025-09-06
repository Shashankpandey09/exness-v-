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
exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("./routes/User");
const redis_1 = require("redis");
const app = (0, express_1.default)();
app.use(express_1.default.json());
exports.redisClient = (0, redis_1.createClient)();
exports.redisClient.on("connect", () => console.log(" Connected to Redis"));
exports.redisClient.on("error", (err) => console.error(" Redis Client Error:", err));
app.use("/api/v1/user", User_1.UserRouter);
function Express() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.redisClient.connect();
            app.listen(3000, () => {
                console.log(" Server started on port 3000");
            });
        }
        catch (error) {
            console.error(" Failed to start:", error);
        }
    });
}
Express();
