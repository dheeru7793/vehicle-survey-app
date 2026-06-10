import 'package:flutter/material.dart';

import '../screens/drafts_screen.dart';
import '../screens/home_screen.dart';
import '../screens/login_screen.dart';
import '../screens/new_survey_screen.dart';
import '../screens/photo_preview_screen.dart';
import '../screens/splash_screen.dart';
import '../screens/survey_detail_screen.dart';
import '../screens/survey_history_screen.dart';

class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const home = '/home';
  static const newSurvey = '/new-survey';
  static const photoPreview = '/photo-preview';
  static const history = '/history';
  static const drafts = '/drafts';
  static const surveyDetail = '/survey-detail';

  static Map<String, WidgetBuilder> map() => {
        splash: (_) => const SplashScreen(),
        login: (_) => const LoginScreen(),
        home: (_) => const HomeScreen(),
        newSurvey: (_) => const NewSurveyScreen(),
        photoPreview: (_) => const PhotoPreviewScreen(),
        history: (_) => const SurveyHistoryScreen(),
        drafts: (_) => const DraftsScreen(),
        surveyDetail: (_) => const SurveyDetailScreen(),
      };
}
