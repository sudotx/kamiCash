import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../src/db';
import { LinkCardInput } from '../../src/resources/Card/schemas/index.schema';
import { CardService } from '../../src/resources/Card/services/card.service';

jest.mock('../../../db', () => ({
    prisma: {
        card: {
            create: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('./card.service'); // Mock the TokenizationService

describe('CardService', () => {
    let cardService: CardService;

    beforeEach(() => {
        cardService = new CardService();
        jest.clearAllMocks();
    });

    describe('linkCard', () => {
        it('should tokenize card and save card details', async () => {
            const cardData: LinkCardInput['body'] = {
                cardNumber: '4111111111111111',
                cardHolderName: '<NAME>',
                expiryMonth: "12",
                cvv: '123',
                expiryYear: "2025",
                userId: 'user-123',
            };
            const userId = 'user-123';
            const token = 'token-123';

            (prisma.card.create as jest.Mock).mockResolvedValue({
                id: 'card-123',
                last4: '1111',
                brand: 'visa',
                expiryMonth: 12,
                expiryYear: 2025,
                token: token,
            });

            const result = await cardService.linkCard(cardData, userId);

            expect(prisma.card.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    last4: '1111',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2025,
                    token: token,
                },
            });
            expect(result).toEqual({
                id: 'card-123',
                last4: '1111',
                brand: 'visa',
                expiryMonth: 12,
                expiryYear: 2025,
            });
        });
    });

    describe('getCardDetails', () => {
        it('should return card details for a user', async () => {
            const userId = 'user-123';
            const mockCards = [
                {
                    id: 'card-123',
                    last4: '1111',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2025,
                },
            ];

            (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

            const result = await cardService.getCardDetails(userId);

            expect(prisma.card.findMany).toHaveBeenCalledWith({
                where: { userId },
            });
            expect(result).toEqual(mockCards);
        });
    });

    describe('removeCard', () => {
        it('should remove a card by cardId', async () => {
            const userId = 'user-123';
            const cardId = 'card-123';

            (prisma.card.delete as jest.Mock).mockResolvedValue({});

            await cardService.removeCard(userId, cardId);

            expect(prisma.card.delete).toHaveBeenCalledWith({
                where: { id: cardId },
            });
        });
    });

    describe('processTransaction', () => {
        it('should process a transaction using tokenized card data', async () => {
            const token = 'token-123';
            const amount = new Decimal(100);
            const cardNumber = '4111111111111111';


            await cardService.processTransaction(token, amount);

        });

        it('should throw an error if the token is invalid', async () => {
            const token = 'invalid-token';
            const amount = new Decimal(100);


            await expect(cardService.processTransaction(token, amount)).rejects.toThrow('Invalid token');
        });
    });
});
