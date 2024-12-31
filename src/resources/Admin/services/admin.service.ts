export class AdminService {
    constructor() { }

    createAdmin = async (date: any) => { }
    sanitizeAdminData = async (data: any) => { }
    authenticateAdmin = async (email: string, password: string) => { }
    assignPoints = async (userId: string, points: any, data: any) => {
        return { id: "", points: "" }
    }
    invalidateSession = async (data: any) => { }
    getAdminById = async (data: any) => { }
    getAllUsers = async () => { }
    getUserDetails = async (userId: string) => { }
}