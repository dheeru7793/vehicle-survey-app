# Runbook

Short operational recipes for the production deployment.

## Daily check

1. `curl https://api.example.com/health` — expect `{"status":"ok"}`.
2. Open the admin dashboard — confirm today's counter is increasing.
3. Check **Failed** count on the dashboard. If non-zero, drill into the surveys
  list filtered by `status=FAILED` and inspect each one.

## Rotate the JWT secret

This invalidates every issued token (everyone must re-login).

```bash
# On the EC2 host
openssl rand -base64 48                       # copy the result
nano backend/.env                             # update JWT_SECRET
docker restart vs-backend
```

## Rotate the AWS IAM keys

1. IAM → user `vehicle-survey-backend` → Security credentials → Create access key.
2. Update `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in `backend/.env`.
3. `docker restart vs-backend`.
4. Smoke test (upload a photo via the mobile app).
5. Delete the old access key in IAM.

## Reset an admin password (from the shell)

```bash
# On the EC2 host
docker exec vs-backend node src/scripts/seedAdmin.js \
  # uses BOOTSTRAP_ADMIN_* from .env
```

Edit `BOOTSTRAP_ADMIN_PASSWORD` in `backend/.env` first; the script will update
the existing admin if one already exists.

## Backup / restore MongoDB

### Atlas (recommended)

Atlas takes automatic snapshots on the paid tiers. For M0/M2 (free/shared),
use `mongodump`:

```bash
mongodump --uri="$MONGODB_URI" --out=./backup-$(date +%F)
tar czf backup-$(date +%F).tar.gz backup-$(date +%F)
# Then upload tarball to S3 or off-site storage.
```

Restore:

```bash
mongorestore --uri="$MONGODB_URI" --drop ./backup-2026-06-10
```

### Self-hosted Mongo

Same `mongodump` / `mongorestore` commands work; just point them at your local
`mongodb://` URI.

## Inspect audit logs

```bash
docker exec -it vs-backend node -e "
require('./src/config/db').connectDB().then(async () => {
  const A = require('./src/models/AuditLog');
  console.log(await A.find().sort({ timestamp: -1 }).limit(20).lean());
  process.exit(0);
});"
```

Or query Mongo directly with `mongosh`.

## Common errors


| Symptom                                           | Cause                                              | Fix                                                      |
| ------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| Mobile shows "401 Unauthorized" after first login | JWT secret rotated, or token expired               | Have surveyor logout + login again                       |
| Admin login returns 403                           | Account is deactivated, or user is `SURVEYOR` role | Activate / use admin account                             |
| Photo upload fails with `Access Denied`           | S3 IAM permissions missing                         | Re-check the IAM policy in DEPLOYMENT.md §3              |
| `MongoServerSelectionError`                       | Atlas IP allowlist doesn't include EC2             | Add the EC2 elastic IP to Atlas Network Access           |
| Map shows "Set NEXT_PUBLIC_GOOGLE_MAPS_KEY..."    | Env var missing or key restricted to wrong domain  | Set the env var and restrict the key to the admin domain |


