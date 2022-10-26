
export interface JwtTokenPayload {
    sub: number;
    email: string;
    role: string;
    createdByIp?: string;
}