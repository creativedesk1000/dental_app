import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/appointment_provider.dart';
import '../theme/app_colors.dart';
import '../app_bottom_nav_bar.dart';
import 'doctor_dashboard_screen.dart';
import 'appointments_list_screen.dart';
import 'patients_list_screen.dart';
import 'profile_screen.dart';
import 'patient_dashboard_screen.dart';

import 'patient_appointments_screen.dart';

class HomeShellScreen extends StatefulWidget {
  const HomeShellScreen({super.key});

  static const String routeName = '/home-shell';

  @override
  State<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends State<HomeShellScreen> {
  int _currentIndex = 2; // Default to home/dashboard

  @override
  void initState() {
    super.initState();
    // Load dashboard stats on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadStats();
      final user = context.read<AuthProvider>().user;
      if (user?.isPatient ?? false) {
        context.read<AppointmentProvider>().loadAppointments();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    // Define navigation items based on role
    final isPatient = user?.isPatient ?? false;
    
    final screens = isPatient
      ? <Widget>[
          const PatientAppointmentsScreen(),
          const PlaceholderScreen(label: 'Medical Records'),
          const PatientDashboardScreen(),
          const PlaceholderScreen(label: 'Chat/Messages'),
          ProfileScreen(user: user),
        ]
      : <Widget>[
          const AppointmentsListScreen(),
          const PatientsListScreen(),
          const DoctorDashboardScreen(),
          const PlaceholderScreen(label: 'Treatments'),
          ProfileScreen(user: user),
        ];

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      body: SafeArea(
        bottom: false,
        child: IndexedStack(index: _currentIndex, children: screens),
      ),
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String label;
  const PlaceholderScreen({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.construction, size: 64, color: AppColors.primaryTeal),
          const SizedBox(height: 16),
          Text(
            label,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text('Coming soon'),
        ],
      ),
    );
  }
}
