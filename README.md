# Vehicle Survey App — V1

Production-ready Vehicle Survey Management System for field surveyors and back-office admins.

## What's in the box


| Folder                  | Stack                             | Purpose                                                       |
| ----------------------- | --------------------------------- | ------------------------------------------------------------- |
| `[backend/](./backend)` | Node.js, Express, MongoDB, AWS S3 | REST API consumed by both the mobile app and the admin portal |
| `[mobile/](./mobile)`   | Flutter (Android)                 | App used by field surveyors. Offline-first with auto-sync.    |
| `[admin/](./admin)`     | Next.js (App Router), Material UI | Web portal for admins to review surveys and manage surveyors  |
| `[infra/](./infra)`     | Docker Compose, env templates     | Local dev orchestration                                       |
| `[docs/](./docs)`       | Markdown                          | Deployment, mobile build, API and runbook docs                |


## Architecture

```
                  ┌──────────────────────┐
                  │  Admin Portal        │   browser → Next.js
                  │  (Next.js)           │   uses httpOnly JWT cookie
                  └──────────┬───────────┘
                             │ HTTPS
                             ▼
┌────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Surveyor APK   │───▶│  Backend     │───▶│ MongoDB Atlas   │
│ (Flutter)      │    │  (Express)   │    └─────────────────┘
│ Offline / Sync │    │              │    ┌─────────────────┐
└────────────────┘    │              │───▶│ AWS S3 (images) │
                      └──────────────┘    └─────────────────┘
```

## Quickstart (local dev)

Prerequisites: Docker, Node.js 20+, Flutter 3.22+, an `.env` for backend & admin.

```bash
# 1. backend + mongo
cp backend/.env.example backend/.env
cp admin/.env.example admin/.env.local
cd infra && docker compose up -d

# 2. seed first admin
docker compose exec backend node src/scripts/seedAdmin.js

# 3. admin portal (separate terminal)
cd admin && npm install && npm run dev      # http://localhost:3001

# 4. mobile app (separate terminal, with Android device/emulator attached)
cd mobile
flutter create . --platforms=android --org com.example --project-name vehicle_survey   # first time only
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

Full instructions: `[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)`, `[docs/MOBILE_BUILD.md](./docs/MOBILE_BUILD.md)`.

## What's NOT in V1

- iOS build (Android only)
- Push notifications
- In-app messaging
- SSO / OAuth
- Terraform IaC (deployment is documented manually)

## License

MIT — see [LICENSE](./LICENSE).