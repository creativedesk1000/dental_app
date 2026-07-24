import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/appointment_provider.dart';
import '../models/appointment.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class AppointmentDetailScreen extends StatelessWidget {
  const AppointmentDetailScreen({super.key});

  static const String routeName = '/appointment-detail';

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppointmentProvider>();
    final apt = provider.selectedAppointment;

    if (apt == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Appointment')),
        body: const Center(child: Text('No appointment selected')),
      );
    }

    final time = DateFormat('h:mm a').format(apt.date);
    final date = DateFormat('EEEE, MMMM d, yyyy').format(apt.date);

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('Appointment Details'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.headline,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: _statusColor(apt.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  apt.statusLabel,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: _statusColor(apt.status),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            _buildInfoCard(
              icon: Icons.person,
              title: 'Patient',
              subtitle: apt.patient?.fullName ?? 'Unknown',
            ),
            const SizedBox(height: 12),
            _buildInfoCard(
              icon: Icons.medical_services,
              title: 'Doctor',
              subtitle: apt.doctor?.name ?? 'Unknown',
            ),
            const SizedBox(height: 12),
            _buildInfoCard(
              icon: Icons.calendar_today,
              title: 'Date & Time',
              subtitle: '$date at $time',
            ),
            if (apt.notes != null && apt.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              _buildInfoCard(
                icon: Icons.notes,
                title: 'Notes',
                subtitle: apt.notes!,
              ),
            ],
            const SizedBox(height: 24),
            if (apt.isScheduled) ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        provider.updateAppointment(
                          apt.id,
                          UpdateAppointmentRequest(status: 'COMPLETED'),
                        );
                        Navigator.of(context).pop();
                      },
                      icon: const Icon(Icons.check),
                      label: const Text('Complete'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        provider.updateAppointment(
                          apt.id,
                          UpdateAppointmentRequest(status: 'CANCELLED'),
                        );
                        Navigator.of(context).pop();
                      },
                      icon: const Icon(Icons.close),
                      label: const Text('Cancel'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.areaCardIconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primaryTeal, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.cardSubText),
                const SizedBox(height: 2),
                Text(subtitle, style: AppTextStyles.cardHeading),
              ],
            ),
          ),
        ],
      ),
    );
  }

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
}
