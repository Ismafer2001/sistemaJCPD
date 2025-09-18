import { sign,verify } from "jsonwebtoken";
import { jwtpayload } from "../interfaces/auth.interface"

const JWT_SECRET = process.env.JWT_SECRET || "token.0101001"

const generarToken = async(payload:jwtpayload)=>{
    const jwt = sign(payload,JWT_SECRET,{
        expiresIn:"12h"

    });
    
    return jwt
    

}

const checkToken = async(jwt:string): Promise<jwtpayload | null>=>{
    const TokenValido = verify(jwt, JWT_SECRET);
    
    return TokenValido as jwtpayload

}
export {generarToken, checkToken}