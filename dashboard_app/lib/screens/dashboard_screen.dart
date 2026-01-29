import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/env.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import 'calls_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  DashboardResponse? _data;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = context.read<ApiService>();
      final res = await api.getDashboard();
      if (!mounted) return;
      setState(() {
        _data = res;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NeverMissLead Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _load,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await context.read<AuthService>().signOut();
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _load,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      if (_data?.business != null)
                        _Section(
                          title: 'Business',
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _data!.business!.name ?? '—',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              if (_data!.business!.phoneNumber != null)
                                Text(
                                  'AI number: ${_data!.business!.phoneNumber}',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              if (_data!.hasAgent)
                                Chip(
                                  label: const Text('Agent connected'),
                                  backgroundColor: Theme.of(context)
                                      .colorScheme
                                      .primaryContainer,
                                )
                              else
                                Text(
                                  'Complete setup on the web app to connect your AI agent.',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                            ],
                          ),
                        ),
                      if (_data?.stats != null) ...[
                        const SizedBox(height: 16),
                        _Section(
                          title: 'Usage',
                          child: Row(
                            children: [
                              Expanded(
                                child: _StatCard(
                                  label: 'Total calls',
                                  value: '${_data!.stats!.totalCalls}',
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _StatCard(
                                  label: 'Total minutes',
                                  value: '${_data!.stats!.totalMinutes.ceil()}',
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _StatCard(
                                  label: 'Emergency (recent)',
                                  value: '${_data!.stats!.emergencyInRecent}',
                                  isHighlight: _data!.stats!.emergencyInRecent > 0,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),
                      _Section(
                        title: 'Recent calls',
                        child: _data?.recentCalls == null ||
                                _data!.recentCalls!.isEmpty
                            ? const Text('No calls yet.')
                            : Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ..._data!.recentCalls!.take(5).map(
                                        (c) => ListTile(
                                          title: Text(
                                            c.callerName ?? c.callerPhone ?? 'Unknown',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          subtitle: Text(
                                            c.issueDescription ?? c.summary ?? '',
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          trailing: c.emergencyFlag
                                              ? const Icon(
                                                  Icons.warning_amber,
                                                  color: Colors.red,
                                                  size: 20,
                                                )
                                              : null,
                                        ),
                                      ),
                                  const SizedBox(height: 8),
                                  TextButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => const CallsScreen(),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.list),
                                    label: const Text('View all calls'),
                                  ),
                                ],
                              ),
                      ),
                      const SizedBox(height: 24),
                      OutlinedButton.icon(
                        onPressed: () {
                          // Open web dashboard in browser if needed
                          final url = apiBaseUrl;
                          // url_launcher could be used here
                        },
                        icon: const Icon(Icons.open_in_browser),
                        label: Text('Open web dashboard ($apiBaseUrl)'),
                      ),
                    ],
                  ),
                ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    this.isHighlight = false,
  });

  final String label;
  final String value;
  final bool isHighlight;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: isHighlight
          ? Theme.of(context).colorScheme.errorContainer.withOpacity(0.3)
          : null,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
