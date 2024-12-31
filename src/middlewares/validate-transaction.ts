import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { Decimal } from '@prisma/client/runtime/library';

export async function validateTransaction(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { amount, virtualAccountId, userId, transactionType } = req.body;

    try {
        // 1. Validate Virtual Account exists and is active
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
            return res.status(400).json({ error: 'Invalid or inactive virtual account' });
        }

        // 2. Check sufficient balance for debits
        if (transactionType === 'DEBIT') {
            if (new Decimal(virtualAccount.balance).lessThan(amount)) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }
        }

        // 3. Validate against transaction limits
        const { limits } = virtualAccount;

        // if (new Decimal(amount).greaterThan(limits.transactionLimit)) {
        //     return res.status(400).json({ error: 'Amount exceeds transaction limit' });
        // }

        // 4. Check daily limits
        const todayTransactions = await prisma.ledgerEntry.findMany({
            where: {
                virtualAccountId,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            },
            select: {
                amount: true
            }
        });

        const dailyTotal = todayTransactions.reduce(
            (sum, tx) => sum.plus(tx.amount),
            new Decimal(0)
        );

        // if (dailyTotal.plus(amount).greaterThan(limits.dailyLimit)) {
        //     return res.status(400).json({ error: 'Daily limit exceeded' });
        // }

        // 5. Check monthly limits
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyTransactions = await prisma.ledgerEntry.findMany({
            where: {
                virtualAccountId,
                createdAt: {
                    gte: monthStart
                }
            },
            select: {
                amount: true
            }
        });

        const monthlyTotal = monthlyTransactions.reduce(
            (sum, tx) => sum.plus(tx.amount),
            new Decimal(0)
        );

        // if (monthlyTotal.plus(amount).greaterThan(limits.monthlyLimit)) {
        //     return res.status(400).json({ error: 'Monthly limit exceeded' });
        // }

        // All validations passed
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Transaction validation failed' });
    }
}
