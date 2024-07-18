export class CustomError {
    message!: any;
    status!: number;
    additionalInfo!: any;
    constructor(message: any, status: number = 500, additionalInfo: any = {}) {
        console.log("message:", message);
        let finalMessage = message
            ? typeof message.meta !== undefined && message?.meta?.cause
                ? message.meta.cause || message
                : typeof message === "string"
                ? message
                : message.message
            : "An error occurred. Please contact support.";

        this.message = finalMessage;
        this.status = status;
        this.additionalInfo = additionalInfo;
    }
}
