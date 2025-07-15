import { Response } from "express";

const handleError = (res: Response, error: string) =>{
    res.status(500);
    res.send({error})


}