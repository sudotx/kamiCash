import { Decimal } from '@prisma/client/runtime/library';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../db';
import { CustomError } from '../utils/handle-error';

export async function validateTransaction(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { amount, virtualAccountId, userId, transactionType } = req.body;

    try {
        const virtualAccount = await validateVirtualAccount(virtualAccountId, userId);
        await validateBalance(virtualAccount, amount, transactionType);
        await validateTransactionLimits(virtualAccount, amount);

        next();
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Transaction validation failed' });
    }
}

async function validateVirtualAccount(virtualAccountId: string, userId: string) {
    const virtualAccount = await prisma.virtualAccount.findFirst({
        where: {
            id: virtualAccountId,
            userId,
            status: 'ACTIVE'
        },
        include: {
            limits: true
        }
    });

    if (!virtualAccount) {
        throw new CustomError('Invalid or inactive virtual account', 400);
    }

    return virtualAccount;
}

async function validateBalance(virtualAccount: any, amount: number, transactionType: string) {
    if (transactionType === 'DEBIT' && new Decimal(virtualAccount.balance).lessThan(amount)) {
        throw new CustomError('Insufficient balance', 400);
    }
}

async function validateTransactionLimits(virtualAccount: any, amount: number) {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const monthStart = new Date(new Date().setDate(1));

    const [dailyTransactions, monthlyTransactions] = await Promise.all([
        getDailyTransactions(virtualAccount.id, today),
        getMonthlyTransactions(virtualAccount.id, monthStart)
    ]);

    const dailyTotal = calculateTotal(dailyTransactions);
    const monthlyTotal = calculateTotal(monthlyTransactions);

    validateLimits(dailyTotal, monthlyTotal, amount, virtualAccount.limits);
}

async function getDailyTransactions(virtualAccountId: string, date: Date) {
    return prisma.ledgerEntry.findMany({
        where: {
            virtualAccountId,
            createdAt: { gte: date }
        },
        select: { amount: true }
    });
}

async function getMonthlyTransactions(virtualAccountId: string, date: Date) {
    return prisma.ledgerEntry.findMany({
        where: {
            virtualAccountId,
            createdAt: { gte: date }
        },
        select: { amount: true }
    });
}

function calculateTotal(transactions: { amount: Decimal }[]) {
    return transactions.reduce(
        (sum, tx) => sum.plus(tx.amount),
        new Decimal(0)
    );
}

function validateLimits(dailyTotal: Decimal, monthlyTotal: Decimal, amount: number, limits: any) {
    const newAmount = new Decimal(amount);

    if (dailyTotal.plus(newAmount).greaterThan(limits.dailyLimit)) {
        throw new CustomError('Daily limit exceeded', 400);
    }

    if (monthlyTotal.plus(newAmount).greaterThan(limits.monthlyLimit)) {
        throw new CustomError('Monthly limit exceeded', 400);
    }
}
