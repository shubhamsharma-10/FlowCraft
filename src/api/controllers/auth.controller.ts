import { registerSchema, siginSchema } from "../validators/auth.validator.js"
import generateAccessToken from "../lib/generateAccessToken.js"
import { prisma } from "../../services/prisma.js"
import { Request, Response } from "express"
import config from "../../utils/config.js"
import bcrypt from 'bcrypt';

const authController = {
    registerController: async (req: Request, res: Response) => {
       try {
            const isValidRequest = registerSchema.safeParse(req.body)
            if(!isValidRequest.success){
                return res.status(400).json({
                    success: false,
                    errors: isValidRequest.error.flatten().fieldErrors
                })
            }
    
            const { email, name, password } = isValidRequest.data;
            const existingUser = await prisma.user.findUnique({
                where: {
                    email
                }
            })
            if(existingUser){
                return res.status(409).json({
                    success: false,
                    message: "User already exists"
                })
            }
    
            const hashedPassword = await bcrypt.hash(password, config.saltRounds)
            console.log("Password: ", password, " Hashed password: ", hashedPassword);
            const newUser = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword
                }
            })
    
            const accessToken = generateAccessToken(newUser)
    
            console.log("Access Token: ", accessToken);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser,
                accessToken
            })
       } catch (error) {
            console.error("Error in registerController: ", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            })
       }
    },

    signinController: async (req: Request, res: Response) => {
       try {
            const isValidRequest = siginSchema.safeParse(req.body);
            if(!isValidRequest.success){
                return res.status(400).json({
                    success: false,
                    error: isValidRequest.error.flatten().fieldErrors
                })
            }
    
            const { email, password } = isValidRequest.data;
    
            const isUserExists = await prisma.user.findUnique({
                where:{
                    email
                }
            })
    
            if(!isUserExists){
                return res.status(404).json({
                    success: false,
                    messsage: "Invalid credentials"
                })
            }
    
            const isPasswordvalid = bcrypt.compare(password, isUserExists.password);
            if(!isPasswordvalid){
                return res.status(404).json({
                    success: false,
                    messsage: "Invalid credentials"
                })
            }
            
            const accessToken = generateAccessToken(isUserExists);
    
            return res.status(200).json({
                success: true,
                message: "User signed in successfully",
                user: {
                    id: isUserExists.id,
                    name: isUserExists.name,
                    email: isUserExists.email
                },
                accessToken
            })
       } catch (error) {
            console.error("Error in signinController: ", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            })
       }  
    }
    
}

export default authController