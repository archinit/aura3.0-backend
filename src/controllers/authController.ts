import { Session } from '@/models/Session';
import { User } from '@/models/User';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                msg: "All fields are required"
            })
        }

        //check if user exists

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({msg: "Email already in use."})
        }

        //hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user

        const user = new User({
            name, 
            email,
            password: hashedPassword
        });
        await user.save();

        //Respond
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            msg: "User registered Successfully"
        })
    } catch (error) {
        res.status(500).json({msg: "Server error", error});
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                msg: "Email and Password are required"
            })
        }

        //find user
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({msg: "Invalid email or password"});
        }

        //verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({msg: "Invalid email or password"});
        }

        //generate jwt token
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET || "your jwt secret", {expiresIn: "24h"});

        //create session
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24) //24hrs from now 

        const session = new Session({
            userId: user._id,
            token,
            expiresAt
        });
        await session.save();

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token, 
            msg: "Login Successfully"
        });
    } catch (error) {
        res.status(500).json({msg: "Internal Server Error", error})
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
            if (token) {
                await Session.deleteOne({token})
            }
            res.json({msg: "Logged Out Successfully"})
        
    } catch (error) {
        res.status(500).json({msg: "Internal Server Error", error})
    }
};