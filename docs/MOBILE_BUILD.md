# Mobile build & signing (Android)

## Prerequisites

- Flutter 3.22+ (`flutter --version`)
- Android SDK / cmdline tools (Android Studio installs both)
- A connected device or running emulator (`adb devices` shows at least one)

## First-time setup

Run this ONCE after cloning, to let Flutter populate binary assets we can't
commit to git (gradle wrapper jar, default launcher icons, `.gradle/`):

```bash
cd mobile
flutter create . --platforms=android --org com.example --project-name vehicle_survey
flutter pub get
```

`flutter create` is non-destructive — it adds missing files but won't overwrite
your `lib/`, `pubspec.yaml`, `AndroidManifest.xml`, or `build.gradle`.

## Local dev

```bash
cd mobile
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

`10.0.2.2` is the Android emulator's alias for your host's `localhost`. On a real
device on the same Wi-Fi as your laptop, use your laptop's LAN IP, e.g.
`--dart-define=API_BASE_URL=http://192.168.1.50:4000/api/v1`.

If you're testing against a deployed backend, point to its public URL:

```bash
flutter run --dart-define=API_BASE_URL=https://api.example.com/api/v1
```

## Debug APK (sideload for testing)

```bash
flutter build apk --debug --dart-define=API_BASE_URL=https://api.example.com/api/v1
# Output: build/app/outputs/flutter-apk/app-debug.apk
```

Send the APK to the surveyor; they install it by allowing "Install unknown apps"
in Android settings.

## Release APK (signed)

1. **Generate a keystore** (do this ONCE, keep it forever):
  ```bash
   keytool -genkey -v -keystore ~/vehicle-survey-upload.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias upload
  ```
2. Create `mobile/android/key.properties` (gitignored):
  ```
   storeFile=/Users/you/vehicle-survey-upload.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
  ```
3. Build:
  ```bash
   cd mobile
   flutter build apk --release \
     --dart-define=API_BASE_URL=https://api.example.com/api/v1
   # Output: build/app/outputs/flutter-apk/app-release.apk
  ```
4. (Optional) AAB for the Play Store:
  ```bash
   flutter build appbundle --release \
     --dart-define=API_BASE_URL=https://api.example.com/api/v1
  ```

## Distribution

For 5 surveyors, sideloading the signed `app-release.apk` is the simplest path:

1. Host the APK on a private URL (S3 with a signed URL, Google Drive link, etc.).
2. Each surveyor downloads + installs it on their phone.
3. To push an update, build a new APK with the same keystore and send the new
  link. Android will recognize it as an upgrade.

For 50+ surveyors, use Google Play Console **Internal testing** track instead.