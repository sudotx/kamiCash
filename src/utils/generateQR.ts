import QRCode from "qrcode"
import { logger } from "./logger";

export const generateQR = async (data: any) => {
    try {
        const qr = await QRCode.toDataURL(data);
        logger.info(`QR code generated: ${qr}`);
        return qr;
    } catch (error) {
        logger.error(`Error generating QR code: ${error}`);
        throw error;
    }
}

