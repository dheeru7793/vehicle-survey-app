import 'package:hive/hive.dart';

import '../core/constants.dart';
import '../models/survey.dart';
import '../services/api_service.dart';

class SurveyRepository {
  final ApiService api;

  SurveyRepository(this.api);

  Box<Survey> get _box => Hive.box<Survey>(AppConfig.hiveBoxSurveys);

  Future<void> enqueueForSync(Survey s) async {
    s.status = SurveyStatus.pending;
    await _box.put(s.clientId, s);
  }

  List<Survey> localAll() => _box.values.toList()
    ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  Future<List<Map<String, dynamic>>> remoteHistory({
    String? vehicleNumber,
    int page = 1,
    int limit = 20,
  }) async {
    final res = await api.dio.get('/surveys', queryParameters: {
      if (vehicleNumber != null && vehicleNumber.isNotEmpty) 'vehicleNumber': vehicleNumber,
      'page': page,
      'limit': limit,
      'sort': 'createdAt',
      'order': 'desc',
    });
    return (res.data['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> duplicateCheck(String vehicleNumber) async {
    final res = await api.dio.get(
      '/surveys/duplicate-check',
      queryParameters: {'vehicleNumber': vehicleNumber},
    );
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<Map<String, dynamic>>> remotePhotos(String surveyId) async {
    final res = await api.dio.get('/surveys/$surveyId/photos');
    return (res.data['items'] as List).cast<Map<String, dynamic>>();
  }
}
