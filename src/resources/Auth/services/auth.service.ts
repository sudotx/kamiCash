import { prisma } from "../../../db";
import { unhashData } from "../../../utils/hash";

class AuthService {
    constructor() { }

    /**
     * Validates the password of an admin user.
     *
     * @param email - The email address of the admin user.
     * @param password - The password to validate.
     */
    async validateAdminPassword({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) {
        // const admin = await prisma.admin.findFirst({
        //     where: {
        //         email,
        //     },
        // });
        // if (!admin) {
        //     return false;
        // }

        // const isValid = await unhashData(password, admin.password);

        // if (!isValid) return false;
        // const { password: _, ...rest } = admin;

        // return rest;
    }
}