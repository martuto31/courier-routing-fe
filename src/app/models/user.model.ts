export interface User {
    email: string;
    enabled: boolean;
}

export interface IUser {
    email: string;
    password: string;
    enabled: boolean;
}

export interface LoginBody {
    email: string;
    password: string;
}
