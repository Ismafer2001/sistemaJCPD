import { JwtUser } from '../../interfaces/auth.interface';
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
