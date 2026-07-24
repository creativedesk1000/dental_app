import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

import '../providers/appointment_provider.dart';
import 'package:intl/intl.dart';

class PatientDashboardScreen extends StatelessWidget {
  const PatientDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    final appointmentProvider = context.watch<AppointmentProvider>();
    final upcomingAppointments = appointmentProvider.appointments
        .where((a) => a.isScheduled && a.date.isAfter(DateTime.now()))
        .toList()
      ..sort((a, b) => a.date.compareTo(b.date));

    final nextAppointment = upcomingAppointments.isNotEmpty ? upcomingAppointments.first : null;

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Welcome, ${user?.name ?? 'Patient'}',
          style: AppTextStyles.greeting,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Upcoming Appointment Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryTeal, AppColors.navBarBg],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Next Appointment',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (nextAppointment != null) ...[
                    Text(
                      'Dr. ${nextAppointment.doctor?.name ?? 'Unknown Doctor'}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${DateFormat('MMM d, yyyy').format(nextAppointment.date)} at ${DateFormat('h:mm a').format(nextAppointment.date)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primaryTeal,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('View Details'),
                    ),
                  ] else ...[
                    const Text(
                      'No Upcoming Appointments',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Book a new appointment to see it here.',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Quick Actions
            Text('Quick Actions', style: AppTextStyles.pageSectionHeading),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.calendar_month,
                    label: 'Book\nAppointment',
                    onTap: () {
                      Navigator.pushNamed(context, '/appointment-form');
                    },
                  ),
                ),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.receipt_long,
                    label: 'Medical\nRecords',
                    onTap: () {},
                  ),
                ),
                Expanded(
                  child: _QuickActionButton(
                    icon: Icons.chat_bubble_outline,
                    label: 'Chat/\nMessages',
                    onTap: () {},
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            
            // Dental Tips
            Text('Daily Dental Tips', style: AppTextStyles.pageSectionHeading),
            const SizedBox(height: 16),
            ..._buildDentalTips(),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildDentalTips() {
    final tips = [
      {'icon': Icons.clean_hands, 'title': 'Keep your teeth clean', 'desc': 'Brush and rinse thoroughly.'},
      {'icon': Icons.access_time, 'title': 'Brush twice daily', 'desc': 'Morning and before bed is best.'},
      {'icon': Icons.medical_services, 'title': 'Floss every day', 'desc': 'Remove plaque between teeth.'},
      {'icon': Icons.local_drink, 'title': 'Avoid sugary drinks', 'desc': 'Water is the best choice.'},
      {'icon': Icons.shield, 'title': 'Protect your teeth', 'desc': 'Wear a mouthguard for sports.'},
      {'icon': Icons.calendar_today, 'title': 'Visit your dentist', 'desc': 'Regular checkups prevent issues.'},
    ];

    return tips.map((tip) {
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryTeal.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(tip['icon'] as IconData, color: AppColors.primaryTeal, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tip['title'] as String,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    tip['desc'] as String,
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }).toList();
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: AppColors.primaryTeal, size: 28),
          ),
          const SizedBox(height: 10),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}
