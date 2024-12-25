
import { prisma } from "../../../db";
import { logger } from "../../../utils/logger";


export class VirtualAccountActs {
    // create new virtual account
    async createVirtualAccount(currency: string) {
        try {
            logger.info("Creating new virtual account");
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
}