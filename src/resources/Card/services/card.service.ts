import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../db';
import { LinkCardInput, linkCardSchema } from '../schemas/index.schema';

class TokenizationService {
    private tokenVault: Map<string, string> = new Map();
    async tokenizeCard(cardNumber: string): Promise<string> {
        // This would involve interaction with a tokenization service or API
        // Here, we'll simulate tokenization by generating a unique token
        const token = crypto.randomUUID() // Example token generation
        this.tokenVault.set(token, cardNumber); // Map token to original data
        return token;
    }

    async detokenizeCard(token: string): Promise<string | null> {
        return this.tokenVault.get(token) || null; // Retrieve original data
    }
}
export class CardService {
    private tokenizationService = new TokenizationService();

    async linkCard(cardData: LinkCardInput['body'], userId: string) {
        const token = await this.tokenizationService.tokenizeCard(cardData.cardNumber);
        const newCard = await prisma.card.create({
            data: {
                userId: userId, // Replace with actual user ID
                last4: cardData.cardNumber.slice(-4),
                brand: 'visa', // You'd determine this based on the card number
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                token: token
            },
        });

        return {
            id: newCard.id,
            last4: newCard.last4,
            brand: newCard.brand,
            expiryMonth: newCard.expiryMonth,
            expiryYear: newCard.expiryYear,
        };
    }

    async getCardDetails(userId: string) {
        const cards = await prisma.card.findMany({
            where: { userId },
        });

        return cards.map(card => ({
            id: card.id,
            last4: card.last4,
            brand: card.brand,
            expiryMonth: card.expiryMonth,
            expiryYear: card.expiryYear,
        }));
    }

    async removeCard(userId: string, cardId: string) {
        await prisma.card.delete({
            where: { id: cardId },
        });
        return;
    }

    async processTransaction(token: string, amount: Decimal) {
        const cardNumber = await this.tokenizationService.detokenizeCard(token);
        if (!cardNumber) {
            throw new Error('Invalid token');
        }

        // Process transaction with cardNumber
    }
}