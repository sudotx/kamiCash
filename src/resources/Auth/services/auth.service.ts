import { prisma } from "../../../db";
import { unhashData } from "../../../utils/hash";

export class AuthService {
    constructor() { }

    /**
     * Validates the password of a user.
     *
     * @param email - The email address of the admin user.
     * @param password - The password to validate.
     */
    async validateUserPassword({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) {
        try {
            // Fetch the admin user from the database
            const user = await prisma.user.findFirst({
                where: {
                    email,
                },
            });

            // If admin does not exist, return false
            if (!user) {
                return false;
            }

            // Compare the provided password with the stored hashed password
            const isValid = await unhashData(password, user.password);

            // If the password is not valid, return false
            if (!isValid) {
                return false;
            }

            // Destructure the admin object to exclude the password
            const { password: _, ...rest } = user;

            // Return the admin data without the password
            return rest;

        } catch (error) {
            // Handle unexpected errors
            console.error("Error validating admin password:", error);
            throw new Error("An error occurred while validating the admin password.");
        }
    }
}