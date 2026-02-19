/// API and Supabase config. Set via --dart-define or env.
/// Run: flutter run --dart-define=API_BASE_URL=https://www.callgrabbr.com --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);
const String supabaseUrl = String.fromEnvironment(
  'SUPABASE_URL',
  defaultValue: '',
);
const String supabaseAnonKey = String.fromEnvironment(
  'SUPABASE_ANON_KEY',
  defaultValue: '',
);
