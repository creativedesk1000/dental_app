class DashboardStats {
  final int totalPatients;
  final int todayAppointments;
  final int doctors;
  final double revenue;
  final int activeUsers;

  DashboardStats({
    required this.totalPatients,
    required this.todayAppointments,
    required this.doctors,
    required this.revenue,
    required this.activeUsers,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalPatients: json['totalPatients'] as int? ?? 0,
      todayAppointments: json['todayAppointments'] as int? ?? 0,
      doctors: json['doctors'] as int? ?? 0,
      revenue: (json['revenue'] as num?)?.toDouble() ?? 0.0,
      activeUsers: json['activeUsers'] as int? ?? 0,
    );
  }
}
