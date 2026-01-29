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

  Future<CallsResponse> getCalls({int page = 1, int limit = 20}) async {
    final uri = Uri.parse('${_base}api/calls').replace(
      queryParameters: {'page': '$page', 'limit': '$limit'},
    );
    final res = await http.get(uri, headers: _headers);
    if (res.statusCode == 401) throw ApiException('Unauthorized', 401);
    if (res.statusCode != 200) throw ApiException(res.body, res.statusCode);
    return CallsResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
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
