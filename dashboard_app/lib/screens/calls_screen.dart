import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class CallsScreen extends StatefulWidget {
  const CallsScreen({super.key});

  @override
  State<CallsScreen> createState() => _CallsScreenState();
}

class _CallsScreenState extends State<CallsScreen> {
  List<CallItem> _calls = [];
  bool _loading = true;
  String? _error;
  int _page = 1;
  bool _hasMore = true;
  bool _loadingMore = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _page = 1;
    });
    await _fetchPage(1);
  }

  Future<void> _fetchPage(int page) async {
    if (page > 1) setState(() => _loadingMore = true);
    try {
      final api = context.read<ApiService>();
      final res = await api.getCalls(page: page, limit: 20);
      if (!mounted) return;
      setState(() {
        if (page == 1) {
          _calls = res.calls;
        } else {
          _calls = [..._calls, ...res.calls];
        }
        _hasMore = (res.pagination?.totalPages ?? 0) > page;
        _page = page;
        _loading = false;
        _loadingMore = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
        _loadingMore = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
        _loadingMore = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Calls'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
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
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _load,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _calls.isEmpty
                  ? const Center(child: Text('No calls yet.'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _calls.length + (_hasMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == _calls.length) {
                            if (!_loadingMore && _hasMore) {
                              _fetchPage(_page + 1);
                            }
                            return const Padding(
                              padding: EdgeInsets.all(16),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          }
                          final c = _calls[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              title: Text(
                                c.callerName ?? c.callerPhone ?? 'Unknown',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (c.issueDescription != null)
                                    Text(
                                      c.issueDescription!,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  if (c.createdAt != null)
                                    Text(
                                      _formatDate(c.createdAt!),
                                      style: Theme.of(context).textTheme.bodySmall,
                                    ),
                                ],
                              ),
                              trailing: c.emergencyFlag
                                  ? const Icon(Icons.warning_amber, color: Colors.red)
                                  : null,
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  String _formatDate(String iso) {
    try {
      final d = DateTime.parse(iso);
      return DateFormat.yMd().add_Hm().format(d);
    } catch (_) {
      return iso;
    }
  }
}
