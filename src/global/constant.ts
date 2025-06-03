export enum STATUS {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
}

export const ALLOW_MULTI_LOGIN = process.env.ALLOW_MULTI_LOGIN || false;