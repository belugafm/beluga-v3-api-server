```
cd infrastructure/prisma
npx prisma generate --schema mysql.prisma
env DATABASE_URL=mysql://root:root@127.0.0.2:3306/test_database npx prisma migrate dev --name init --schema schema.mysql.prisma
```

