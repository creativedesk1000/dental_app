import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/doctor_provider.dart';
import '../providers/auth_provider.dart';
import '../models/doctor.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';

class DoctorLeaveScreen extends StatefulWidget {
  const DoctorLeaveScreen({super.key});

  static const String routeName = '/doctor-leave';

  @override
  State<DoctorLeaveScreen> createState() => _DoctorLeaveScreenState();
}

class _DoctorLeaveScreenState extends State<DoctorLeaveScreen> {
  @override
  void initState() {
    super.initState();
    _loadLeaves();
  }

  Future<void> _loadLeaves() async {
    final authProvider = context.read<AuthProvider>();
    final doctorId = authProvider.user?.id;
    if (doctorId != null) {
      await context.read<DoctorProvider>().loadLeaves(doctorId);
    }
  }

  void _showLeaveForm() {
    final formKey = GlobalKey<FormState>();
    DateTime? startDate;
    DateTime? endDate;
    String? reason;
    String leaveType = 'OTHER';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        StatefulBuilder builder = StatefulBuilder(
          builder: (context, setModalState) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 20,
              right: 20,
              top: 20,
            ),
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Request Leave',
                    style: AppTextStyles.authHeadline.copyWith(fontSize: 24),
                  ),
                  const SizedBox(height: 20),
                  Text('Leave Type', style: AppTextStyles.fieldLabel),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: leaveType,
                    items: const [
                      DropdownMenuItem(
                        value: 'VACATION',
                        child: Text('Vacation'),
                      ),
                      DropdownMenuItem(
                        value: 'SICK',
                        child: Text('Sick Leave'),
                      ),
                      DropdownMenuItem(
                        value: 'PERSONAL',
                        child: Text('Personal'),
                      ),
                      DropdownMenuItem(value: 'OTHER', child: Text('Other')),
                    ],
                    onChanged: (v) =>
                        setModalState(() => leaveType = v ?? 'OTHER'),
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text('Start Date', style: AppTextStyles.fieldLabel),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (picked != null) {
                        setModalState(() => startDate = picked);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.fieldBorder),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.calendar_today,
                            color: AppColors.fieldHint,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            startDate != null
                                ? DateFormat('MMM d, yyyy').format(startDate!)
                                : 'Select start date',
                            style: AppTextStyles.fieldInput,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text('End Date', style: AppTextStyles.fieldLabel),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: endDate ?? startDate ?? DateTime.now(),
                        firstDate: startDate ?? DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (picked != null) {
                        setModalState(() => endDate = picked);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.fieldBorder),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.calendar_today,
                            color: AppColors.fieldHint,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            endDate != null
                                ? DateFormat('MMM d, yyyy').format(endDate!)
                                : 'Select end date',
                            style: AppTextStyles.fieldInput,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Reason (Optional)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                    onChanged: (v) => reason = v,
                  ),
                  const SizedBox(height: 24),
                  PrimaryAppButton(
                    label: 'Submit Request',
                    onPressed: () async {
                      if (startDate == null || endDate == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please select dates')),
                        );
                        return;
                      }
                      final authProvider = context.read<AuthProvider>();
                      final doctorId = authProvider.user?.id;
                      if (doctorId == null) return;

                      final request = CreateLeaveRequest(
                        startDate: DateFormat('yyyy-MM-dd').format(startDate!),
                        endDate: DateFormat('yyyy-MM-dd').format(endDate!),
                        reason: reason,
                        type: leaveType,
                      );

                      final success = await context
                          .read<DoctorProvider>()
                          .createLeave(doctorId, request);

                      if (context.mounted) {
                        Navigator.of(context).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              success
                                  ? 'Leave requested'
                                  : 'Failed to create leave',
                            ),
                            backgroundColor: success
                                ? Colors.green
                                : Colors.red,
                          ),
                        );
                      }
                    },
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        );
        return builder;
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DoctorProvider>();

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('Leave Management'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.headline,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showLeaveForm,
        backgroundColor: AppColors.primaryTeal,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadLeaves,
              child: provider.leaves.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.event_busy,
                            size: 64,
                            color: AppColors.fieldHint,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No leave requests',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text('Tap + to request leave'),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: provider.leaves.length,
                      itemBuilder: (context, index) {
                        final leave = provider.leaves[index];
                        return _LeaveCard(leave: leave);
                      },
                    ),
            ),
    );
  }
}

class _LeaveCard extends StatelessWidget {
  final Leave leave;
  const _LeaveCard({required this.leave});

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'APPROVED':
        return Colors.green;
      case 'REJECTED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: _statusColor(leave.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              leave.type == 'SICK'
                  ? Icons.medical_services
                  : leave.type == 'VACATION'
                  ? Icons.flight
                  : Icons.event,
              color: _statusColor(leave.status),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(leave.typeLabel, style: AppTextStyles.cardHeading),
                const SizedBox(height: 4),
                Text(
                  '${DateFormat('MMM d').format(leave.startDate)} - ${DateFormat('MMM d, yyyy').format(leave.endDate)}',
                  style: AppTextStyles.cardSubText,
                ),
                if (leave.reason != null)
                  Text(leave.reason!, style: AppTextStyles.cardSubText),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: _statusColor(leave.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              leave.statusLabel,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _statusColor(leave.status),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
