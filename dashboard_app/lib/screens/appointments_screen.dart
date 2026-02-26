import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  List<AppointmentItem> _appointments = [];
  String? _error;
  bool _loading = true;
  DateTime _from = DateTime.now();
  DateTime _to = DateTime.now().add(const Duration(days: 14));

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
      final res = await api.getAppointments(from: _from, to: _to);
      if (!mounted) return;
      setState(() {
        _appointments = res.appointments;
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

  Future<void> _cancel(AppointmentItem a) async {
    if (a.id == null) return;
    if (!await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Cancel appointment?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('No'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Yes'),
              ),
            ],
          ),
        ) ??
        false) return;
    try {
      final api = context.read<ApiService>();
      await api.cancelAppointment(a.id!);
      if (!mounted) return;
      _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = _appointments.where((a) => a.status != 'CANCELLED').toList();
    active.sort((a, b) {
      final da = a.scheduledAt != null ? DateTime.tryParse(a.scheduledAt!) : null;
      final db = b.scheduledAt != null ? DateTime.tryParse(b.scheduledAt!) : null;
      if (da == null) return 1;
      if (db == null) return -1;
      return da.compareTo(db);
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loading ? null : _load),
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
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        FilledButton(onPressed: _load, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : active.isEmpty
                  ? const Center(child: Text('No upcoming appointments.'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: active.length,
                        itemBuilder: (context, i) {
                          final a = active[i];
                          final dt = a.scheduledAt != null ? DateTime.tryParse(a.scheduledAt!) : null;
                          final isCancelled = a.status == 'CANCELLED';
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              title: Text(
                                a.callerName ?? a.callerPhone ?? '—',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (dt != null)
                                    Text(
                                      DateFormat.yMMMd().add_Hm().format(dt),
                                      style: Theme.of(context).textTheme.bodySmall,
                                    ),
                                  if (a.issueDescription != null)
                                    Text(
                                      a.issueDescription!,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                ],
                              ),
                              trailing: !isCancelled
                                  ? IconButton(
                                      icon: const Icon(Icons.cancel_outlined),
                                      onPressed: () => _cancel(a),
                                    )
                                  : null,
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
