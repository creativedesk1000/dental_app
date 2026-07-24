import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import 'change_password_screen.dart';
import 'login_screen.dart';
import 'doctor_profile_screen.dart';
import 'doctor_schedule_screen.dart';
import 'doctor_leave_screen.dart';

class ProfileScreen extends StatelessWidget {
  final User? user;

  const ProfileScreen({super.key, this.user});

  static const String routeName = '/profile';

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final currentUser = user ?? authProvider.user;

    if (currentUser == null) {
      return const Center(child: Text('Not logged in'));
    }

    final initials = currentUser.initials;

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 20),
              // Avatar
              CircleAvatar(
                radius: 44,
                backgroundColor: AppColors.primaryTeal,
                child: Text(
                  initials,
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(currentUser.name ?? 'User', style: AppTextStyles.greeting),
              Text(currentUser.email ?? '', style: AppTextStyles.bodyText),
              if (currentUser.clinic != null)
                Text(
                  currentUser.clinic!.name,
                  style: AppTextStyles.bodyTextSmall,
                ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryTeal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _roleLabel(currentUser.role),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryTeal,
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Menu Items
              if (currentUser.isDoctor) ...[
                _menuItem(
                  icon: Icons.person,
                  label: 'My Profile',
                  onTap: () => Navigator.of(
                    context,
                  ).pushNamed(DoctorProfileScreen.routeName),
                ),
                _menuItem(
                  icon: Icons.schedule,
                  label: 'Working Hours',
                  onTap: () => Navigator.of(
                    context,
                  ).pushNamed(DoctorScheduleScreen.routeName),
                ),
                _menuItem(
                  icon: Icons.event_note,
                  label: 'Leave Management',
                  onTap: () => Navigator.of(
                    context,
                  ).pushNamed(DoctorLeaveScreen.routeName),
                ),
              ],
              _menuItem(
                icon: Icons.lock,
                label: 'Change Password',
                onTap: () => Navigator.of(
                  context,
                ).pushNamed(ChangePasswordScreen.routeName),
              ),
              _menuItem(icon: Icons.info_outline, label: 'About', onTap: () {}),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await authProvider.logout();
                    if (context.mounted) {
                      Navigator.of(context).pushNamedAndRemoveUntil(
                        LoginScreen.routeName,
                        (route) => false,
                      );
                    }
                  },
                  icon: const Icon(Icons.logout, color: Colors.red),
                  label: const Text(
                    'Logout',
                    style: TextStyle(color: Colors.red),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.red),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _menuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primaryTeal),
        title: Text(label, style: AppTextStyles.tileLabel),
        trailing: const Icon(Icons.chevron_right, color: AppColors.fieldHint),
        onTap: onTap,
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'DOCTOR':
        return 'Doctor';
      case 'RECEPTIONIST':
        return 'Receptionist';
      case 'CLINIC_ADMIN':
        return 'Clinic Admin';
      case 'SUPER_ADMIN':
        return 'Super Admin';
      default:
        return role;
    }
  }
}
