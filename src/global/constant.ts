export enum STATUS {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
}

export const ALLOW_MULTI_LOGIN = process.env.ALLOW_MULTI_LOGIN || false;

export enum TTL {
    JTI_EXPIRATION = 1000 * 60 * 15,
}