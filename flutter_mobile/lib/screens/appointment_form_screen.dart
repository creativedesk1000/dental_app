import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/appointment_provider.dart';
import '../providers/patient_provider.dart';
import '../providers/doctor_provider.dart';
import '../providers/auth_provider.dart';
import '../models/appointment.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';

class AppointmentFormScreen extends StatefulWidget {
  const AppointmentFormScreen({super.key});

  static const String routeName = '/appointment-form';

  @override
  State<AppointmentFormScreen> createState() => _AppointmentFormScreenState();
}

class _AppointmentFormScreenState extends State<AppointmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  String? _selectedPatientId;
  String? _selectedDoctorId;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 9, minute: 0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PatientProvider>().loadPatients();
      context.read<DoctorProvider>().loadDoctors();
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _selectTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null) {
      setState(() => _selectedTime = picked);
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    final authProvider = context.read<AuthProvider>();
    final isPatient = authProvider.user?.isPatient ?? false;
    final patientId = isPatient ? authProvider.user!.id : _selectedPatientId;

    if (patientId == null || _selectedDoctorId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select patient and doctor')),
      );
      return;
    }

    final dateTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );

    final request = CreateAppointmentRequest(
      patientId: patientId,
      doctorId: _selectedDoctorId!,
      date: dateTime.toIso8601String(),
      notes: _notesController.text.isNotEmpty ? _notesController.text : null,
    );

    final provider = context.read<AppointmentProvider>();
    final success = await provider.createAppointment(request);

    if (mounted) {
      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Appointment created successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final patientProvider = context.watch<PatientProvider>();
    final doctorProvider = context.watch<DoctorProvider>();
    final authProvider = context.watch<AuthProvider>();

    final dateStr = DateFormat('MMM d, yyyy').format(_selectedDate);
    final timeStr = _selectedTime.format(context);

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('New Appointment'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.headline,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Patient Selection
              if (authProvider.user?.isPatient ?? false) ...[
                // For patients, we don't show the dropdown and automatically use their ID.
                // We'll set it in the build method or right before submit.
              ] else ...[
                Text('Patient', style: AppTextStyles.fieldLabel),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedPatientId,
                  items: patientProvider.patients
                      .map(
                        (p) => DropdownMenuItem(
                          value: p.id,
                          child: Text(p.fullName),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => _selectedPatientId = v),
                  decoration: _inputDecoration(),
                  validator: (v) => v == null ? 'Select a patient' : null,
                ),
                const SizedBox(height: 20),
              ],

              // Doctor Selection
              Text('Doctor', style: AppTextStyles.fieldLabel),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedDoctorId,
                items: doctorProvider.doctors
                    .map(
                      (d) => DropdownMenuItem(
                        value: d.id,
                        child: Text(d.name ?? 'Unknown'),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _selectedDoctorId = v),
                decoration: _inputDecoration(),
                validator: (v) => v == null ? 'Select a doctor' : null,
              ),
              const SizedBox(height: 20),

              // Date Selection
              Text('Date', style: AppTextStyles.fieldLabel),
              const SizedBox(height: 8),
              InkWell(
                onTap: _selectDate,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.fieldBorder),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.calendar_today,
                        color: AppColors.fieldHint,
                      ),
                      const SizedBox(width: 12),
                      Text(dateStr, style: AppTextStyles.fieldInput),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Time Selection
              Text('Time', style: AppTextStyles.fieldLabel),
              const SizedBox(height: 8),
              InkWell(
                onTap: _selectTime,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.fieldBorder),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time, color: AppColors.fieldHint),
                      const SizedBox(width: 12),
                      Text(timeStr, style: AppTextStyles.fieldInput),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Notes
              AppTextField(
                label: 'Notes (Optional)',
                hintText: 'Add any notes...',
                controller: _notesController,
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: 32),

              // Submit
              PrimaryAppButton(
                label: 'Create Appointment',
                onPressed: _handleSubmit,
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.fieldBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.fieldBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.primaryTeal, width: 1.5),
      ),
    );
  }
}
