# Local infra

Brings up `mongo`, `backend`, `admin` for local development.

```bash
cd infra
cp ../backend/.env.example ../backend/.env   # edit as needed
docker compose up -d --build
docker compose exec backend npm run seed:admin
```

Then visit:

- Admin: http://localhost:3001
- Swagger: http://localhost:4000/api/docs
- Health: http://localhost:4000/health
