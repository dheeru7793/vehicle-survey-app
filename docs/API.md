# API overview

The full, interactive API reference is hosted by the backend itself:

- Local dev: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- Production: [https://api.example.com/api/docs](https://api.example.com/api/docs)

The OpenAPI JSON is at `/api/docs.json`.

## Authentication

All endpoints (except `POST /auth/login`) require a JWT in the `Authorization`
header:

```
Authorization: Bearer <token>
```

Tokens are obtained by `POST /api/v1/auth/login` with `{ employeeId, password }`
and expire after `JWT_EXPIRES_IN` (default 7 days).

## Roles

- `ADMIN` — full access. Required for `/api/v1/admin/*` routes.
- `SURVEYOR` — can read/create/update their own surveys & photos.

## High-level routes


| Method | Path                                            | Role  | Purpose                                         |
| ------ | ----------------------------------------------- | ----- | ----------------------------------------------- |
| POST   | `/auth/login`                                   | —     | Login, returns JWT                              |
| GET    | `/auth/me`                                      | any   | Current user                                    |
| POST   | `/auth/logout`                                  | any   | Audit-only logout                               |
| GET    | `/surveys`                                      | any   | List surveys (filtered to caller for SURVEYOR)  |
| POST   | `/surveys`                                      | any   | Create survey (supports `clientId` idempotency) |
| GET    | `/surveys/:id`                                  | any   | Survey detail                                   |
| PATCH  | `/surveys/:id`                                  | any   | Update notes / status / location                |
| GET    | `/surveys/duplicate-check?vehicleNumber=...`    | any   | Check for recent survey on this vehicle         |
| POST   | `/surveys/:id/photos`                           | any   | Multipart upload (`photos[]`)                   |
| GET    | `/surveys/:id/photos`                           | any   | List photos with signed URLs                    |
| GET    | `/surveys/:id/photos/zip`                       | any   | Streamed ZIP of all photos                      |
| DELETE | `/photos/:photoId`                              | any   | Delete a single photo                           |
| GET    | `/admin/dashboard/stats`                        | ADMIN | Totals (total, today, month, pending, failed)   |
| GET    | `/admin/dashboard/daily?days=14`                | ADMIN | Per-day counts                                  |
| GET    | `/admin/dashboard/surveyor-performance?days=30` | ADMIN | Top surveyors                                   |
| GET    | `/admin/surveyors`                              | ADMIN | List surveyors                                  |
| POST   | `/admin/surveyors`                              | ADMIN | Create surveyor                                 |
| GET    | `/admin/surveyors/:id`                          | ADMIN | Get surveyor                                    |
| PATCH  | `/admin/surveyors/:id`                          | ADMIN | Update name/mobile                              |
| POST   | `/admin/surveyors/:id/activate`                 | ADMIN | Activate                                        |
| POST   | `/admin/surveyors/:id/deactivate`               | ADMIN | Deactivate                                      |
| POST   | `/admin/surveyors/:id/reset-password`           | ADMIN | Reset password                                  |
| GET    | `/admin/surveyors/:id/stats`                    | ADMIN | Surveyor stats                                  |


## Vehicle number normalization

The server normalizes vehicle numbers identically to the mobile app:

```
"mh12-ab 1234" → "MH12AB1234"
```

Regex used: `/^[A-Z0-9]{4,12}$/`

## S3 layout

```
vehicle-surveys/
  MH12AB1234/
    2026-06-05_001.jpg
    2026-06-05_001_thumb.jpg
    2026-06-05_002.jpg
    2026-06-05_002_thumb.jpg
    ...
```

Reads use 15-minute signed URLs.