import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import dotenv from 'dotenv'
import { redisClient } from "..";
dotenv.config()
export const UserRouter = Router();
const SECRET_KEY=process.env.SECRET_KEY as string;
console.log(SECRET_KEY)
UserRouter.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  //checking in db wether user exist or not
  try {
    const user = await prisma.user.findUnique({ where: { username: email } });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }
    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10);
    //creating db in user
    const User = await prisma.user.create({
      data: {
        username: email,
        password: hashedPassword,
        usd_balance: 5000,
      },
      select: { id: true, usd_balance: true },
    });
    //creating a magic link sir with token
    const token=jwt.sign({email,hashedPassword},SECRET_KEY,{expiresIn:'1h'})
    //write send email to the user (magic link)

   //pushing something to the streams as soon as user signUp
   const args=['XADD','trades','*','user',`${User.id}`,'balance',`${User.usd_balance}`]
   const id=await redisClient.sendCommand(args)
   console.log(id)
    return res.json({
      message: "user created successfully",
      id: User.id,
      balance: User.usd_balance,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error occurred while creating user" });
  }
});
