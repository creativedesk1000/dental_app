import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../providers/appointment_provider.dart';
import '../models/appointment.dart';

class PatientAppointmentsScreen extends StatefulWidget {
  const PatientAppointmentsScreen({super.key});

  @override
  State<PatientAppointmentsScreen> createState() => _PatientAppointmentsScreenState();
}

class _PatientAppointmentsScreenState extends State<PatientAppointmentsScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.screenBg,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: Text(
            'My Appointments',
            style: AppTextStyles.pageSectionHeading.copyWith(fontSize: 20),
          ),
          bottom: const TabBar(
            labelColor: AppColors.primaryTeal,
            unselectedLabelColor: Colors.grey,
            indicatorColor: AppColors.primaryTeal,
            tabs: [
              Tab(text: 'Upcoming'),
              Tab(text: 'Previous'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _AppointmentsList(type: 'upcoming'),
            _AppointmentsList(type: 'previous'),
          ],
        ),
      ),
    );
  }
}

class _AppointmentsList extends StatelessWidget {
  final String type;
  
  const _AppointmentsList({required this.type});

  @override
  Widget build(BuildContext context) {
    final appointmentProvider = context.watch<AppointmentProvider>();
    
    if (appointmentProvider.isLoading && appointmentProvider.appointments.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    final isUpcoming = type == 'upcoming';
    final filteredAppointments = appointmentProvider.appointments.where((a) {
      if (isUpcoming) {
        return a.isScheduled && a.date.isAfter(DateTime.now());
      } else {
        return !a.isScheduled || a.date.isBefore(DateTime.now());
      }
    }).toList();

    if (isUpcoming) {
      filteredAppointments.sort((a, b) => a.date.compareTo(b.date));
    } else {
      filteredAppointments.sort((a, b) => b.date.compareTo(a.date)); // newest first
    }

    if (filteredAppointments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'No $type appointments',
              style: const TextStyle(fontSize: 16, color: Colors.grey, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: filteredAppointments.length,
      itemBuilder: (context, index) {
        final appointment = filteredAppointments[index];
        final isCompleted = appointment.status == 'COMPLETED';
        final isCancelled = appointment.status == 'CANCELLED';
        
        Color statusColor = AppColors.primaryTeal;
        Color statusBgColor = AppColors.primaryTeal.withValues(alpha: 0.1);
        
        if (isCompleted) {
          statusColor = Colors.green;
          statusBgColor = Colors.green.withValues(alpha: 0.1);
        } else if (isCancelled || appointment.isNoShow) {
          statusColor = Colors.red;
          statusBgColor = Colors.red.withValues(alpha: 0.1);
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      appointment.statusLabel,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Text(
                    _getTimeDifferenceText(appointment.date),
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Dr. ${appointment.doctor?.name ?? 'Unknown Doctor'}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  appointment.notes!,
                  style: const TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ],
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(DateFormat('MMM d, yyyy').format(appointment.date), style: const TextStyle(fontWeight: FontWeight.w500)),
                  const Spacer(),
                  const Icon(Icons.access_time, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(DateFormat('h:mm a').format(appointment.date), style: const TextStyle(fontWeight: FontWeight.w500)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  String _getTimeDifferenceText(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now);
    
    if (difference.isNegative) {
      final days = difference.inDays.abs();
      if (days == 0) return 'Today';
      if (days == 1) return 'Yesterday';
      return '$days days ago';
    } else {
      final days = difference.inDays;
      if (days == 0) return 'Today';
      if (days == 1) return 'Tomorrow';
      return 'In $days Days';
    }
  }
}
