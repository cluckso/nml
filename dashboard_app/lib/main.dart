import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'config/env.dart';
import 'app.dart';
import 'services/auth_service.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }
  runApp(const CallGrabbrDashboardApp());
}

class CallGrabbrDashboardApp extends StatelessWidget {
  const CallGrabbrDashboardApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthService();
    return MultiProvider(
      providers: [
        Provider<AuthService>.value(value: auth),
        Provider<ApiService>(create: (_) => ApiService(auth)),
      ],
      child: MaterialApp(
        title: 'CallGrabbr Dashboard',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: const AppShell(),
      ),
    );
  }
}
