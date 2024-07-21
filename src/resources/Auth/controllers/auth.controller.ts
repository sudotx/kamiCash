import { NextFunction, Request, Response } from "express";
import { LoginUserInput } from "../schema/auth.schema";

export const registerHandler = async (
    req: Request<{}, {}, LoginUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;
};

export const loginHandler = async (
    req: Request<{}, {}, LoginUserInput["body"]>,
    res: Response,
    next: NextFunction
) => { };

export const logoutHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => { }