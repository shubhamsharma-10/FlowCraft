import { Request, Response, NextFunction } from "express";
import { UserJwtPayload } from "../lib/types.js";
import config from "../../utils/config.js";
import jwt from "jsonwebtoken";

const authMiddleware = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
   try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(" ")[1];
        console.log("Auth Token: ", token);
        console.log("Auth header: ", authHeader);
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized access"
            })
        }
 
        const verifyUser = jwt.verify(token, config.jwtSecret!) as UserJwtPayload;
        req.user_id = verifyUser.id;
        next();

   } catch (error: Error | any) {
        console.error("Error in auth middleware: ", error);
        return res.status(403).json({
            success: false,
            error: error instanceof Error ? error.message : 'Forbidden access'
        })
   }
}

export default authMiddleware;