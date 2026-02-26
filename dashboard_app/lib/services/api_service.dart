import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env.dart';
import 'auth_service.dart';

class ApiService {
  ApiService(this._auth);

  final AuthService _auth;

  String get _base => apiBaseUrl.endsWith('/') ? apiBaseUrl : '$apiBaseUrl/';

  Map<String, String> get _headers {
    final token = _auth.accessToken;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<DashboardResponse> getDashboard() async {
    final res = await http.get(
      Uri.parse('${_base}api/dashboard'),
      headers: _headers,
    );
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    return DashboardResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<CallsResponse> getCalls({int page = 1, int limit = 20, String? search, bool? emergency}) async {
    final params = <String, String>{'page': '$page', 'limit': '$limit'};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (emergency == true) params['emergency'] = 'true';
    final uri = Uri.parse('${_base}api/calls').replace(queryParameters: params);
    final res = await http.get(uri, headers: _headers);
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    return CallsResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<SettingsResponse> getSettings() async {
    final res = await http.get(Uri.parse('${_base}api/settings'), headers: _headers);
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    return SettingsResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<SettingsResponse> patchSettings(Map<String, dynamic> body) async {
    final res = await http.patch(
      Uri.parse('${_base}api/settings'),
      headers: _headers,
      body: jsonEncode(body),
    );
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    // PATCH returns { settings, verified, notificationPhone?, smsConsent? }
    return SettingsResponse(
      settings: data['settings'] as Map<String, dynamic>?,
      allowedSections: null,
      planType: null,
      notificationPhone: data['notificationPhone'] as String?,
      smsConsent: data['smsConsent'] as bool? ?? false,
    );
  }

  Future<AppointmentsResponse> getAppointments({DateTime? from, DateTime? to, String? status}) async {
    final params = <String, String>{};
    if (from != null) params['from'] = from.toIso8601String();
    if (to != null) params['to'] = to.toIso8601String();
    if (status != null) params['status'] = status;
    final uri = Uri.parse('${_base}api/appointments').replace(queryParameters: params.isNotEmpty ? params : null);
    final res = await http.get(uri, headers: _headers);
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    return AppointmentsResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<AppointmentItem> createAppointment({
    String? callerName,
    String? callerPhone,
    required DateTime scheduledAt,
    int durationMinutes = 60,
    String? issueDescription,
    String? notes,
  }) async {
    final body = {
      'callerName': callerName,
      'callerPhone': callerPhone,
      'scheduledAt': scheduledAt.toIso8601String(),
      'durationMinutes': durationMinutes,
      'issueDescription': issueDescription,
      'notes': notes,
    };
    final res = await http.post(
      Uri.parse('${_base}api/appointments'),
      headers: _headers,
      body: jsonEncode(body),
    );
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return AppointmentItem.fromJson(data['appointment'] as Map<String, dynamic>);
  }

  Future<void> cancelAppointment(String id) async {
    final res = await http.delete(Uri.parse('${_base}api/appointments/$id'), headers: _headers);
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
  }
}

class ApiException implements Exception {
  ApiException(this.message, this.statusCode);
  final String message;
  final int statusCode;
  @override
  String toString() => 'ApiException($statusCode): $message';
}

class DashboardResponse {
  DashboardResponse({
    this.business,
    this.recentCalls,
    this.stats,
    this.hasAgent,
  });

  factory DashboardResponse.fromJson(Map<String, dynamic> json) {
    return DashboardResponse(
      business: json['business'] != null
          ? BusinessSummary.fromJson(json['business'] as Map<String, dynamic>)
          : null,
      recentCalls: (json['recentCalls'] as List<dynamic>?)
          ?.map((e) => CallItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      stats: json['stats'] != null
          ? DashboardStats.fromJson(json['stats'] as Map<String, dynamic>)
          : null,
      hasAgent: json['hasAgent'] as bool? ?? false,
    );
  }

  final BusinessSummary? business;
  final List<CallItem>? recentCalls;
  final DashboardStats? stats;
  final bool hasAgent;
}

class BusinessSummary {
  BusinessSummary({this.id, this.name, this.phoneNumber, this.retellAgentId});
  factory BusinessSummary.fromJson(Map<String, dynamic> json) {
    return BusinessSummary(
      id: json['id'] as String?,
      name: json['name'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      retellAgentId: json['retellAgentId'] as String?,
    );
  }
  final String? id;
  final String? name;
  final String? phoneNumber;
  final String? retellAgentId;
}

class DashboardStats {
  DashboardStats({
    this.totalCalls = 0,
    this.totalMinutes = 0,
    this.emergencyInRecent = 0,
  });
  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalCalls: (json['totalCalls'] as num?)?.toInt() ?? 0,
      totalMinutes: (json['totalMinutes'] as num?)?.toDouble() ?? 0,
      emergencyInRecent: (json['emergencyInRecent'] as num?)?.toInt() ?? 0,
    );
  }
  final int totalCalls;
  final double totalMinutes;
  final int emergencyInRecent;
}

class CallsResponse {
  CallsResponse({this.calls = const [], this.pagination});

  factory CallsResponse.fromJson(Map<String, dynamic> json) {
    return CallsResponse(
      calls: (json['calls'] as List<dynamic>?)
              ?.map((e) => CallItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      pagination: json['pagination'] != null
          ? Pagination.fromJson(json['pagination'] as Map<String, dynamic>)
          : null,
    );
  }

  final List<CallItem> calls;
  final Pagination? pagination;
}

class Pagination {
  Pagination({this.page = 1, this.limit = 20, this.total = 0, this.totalPages = 0});
  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 20,
      total: (json['total'] as num?)?.toInt() ?? 0,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? 0,
    );
  }
  final int page;
  final int limit;
  final int total;
  final int totalPages;
}

class SettingsResponse {
  SettingsResponse({this.settings, this.allowedSections, this.planType, this.notificationPhone, this.smsConsent});
  factory SettingsResponse.fromJson(Map<String, dynamic> json) {
    return SettingsResponse(
      settings: json['settings'] as Map<String, dynamic>?,
      allowedSections: (json['allowedSections'] as List<dynamic>?)?.cast<String>(),
      planType: json['planType'] as String?,
      notificationPhone: json['notificationPhone'] as String?,
      smsConsent: json['smsConsent'] as bool? ?? false,
    );
  }
  final Map<String, dynamic>? settings;
  final List<String>? allowedSections;
  final String? planType;
  final String? notificationPhone;
  final bool smsConsent;
}

class AppointmentsResponse {
  AppointmentsResponse({this.appointments = const []});
  factory AppointmentsResponse.fromJson(Map<String, dynamic> json) {
    return AppointmentsResponse(
      appointments: (json['appointments'] as List<dynamic>?)
              ?.map((e) => AppointmentItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
  final List<AppointmentItem> appointments;
}

class AppointmentItem {
  AppointmentItem({
    this.id,
    this.callerName,
    this.callerPhone,
    this.scheduledAt,
    this.durationMinutes = 60,
    this.status,
    this.issueDescription,
    this.notes,
  });
  factory AppointmentItem.fromJson(Map<String, dynamic> json) {
    return AppointmentItem(
      id: json['id'] as String?,
      callerName: json['callerName'] as String?,
      callerPhone: json['callerPhone'] as String?,
      scheduledAt: json['scheduledAt'] as String?,
      durationMinutes: (json['durationMinutes'] as num?)?.toInt() ?? 60,
      status: json['status'] as String?,
      issueDescription: json['issueDescription'] as String?,
      notes: json['notes'] as String?,
    );
  }
  final String? id;
  final String? callerName;
  final String? callerPhone;
  final String? scheduledAt;
  final int durationMinutes;
  final String? status;
  final String? issueDescription;
  final String? notes;
}

class CallItem {
  CallItem({
    this.id,
    this.callerName,
    this.callerPhone,
    this.issueDescription,
    this.summary,
    this.emergencyFlag,
    this.leadTag,
    this.minutes,
    this.createdAt,
  });

  factory CallItem.fromJson(Map<String, dynamic> json) {
    return CallItem(
      id: json['id'] as String?,
      callerName: json['callerName'] as String?,
      callerPhone: json['callerPhone'] as String?,
      issueDescription: json['issueDescription'] as String?,
      summary: json['summary'] as String?,
      emergencyFlag: json['emergencyFlag'] as bool? ?? false,
      leadTag: json['leadTag'] as String?,
      minutes: (json['minutes'] as num?)?.toDouble(),
      createdAt: json['createdAt'] as String?,
    );
  }

  final String? id;
  final String? callerName;
  final String? callerPhone;
  final String? issueDescription;
  final String? summary;
  final bool emergencyFlag;
  final String? leadTag;
  final double? minutes;
  final String? createdAt;
}
