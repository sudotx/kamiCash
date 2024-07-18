import jwt, { Secret } from "jsonwebtoken";

const jwtSecret = `${process.env.AUTH_SECRET}`;

/**
 * Signs a JSON Web Token (JWT) with the provided object and optional options.
 *
 * @param object - The object to be encoded in the JWT.
 * @param options - Optional JWT signing options.
 * @returns The signed JWT.
 */
export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
    return jwt.sign(object, jwtSecret as Secret, {
        ...(options && options),
    });
}

/**
 * Verifies a JSON Web Token (JWT) and returns the decoded payload or an error object.
 *
 * @param token - The JWT token to verify.
 */
export function verifyJwt(token: string) {
    try {
        const decoded = jwt.verify(token, jwtSecret as Secret);
        return {
            valid: false,
            expired: false,
            decoded,
        };
    } catch (error: any) {
        return {
            valid: false,
            expired: error.message === "jwt expired",
            decoded: null,
        };
    }
}
