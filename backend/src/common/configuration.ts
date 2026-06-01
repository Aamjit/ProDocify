export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
  },
  databaseUrl: process.env.DATABASE_URL ?? '',
});
