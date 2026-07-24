import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/appointment_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../app_page_header.dart';
import 'appointment_detail_screen.dart';
import 'appointment_form_screen.dart';

class AppointmentsListScreen extends StatefulWidget {
  const AppointmentsListScreen({super.key});

  @override
  State<AppointmentsListScreen> createState() => _AppointmentsListScreenState();
}

class _AppointmentsListScreenState extends State<AppointmentsListScreen> {
  String _statusFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadAppointments();
    });
  }

  Future<void> _loadAppointments() async {
    await context.read<AppointmentProvider>().loadAppointments(
      status: _statusFilter != 'ALL' ? _statusFilter : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isTablet = width >= 600;
    final double horizontalPadding = isTablet ? 32 : 20;
    final provider = context.watch<AppointmentProvider>();

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).pushNamed(AppointmentFormScreen.routeName);
        },
        backgroundColor: AppColors.primaryTeal,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                12,
                horizontalPadding,
                0,
              ),
              child: AppPageHeader(name: 'Appointments'),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children:
                      ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
                          .map(
                            (status) => Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                label: Text(
                                  status == 'ALL'
                                      ? 'All'
                                      : _statusLabel(status),
                                ),
                                selected: _statusFilter == status,
                                onSelected: (selected) {
                                  setState(() => _statusFilter = status);
                                  _loadAppointments();
                                },
                                selectedColor: AppColors.primaryTeal
                                    .withOpacity(0.2),
                                checkmarkColor: AppColors.primaryTeal,
                              ),
                            ),
                          )
                          .toList(),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadAppointments,
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.appointments.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: EdgeInsets.symmetric(
                          horizontal: horizontalPadding,
                        ),
                        itemCount: provider.appointments.length,
                        itemBuilder: (context, index) {
                          final apt = provider.appointments[index];
                          return _AppointmentCard(
                            appointment: apt,
                            onTap: () {
                              context
                                  .read<AppointmentProvider>()
                                  .loadAppointment(apt.id);
                              Navigator.of(
                                context,
                              ).pushNamed(AppointmentDetailScreen.routeName);
                            },
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_busy, size: 64, color: AppColors.fieldHint),
          const SizedBox(height: 16),
          const Text(
            'No appointments found',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text('Tap + to create a new appointment'),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NO_SHOW':
        return 'No Show';
      default:
        return status;
    }
  }
}

class _AppointmentCard extends StatelessWidget {
  final dynamic appointment;
  final VoidCallback onTap;

  const _AppointmentCard({required this.appointment, required this.onTap});

  Color _statusColor(String status) {
    switch (status) {
      case 'SCHEDULED':
        return AppColors.primaryTeal;
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      case 'NO_SHOW':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final time = DateFormat('h:mm a').format(appointment.date);
    final date = DateFormat('MMM d, yyyy').format(appointment.date);
    final patientName = appointment.patient?.fullName ?? 'Unknown';
    final doctorName = appointment.doctor?.name ?? 'Unknown';

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: _statusColor(appointment.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.calendar_month,
                  color: _statusColor(appointment.status),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(patientName, style: AppTextStyles.cardHeading),
                    const SizedBox(height: 4),
                    Text('$date at $time', style: AppTextStyles.cardSubText),
                    Text('Dr. $doctorName', style: AppTextStyles.cardSubText),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusColor(appointment.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  appointment.statusLabel,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: _statusColor(appointment.status),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
