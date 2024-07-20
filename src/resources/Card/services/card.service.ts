import { prisma } from '../../../db';
import { LinkCardInput } from '../schemas/index.schema';

export class CardService {
    async linkCard(cardData: LinkCardInput['body']) {
        const newCard = await prisma.card.create({
            data: {
                userId: 'user_123', // Replace with actual user ID
                last4: cardData.cardNumber.slice(-4),
                brand: 'visa', // You'd determine this based on the card number
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                // Tokenization logic can be added here
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
}