import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/patient_provider.dart';
import '../models/patient.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';

class PatientFormScreen extends StatefulWidget {
  const PatientFormScreen({super.key});

  static const String routeName = '/patient-form';

  @override
  State<PatientFormScreen> createState() => _PatientFormScreenState();
}

class _PatientFormScreenState extends State<PatientFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  DateTime? _selectedDob;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _selectDob() async {
    final picked = await showDatePicker(
      context: context,
      initialDate:
          _selectedDob ??
          DateTime.now().subtract(const Duration(days: 365 * 30)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _selectedDob = picked);
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final request = CreatePatientRequest(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim().isNotEmpty
          ? _emailController.text.trim()
          : null,
      phone: _phoneController.text.trim().isNotEmpty
          ? _phoneController.text.trim()
          : null,
      dob: _selectedDob != null
          ? '${_selectedDob!.year}-${_selectedDob!.month.toString().padLeft(2, '0')}-${_selectedDob!.day.toString().padLeft(2, '0')}'
          : null,
    );

    final provider = context.read<PatientProvider>();
    final success = await provider.createPatient(request);

    if (mounted) {
      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Patient created successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('New Patient'),
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
              AppTextField(
                label: 'First Name',
                hintText: 'Enter first name',
                controller: _firstNameController,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Required' : null,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Last Name',
                hintText: 'Enter last name',
                controller: _lastNameController,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Required' : null,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Email',
                hintText: 'example@gmail.com',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Phone',
                hintText: '+1 (555) 000-0000',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: 20),
              Text('Date of Birth', style: AppTextStyles.fieldLabel),
              const SizedBox(height: 8),
              InkWell(
                onTap: _selectDob,
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
                      const Icon(Icons.cake, color: AppColors.fieldHint),
                      const SizedBox(width: 12),
                      Text(
                        _selectedDob != null
                            ? '${_selectedDob!.year}-${_selectedDob!.month.toString().padLeft(2, '0')}-${_selectedDob!.day.toString().padLeft(2, '0')}'
                            : 'Select date of birth',
                        style: AppTextStyles.fieldInput,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              PrimaryAppButton(
                label: 'Create Patient',
                onPressed: _handleSubmit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
