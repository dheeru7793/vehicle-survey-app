/// Build-time configuration. Override via `--dart-define=API_BASE_URL=...`.
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api/v1',
  );

  static const String hiveBoxDraft = 'drafts';
  static const String hiveBoxSurveys = 'surveys';
  static const String hiveBoxPhotos = 'photos';

  static const String secureTokenKey = 'auth_token';
  static const String secureUserKey = 'auth_user';

  static const int maxPhotosPerSurvey = 200;
  static const int targetPhotoQuality = 78; // 70-90% reduction
  static const int targetPhotoMaxWidth = 1920;
  static const int draftAutoSaveDebounceMs = 500;
}
