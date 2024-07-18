import bcrypt from "bcrypt";

export const hashData = async (data: any, saltRounds = 10) => {
    try {
        const hashedData = await bcrypt.hash(data, saltRounds);
        return hashedData;
    } catch (err: any) {
        throw err;
    }
};

export const unhashData = async (unhashedData: any, hashedData: any) => {
    try {
        const unhashStatus = await bcrypt.compare(unhashedData, hashedData);
        return unhashStatus;
    } catch (err: any) {
        console.log("[UNHASH_ERROR]:", err);
        return false;
    }
};
