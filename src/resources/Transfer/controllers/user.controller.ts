import { NextFunction, Request, Response } from "express";
import prisma from "../../../db";
import { hashData } from "../../../utils/hash";
import { CreateUserInput } from "../schemas/index.schema";

export const createUserHandler = async (
    req: Request<{}, {}, CreateUserInput["body"]>,
    res: Response,
    next: NextFunction
) => { }
