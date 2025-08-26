import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { checkToken } from '../utils/jwt.handle';
import { jwtpayload } from '../interfaces/usuarios.interface';


export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('verificando token');
  try {
    const authHeader = req.headers.authorization ||"";
    const token = authHeader.split(' ').pop();

      
         // Extrae el ID del usuario del token decodificado.
 const decoded = await checkToken(`${token}`)


 

    
    if(!decoded){
      res.status(401)
      res.send('no tienes un jwt valido')

    }
    req.user = decoded ;
    
   
    next();
  } catch (err) {
    console.log(err)
    res.status(401).json({ mensaje: 'acceso denegado' });
  }
  
};
