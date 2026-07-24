import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  static const String routeName = '/change-password';

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.changePassword(
      _currentPasswordController.text,
      _newPasswordController.text,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password changed successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: AppBar(
        title: const Text('Change Password'),
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
              const SizedBox(height: 12),
              AppTextField(
                label: 'Current Password',
                hintText: 'Enter current password',
                controller: _currentPasswordController,
                obscureText: _obscureCurrent,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureCurrent
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: AppColors.fieldHint,
                  ),
                  onPressed: () =>
                      setState(() => _obscureCurrent = !_obscureCurrent),
                ),
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'New Password',
                hintText: 'Enter new password',
                controller: _newPasswordController,
                obscureText: _obscureNew,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Required';
                  if (v.length < 8) return 'At least 8 characters';
                  if (!v.contains(RegExp(r'[A-Z]'))) {
                    return 'Needs an uppercase letter';
                  }
                  if (!v.contains(RegExp(r'[a-z]'))) {
                    return 'Needs a lowercase letter';
                  }
                  if (!v.contains(RegExp(r'[0-9]'))) return 'Needs a number';
                  return null;
                },
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureNew
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: AppColors.fieldHint,
                  ),
                  onPressed: () => setState(() => _obscureNew = !_obscureNew),
                ),
              ),
              const SizedBox(height: 20),
              AppTextField(
                label: 'Confirm New Password',
                hintText: 'Re-enter new password',
                controller: _confirmPasswordController,
                obscureText: _obscureConfirm,
                validator: (v) {
                  if (v != _newPasswordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureConfirm
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: AppColors.fieldHint,
                  ),
                  onPressed: () =>
                      setState(() => _obscureConfirm = !_obscureConfirm),
                ),
              ),
              if (authProvider.error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    authProvider.error!,
                    style: TextStyle(color: Colors.red.shade700, fontSize: 13),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              PrimaryAppButton(
                label: authProvider.isLoading
                    ? 'Changing...'
                    : 'Change Password',
                onPressed: authProvider.isLoading ? null : _handleSubmit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
