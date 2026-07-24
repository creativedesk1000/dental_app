import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../models/dashboard.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../app_page_header.dart';

class DoctorDashboardScreen extends StatefulWidget {
  const DoctorDashboardScreen({super.key});

  @override
  State<DoctorDashboardScreen> createState() => _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends State<DoctorDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadStats();
    });
  }

  Future<void> _onRefresh() async {
    await context.read<DashboardProvider>().refresh();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isTablet = width >= 600;
    final double horizontalPadding = isTablet ? 32 : 20;
    final authProvider = context.watch<AuthProvider>();
    final dashboardProvider = context.watch<DashboardProvider>();
    final stats = dashboardProvider.stats;
    final userName = authProvider.user?.name ?? 'Doctor';
    final today = DateFormat('EEEE, MMMM d').format(DateTime.now());

    return RefreshIndicator(
      onRefresh: _onRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          horizontalPadding,
          12,
          horizontalPadding,
          12,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppPageHeader(name: userName),
            const SizedBox(height: 8),
            Text(today, style: AppTextStyles.bodyText),
            const SizedBox(height: 20),
            if (dashboardProvider.isLoading)
              const Center(child: CircularProgressIndicator())
            else if (dashboardProvider.error != null)
              _buildErrorCard(dashboardProvider.error!)
            else if (stats != null)
              ..._buildStatsGrid(stats),
            const SizedBox(height: 20),
            Text('Quick Actions', style: AppTextStyles.pageSectionHeading),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionCard(
                    icon: Icons.calendar_today,
                    label: 'Appointments',
                    onTap: () {},
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionCard(
                    icon: Icons.person_add,
                    label: 'New Patient',
                    onTap: () {},
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionCard(
                    icon: Icons.schedule,
                    label: 'My Schedule',
                    onTap: () {},
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionCard(
                    icon: Icons.bar_chart,
                    label: 'Statistics',
                    onTap: () {},
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard(String error) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade700),
          const SizedBox(width: 12),
          Expanded(
            child: Text(error, style: TextStyle(color: Colors.red.shade700)),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildStatsGrid(DashboardStats stats) {
    return [
      Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.people_outline,
              label: 'Patients',
              value: '${stats.totalPatients}',
              color: AppColors.iconSquareBlue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.calendar_today,
              label: "Today's Appts",
              value: '${stats.todayAppointments}',
              color: AppColors.primaryTeal,
            ),
          ),
        ],
      ),
      const SizedBox(height: 12),
      Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.medical_services_outlined,
              label: 'Doctors',
              value: '${stats.doctors}',
              color: AppColors.iconSquareBlue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.attach_money,
              label: 'Revenue',
              value: '\$${stats.revenue.toStringAsFixed(0)}',
              color: Colors.green,
            ),
          ),
        ],
      ),
    ];
  }

  Widget _buildActionCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      elevation: 1,
      shadowColor: AppColors.cardShadow,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(icon, size: 32, color: AppColors.primaryTeal),
              const SizedBox(height: 8),
              Text(label, style: AppTextStyles.tileLabel),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
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
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0E1726),
                  ),
                ),
                Text(label, style: AppTextStyles.cardSubText),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
