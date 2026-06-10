import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';

import 'core/constants.dart';
import 'core/routes.dart';
import 'core/theme.dart';
import 'models/survey.dart';
import 'models/survey_photo.dart';
import 'providers/auth_provider.dart';
import 'providers/survey_provider.dart';
import 'providers/sync_provider.dart';
import 'repositories/auth_repository.dart';
import 'repositories/survey_repository.dart';
import 'services/api_service.dart';
import 'services/draft_service.dart';
import 'services/image_service.dart';
import 'services/secure_storage_service.dart';
import 'services/sync_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Hive.initFlutter();
  Hive.registerAdapter(SurveyAdapter());
  Hive.registerAdapter(SurveyPhotoAdapter());
  await Hive.openBox<Survey>(AppConfig.hiveBoxDraft);
  await Hive.openBox<Survey>(AppConfig.hiveBoxSurveys);

  final storage = SecureStorageService();
  final api = ApiService(storage);
  final image = ImageService();
  final draftService = DraftService();
  final authRepo = AuthRepository(api, storage);
  final surveyRepo = SurveyRepository(api);
  final syncService = SyncService(api, image);

  runApp(VehicleSurveyApp(
    storage: storage,
    api: api,
    imageService: image,
    draftService: draftService,
    authRepo: authRepo,
    surveyRepo: surveyRepo,
    syncService: syncService,
  ));
}

class VehicleSurveyApp extends StatelessWidget {
  final SecureStorageService storage;
  final ApiService api;
  final ImageService imageService;
  final DraftService draftService;
  final AuthRepository authRepo;
  final SurveyRepository surveyRepo;
  final SyncService syncService;

  const VehicleSurveyApp({
    super.key,
    required this.storage,
    required this.api,
    required this.imageService,
    required this.draftService,
    required this.authRepo,
    required this.surveyRepo,
    required this.syncService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<SecureStorageService>.value(value: storage),
        Provider<ApiService>.value(value: api),
        Provider<ImageService>.value(value: imageService),
        Provider<DraftService>.value(value: draftService),
        Provider<AuthRepository>.value(value: authRepo),
        Provider<SurveyRepository>.value(value: surveyRepo),
        Provider<SyncService>.value(value: syncService),
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepo)),
        ChangeNotifierProvider(
          create: (_) => SurveyProvider(
            draftService: draftService,
            repo: surveyRepo,
            imageService: imageService,
            syncService: syncService,
          ),
        ),
        ChangeNotifierProvider(create: (_) {
          final p = SyncProvider(syncService);
          syncService.start();
          return p;
        }),
      ],
      child: Builder(builder: (context) {
        api.onUnauthorized = () async {
          context.read<AuthProvider>().forceLogoutFrom401();
        };
        return MaterialApp(
          title: 'Vehicle Survey',
          theme: AppTheme.light(),
          initialRoute: AppRoutes.splash,
          routes: AppRoutes.map(),
        );
      }),
    );
  }
}
