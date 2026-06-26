import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  SupabaseClient get _client {
    if (!Supabase.isInitialized) {
      throw StateError('Supabase not initialized. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return Supabase.instance.client;
  }

  User? get currentUser => _client.auth.currentUser;
  Session? get currentSession => _client.auth.currentSession;

  /// Access token for API calls (Bearer).
  String? get accessToken => _client.auth.currentSession?.accessToken;

  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  Future<AuthResponse> signIn(String email, String password) {
    return _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<AuthResponse> signUp(String email, String password) {
    return _client.auth.signUp(email: email, password: password);
  }

  Future<void> signOut() => _client.auth.signOut();
}
