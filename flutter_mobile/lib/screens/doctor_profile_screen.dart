import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/doctor_provider.dart';
import '../providers/auth_provider.dart';
import '../models/doctor.dart';
import '../theme/app_colors.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';

class DoctorProfileScreen extends StatefulWidget {
  const DoctorProfileScreen({super.key});

  static const String routeName = '/doctor-profile';

  @override
  State<DoctorProfileScreen> createState() => _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends State<DoctorProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _specialtyController = TextEditingController();
  final _qualificationController = TextEditingController();
  final _experienceController = TextEditingController();
  final _feeController = TextEditingController();
  final _licenseController = TextEditingController();
  final _bioController = TextEditingController();
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadDoctor());
  }

  Future<void> _loadDoctor() async {
    final authProvider = context.read<AuthProvider>();
    final doctorId = authProvider.user?.id;
    if (doctorId != null) {
      await context.read<DoctorProvider>().loadDoctor(doctorId);
      _populateFields();
    }
  }

  void _populateFields() {
    final doctor = context.read<DoctorProvider>().selectedDoctor;
    if (doctor == null) return;
    _nameController.text = doctor.name ?? '';
    _emailController.text = doctor.email ?? '';
    _specialtyController.text = doctor.doctorProfile?.specialty ?? '';
    _qualificationController.text = doctor.doctorProfile?.qualification ?? '';
    _experienceController.text =
        doctor.doctorProfile?.experienceYears?.toString() ?? '';
    _feeController.text =
        doctor.doctorProfile?.consultationFee?.toString() ?? '';
    _licenseController.text = doctor.doctorProfile?.licenseNumber ?? '';
    _bioController.text = doctor.doctorProfile?.bio ?? '';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _specialtyController.dispose();
    _qualificationController.dispose();
    _experienceController.dispose();
    _feeController.dispose();
    _licenseController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final doctorProvider = context.read<DoctorProvider>();
    final doctorId = context.read<AuthProvider>().user?.id;
    if (doctorId == null) return;

    final request = UpdateDoctorProfileRequest(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      specialty: _specialtyController.text.trim().isNotEmpty
          ? _specialtyController.text.trim()
          : null,
      qualification: _qualificationController.text.trim().isNotEmpty
          ? _qualificationController.text.trim()
          : null,
      experienceYears: _experienceController.text.isNotEmpty
          ? int.tryParse(_experienceController.text)
          : null,
      consultationFee: _feeController.text.isNotEmpty
          ? double.tryParse(_feeController.text)
          : null,
      licenseNumber: _licenseController.text.trim().isNotEmpty
          ? _licenseController.text.trim()
          : null,
      bio: _bioController.text.trim().isNotEmpty
          ? _bioController.text.trim()
          : null,
    );

    final success = await doctorProvider.updateDoctor(doctorId, request);
    if (mounted) {
      if (success) {
        setState(() => _isEditing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final doctorProvider = context.watch<DoctorProvider>();
    final doctor = doctorProvider.selectedDoctor;

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('My Profile'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.headline,
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.close : Icons.edit),
            onPressed: () => setState(() => _isEditing = !_isEditing),
          ),
        ],
      ),
      body: doctorProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 44,
                      backgroundColor: AppColors.primaryTeal,
                      child: Text(
                        doctor?.initials ?? 'DR',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    AppTextField(
                      label: 'Name',
                      hintText: 'Your name',
                      controller: _nameController,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Email',
                      hintText: 'email@example.com',
                      controller: _emailController,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Specialty',
                      hintText: 'e.g., Orthodontist',
                      controller: _specialtyController,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Qualification',
                      hintText: 'e.g., BDS, MDS',
                      controller: _qualificationController,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Experience (Years)',
                      hintText: 'e.g., 10',
                      controller: _experienceController,
                      keyboardType: TextInputType.number,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Consultation Fee (\$)',
                      hintText: 'e.g., 50',
                      controller: _feeController,
                      keyboardType: TextInputType.number,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'License Number',
                      hintText: 'License #',
                      controller: _licenseController,
                      enabled: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Bio',
                      hintText: 'Brief bio...',
                      controller: _bioController,
                      enabled: _isEditing,
                    ),
                    if (_isEditing) ...[
                      const SizedBox(height: 32),
                      PrimaryAppButton(
                        label: 'Save Changes',
                        onPressed: _handleSave,
                      ),
                    ],
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }
}
