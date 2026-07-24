import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/patient_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class PatientDetailScreen extends StatelessWidget {
  const PatientDetailScreen({super.key});

  static const String routeName = '/patient-detail';

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PatientProvider>();
    final patient = provider.selectedPatient;

    if (patient == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Patient')),
        body: const Center(child: Text('No patient selected')),
      );
    }

    final initials = '${patient.firstName[0]}${patient.lastName[0]}'
        .toUpperCase();
    final dobStr = patient.dob != null
        ? DateFormat('MMM d, yyyy').format(patient.dob!)
        : 'N/A';

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('Patient Details'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.headline,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // Navigate to edit screen
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar & Name
            CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.areaCardIconBg,
              child: Text(
                initials,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryTeal,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(patient.fullName, style: AppTextStyles.greeting),
            if (patient.email != null)
              Text(patient.email!, style: AppTextStyles.bodyText),
            const SizedBox(height: 24),

            // Info Cards
            _buildInfoRow(Icons.email, 'Email', patient.email ?? 'N/A'),
            _buildInfoRow(Icons.phone, 'Phone', patient.phone ?? 'N/A'),
            _buildInfoRow(Icons.cake, 'Date of Birth', dobStr),
            _buildInfoRow(
              Icons.calendar_month,
              'Registered',
              DateFormat('MMM d, yyyy').format(patient.createdAt),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primaryTeal),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.cardSubText),
                Text(value, style: AppTextStyles.cardHeading),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
