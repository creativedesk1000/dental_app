import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/doctor_provider.dart';
import '../providers/auth_provider.dart';
import '../models/doctor.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';

class DoctorScheduleScreen extends StatefulWidget {
  const DoctorScheduleScreen({super.key});

  static const String routeName = '/doctor-schedule';

  @override
  State<DoctorScheduleScreen> createState() => _DoctorScheduleScreenState();
}

class _DoctorScheduleScreenState extends State<DoctorScheduleScreen> {
  final Map<String, ScheduleInput> _scheduleInputs = {};
  bool _isLoading = false;

  static const _days = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  static const _dayLabels = {
    'MONDAY': 'Mon',
    'TUESDAY': 'Tue',
    'WEDNESDAY': 'Wed',
    'THURSDAY': 'Thu',
    'FRIDAY': 'Fri',
    'SATURDAY': 'Sat',
    'SUNDAY': 'Sun',
  };

  @override
  void initState() {
    super.initState();
    _loadSchedule();
  }

  Future<void> _loadSchedule() async {
    final authProvider = context.read<AuthProvider>();
    final doctorId = authProvider.user?.id;
    if (doctorId == null) return;

    await context.read<DoctorProvider>().loadWorkingHours(doctorId);
    final schedules = context.read<DoctorProvider>().schedules;

    setState(() {
      for (final day in _days) {
        final existing = schedules.where((s) => s.dayOfWeek == day).firstOrNull;
        _scheduleInputs[day] = ScheduleInput(
          dayOfWeek: day,
          startTime: existing?.startTime ?? '09:00',
          endTime: existing?.endTime ?? '17:00',
          isAvailable: existing?.isAvailable ?? false,
          slotDuration: existing?.slotDuration ?? 30,
        );
      }
    });
  }

  Future<void> _handleSave() async {
    setState(() => _isLoading = true);

    final authProvider = context.read<AuthProvider>();
    final doctorId = authProvider.user?.id;
    if (doctorId == null) return;

    final schedules = _scheduleInputs.values
        .where((s) => s.isAvailable)
        .toList();

    final success = await context.read<DoctorProvider>().updateWorkingHours(
      doctorId,
      schedules,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success ? 'Schedule updated' : 'Failed to update schedule',
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('Working Hours'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.headline,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Set your weekly working hours', style: AppTextStyles.bodyText),
          const SizedBox(height: 20),
          ..._days.map((day) => _buildDayRow(day)),
          const SizedBox(height: 32),
          PrimaryAppButton(
            label: _isLoading ? 'Saving...' : 'Save Schedule',
            onPressed: _isLoading ? null : _handleSave,
          ),
        ],
      ),
    );
  }

  Widget _buildDayRow(String day) {
    final input = _scheduleInputs[day]!;
    final label = _dayLabels[day] ?? day;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Switch(
                value: input.isAvailable,
                onChanged: (v) {
                  setState(() {
                    _scheduleInputs[day] = ScheduleInput(
                      dayOfWeek: day,
                      startTime: input.startTime,
                      endTime: input.endTime,
                      isAvailable: v,
                      slotDuration: input.slotDuration,
                    );
                  });
                },
                activeColor: AppColors.primaryTeal,
              ),
              const SizedBox(width: 8),
              Text(label, style: AppTextStyles.tileLabel),
            ],
          ),
          if (input.isAvailable) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _TimePickerField(
                    label: 'Start',
                    time: input.startTime,
                    onChanged: (v) {
                      setState(() {
                        _scheduleInputs[day] = ScheduleInput(
                          dayOfWeek: day,
                          startTime: v,
                          endTime: input.endTime,
                          isAvailable: true,
                          slotDuration: input.slotDuration,
                        );
                      });
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _TimePickerField(
                    label: 'End',
                    time: input.endTime,
                    onChanged: (v) {
                      setState(() {
                        _scheduleInputs[day] = ScheduleInput(
                          dayOfWeek: day,
                          startTime: input.startTime,
                          endTime: v,
                          isAvailable: true,
                          slotDuration: input.slotDuration,
                        );
                      });
                    },
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _TimePickerField extends StatelessWidget {
  final String label;
  final String time;
  final ValueChanged<String> onChanged;

  const _TimePickerField({
    required this.label,
    required this.time,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.cardSubText),
        const SizedBox(height: 4),
        InkWell(
          onTap: () async {
            final parts = time.split(':');
            final initialHour = parts.isNotEmpty ? int.tryParse(parts[0]) ?? 9 : 9;
            final initialMinute = parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0;

            final picked = await showTimePicker(
              context: context,
              initialTime: TimeOfDay(hour: initialHour, minute: initialMinute),
            );

            if (picked != null) {
              final formattedHour = picked.hour.toString().padLeft(2, '0');
              final formattedMinute = picked.minute.toString().padLeft(2, '0');
              onChanged('$formattedHour:$formattedMinute');
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.fieldBorder),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(time, style: AppTextStyles.fieldInput),
                const Icon(Icons.access_time, size: 18, color: AppColors.fieldHint),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
