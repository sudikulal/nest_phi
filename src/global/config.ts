export default () => ({
    port: parseInt(process.env.PORT || "4000"),
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'mydatabase',
    },
    jwt: {
        accessToken: {
            secret: process.env.JWT_SECRET || 'defaultsecret',
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
        },
        refreshToken: {
            secret: process.env.JWT_REFRESH_SECRET || 'defaultrefreshsecret',
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
        },
    },
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    }
})