import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';
import '../widgets/top_curve_blob.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  static const String routeName = '/forgot-password';

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isSuccess = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.forgotPassword(
      _emailController.text.trim(),
    );

    if (mounted) {
      setState(() => _isSuccess = success);
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isTablet = width >= 600;
    final maxContentWidth = isTablet ? 480.0 : double.infinity;
    final horizontalPadding = isTablet ? 32.0 : 24.0;
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          Align(
            alignment: Alignment.topRight,
            child: TopCurveBlob(
              height: isTablet ? 170 : 140,
              width: isTablet ? 260 : 220,
            ),
          ),
          SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxContentWidth),
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(
                    horizontal: horizontalPadding,
                    vertical: 16,
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 40),
                        IconButton(
                          icon: const Icon(Icons.arrow_back),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Forgot Password',
                          style: AppTextStyles.authHeadline.copyWith(
                            fontSize: isTablet ? 36 : 32,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          "Enter your email address and we'll send you a link to reset your password.",
                          style: AppTextStyles.bodyText,
                        ),
                        const SizedBox(height: 32),
                        if (_isSuccess)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.green.shade200),
                            ),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.check_circle,
                                  color: Colors.green.shade600,
                                  size: 48,
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'If the email exists, a reset link has been sent. Please check your inbox.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: Colors.green.shade800,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          )
                        else ...[
                          AppTextField(
                            label: 'Email',
                            hintText: 'example@gmail.com',
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Email is required';
                              }
                              if (!value.contains('@')) {
                                return 'Invalid email address';
                              }
                              return null;
                            },
                          ),
                          if (authProvider.error != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.red.shade200),
                              ),
                              child: Text(
                                authProvider.error!,
                                style: TextStyle(
                                  color: Colors.red.shade700,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(height: 32),
                          PrimaryAppButton(
                            label: authProvider.isLoading
                                ? 'Sending...'
                                : 'Send Reset Link',
                            onPressed: authProvider.isLoading
                                ? null
                                : _handleSubmit,
                          ),
                        ],
                        if (_isSuccess) ...[
                          const SizedBox(height: 24),
                          PrimaryAppButton(
                            label: 'Back to Login',
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
