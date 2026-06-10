# Deployment guide (AWS, V1)

This guide walks through a minimal production deployment:

- **Backend** → Docker on EC2 (t3.small), behind nginx + Let's Encrypt
- **Admin portal** → Vercel (easiest) OR same EC2 with a second container
- **Database** → MongoDB Atlas (free tier M0 or shared)
- **Image storage** → AWS S3 (private bucket, signed URLs)
- **DNS** → one A record per host (e.g. `api.example.com`, `admin.example.com`)

You will need:

- An AWS account
- A MongoDB Atlas account
- A domain you own
- A Google Maps JavaScript API key (billing enabled, restricted to your admin domain)

---

## 1. MongoDB Atlas

1. Create a free shared cluster.
2. **Database Access** → add a user with read/write to the `vehicle_survey` DB. Save the password.
3. **Network Access** → add `0.0.0.0/0` for first setup (then restrict to your EC2 IP later).
4. Click **Connect → Drivers** and copy the connection string. It looks like:
  ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/vehicle_survey?retryWrites=true&w=majority
  ```
5. Keep this; you'll paste it into `backend/.env` as `MONGODB_URI`.

## 2. AWS S3 (private bucket)

1. AWS console → S3 → **Create bucket**.
  - Name: e.g. `vehicle-surveys-prod-acme` (must be globally unique)
  - Region: pick the same region your EC2 will be in (e.g. `ap-south-1`)
  - Block all public access: **ON** (we use signed URLs)
2. Enable Bucket Versioning: optional, recommended.
3. Add a CORS policy so the admin portal can fetch signed URLs:
  ```json
   [
     {
       "AllowedOrigins": ["https://admin.example.com"],
       "AllowedMethods": ["GET"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
  ```
4. (Optional) Lifecycle rule: e.g. transition to `STANDARD_IA` after 90 days.

## 3. IAM user for the backend

1. IAM → **Users → Create user** → name `vehicle-survey-backend`.
2. Attach an inline policy scoped to your bucket:
  ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:HeadObject"],
         "Resource": "arn:aws:s3:::vehicle-surveys-prod-acme/*"
       },
       {
         "Effect": "Allow",
         "Action": ["s3:ListBucket"],
         "Resource": "arn:aws:s3:::vehicle-surveys-prod-acme"
       }
     ]
   }
  ```
3. Create an **Access key** for this user (use case: "Application running outside AWS"). Save the key + secret — you'll only see them once.

## 4. EC2 host for the backend

1. Launch an EC2 (Ubuntu 24.04, t3.small, 20 GB EBS).
2. Security Group: open 22 (your IP), 80, 443.
3. SSH in and install Docker:
  ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
   sudo usermod -aG docker $USER && newgrp docker
  ```
4. Clone this repo and create the env file:
  ```bash
   git clone <your-repo-url> ~/vehicle-survey-app
   cd ~/vehicle-survey-app
   cp backend/.env.example backend/.env
   nano backend/.env
  ```
   Fill in:
  - `MONGODB_URI` from step 1
  - `JWT_SECRET` (32+ random chars; `openssl rand -base64 48`)
  - `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` from steps 2-3
  - `CORS_ORIGINS=https://admin.example.com`
  - `BOOTSTRAP_ADMIN_PASSWORD` — choose a strong one
5. Build and start the backend:
  ```bash
   docker build -t vehicle-survey-backend ./backend
   docker run -d --name vs-backend --restart unless-stopped \
     --env-file backend/.env -p 127.0.0.1:4000:4000 \
     vehicle-survey-backend
   docker exec vs-backend node src/scripts/seedAdmin.js
  ```
6. nginx reverse proxy: create `/etc/nginx/sites-available/api.example.com`:
  ```nginx
   server {
     server_name api.example.com;
     client_max_body_size 50M;
     location / {
       proxy_pass http://127.0.0.1:4000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_read_timeout 300;
     }
   }
  ```

## 5. Admin portal on Vercel (recommended)

1. Push the repo to GitHub/GitLab.
2. Vercel → **New Project** → import the repo → set **Root Directory** to `admin/`.
3. Build & Output settings: defaults are fine (Next.js auto-detected).
4. Environment Variables (Project → Settings → Environment Variables):
  - `API_BASE_URL=https://api.example.com/api/v1`
  - `SESSION_COOKIE_MAX_AGE=604800`
  - `NEXT_PUBLIC_GOOGLE_MAPS_KEY=<your key>`
5. Deploy. Then add your custom domain (`admin.example.com`).
6. Go back to the backend `.env` and update `CORS_ORIGINS` to the actual admin URL, then `docker restart vs-backend`.

### Alternative: admin on the same EC2

```bash
docker build -t vehicle-survey-admin ./admin
docker run -d --name vs-admin --restart unless-stopped \
  -e API_BASE_URL=http://127.0.0.1:4000/api/v1 \
  -e SESSION_COOKIE_MAX_AGE=604800 \
  -e NEXT_PUBLIC_GOOGLE_MAPS_KEY=<key> \
  -p 127.0.0.1:3001:3001 vehicle-survey-admin
```

Then add an nginx vhost for `admin.example.com` → `proxy_pass http://127.0.0.1:3001`.

## 6. Mobile app pointing at production

When building the APK, override the API URL:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com/api/v1
```

See `[MOBILE_BUILD.md](./MOBILE_BUILD.md)` for signing.

## 7. Smoke test checklist

- `curl https://api.example.com/health` returns `{"status":"ok"}`
- `https://api.example.com/api/docs` loads the Swagger UI
- Admin login at `https://admin.example.com/login` works with the bootstrap admin
- Create a surveyor from the admin portal
- Mobile APK: login as that surveyor, capture a survey with a photo, confirm it lands in the admin portal
- Admin survey detail page shows the photo gallery and a map pin
- "Download ZIP" on a survey produces a valid `.zip`

## 8. Hardening (do this once)

- MongoDB Atlas Network Access: remove `0.0.0.0/0`, allow only your EC2 IP
- Rotate `BOOTSTRAP_ADMIN_PASSWORD` immediately after first login
- Set up automated EBS snapshots (or Atlas snapshots) for backups
- Configure CloudWatch logs / Datadog for the backend container
- Restrict the Google Maps API key to your admin domain

