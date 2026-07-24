import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';
import '../widgets/social_login_button.dart';
import '../widgets/top_curve_blob.dart';
import 'signup_screen.dart';
import 'forgot_password_screen.dart';
import 'home_shell_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  static const String routeName = '/login';

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  void initState() {
    super.initState();
    _emailController.text = 'demo@dentalcare.com';
    _passwordController.text = 'demo123';
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      rememberMe: _rememberMe,
    );

    if (success && mounted) {
      Navigator.of(
        context,
      ).pushNamedAndRemoveUntil(HomeShellScreen.routeName, (route) => false);
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
                        SizedBox(height: isTablet ? 24 : 12),
                        Text(
                          'Login',
                          style: AppTextStyles.authHeadline.copyWith(
                            fontSize: isTablet ? 36 : 32,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text('Login with', style: AppTextStyles.sectionLabel),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            SocialLoginButton(
                              provider: SocialProvider.google,
                              onPressed: () {},
                            ),
                            const SizedBox(width: 14),
                            SocialLoginButton(
                              provider: SocialProvider.facebook,
                              onPressed: () {},
                            ),
                          ],
                        ),
                        SizedBox(height: isTablet ? 40 : 32),
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
                        const SizedBox(height: 20),
                        AppTextField(
                          label: 'Password',
                          hintText: 'Enter password',
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password is required';
                            }
                            return null;
                          },
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AppColors.fieldHint,
                            ),
                            onPressed: () {
                              setState(
                                () => _obscurePassword = !_obscurePassword,
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: Checkbox(
                                    value: _rememberMe,
                                    onChanged: (v) => setState(
                                      () => _rememberMe = v ?? false,
                                    ),
                                    activeColor: AppColors.primaryTeal,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Remember me',
                                  style: AppTextStyles.bodyText,
                                ),
                              ],
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(
                                  context,
                                ).pushNamed(ForgotPasswordScreen.routeName);
                              },
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.zero,
                                minimumSize: const Size(0, 0),
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: Text(
                                'Forgot Password?',
                                style: AppTextStyles.linkText,
                              ),
                            ),
                          ],
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
                            child: Row(
                              children: [
                                Icon(
                                  Icons.error_outline,
                                  color: Colors.red.shade700,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    authProvider.error!,
                                    style: TextStyle(
                                      color: Colors.red.shade700,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        SizedBox(height: isTablet ? 28 : 20),
                        Text(
                          'Welcome back! Ready to jump back in?',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.bodyText,
                        ),
                        const SizedBox(height: 20),
                        PrimaryAppButton(
                          label: authProvider.isLoading
                              ? 'Signing in...'
                              : 'Sign in',
                          onPressed: authProvider.isLoading
                              ? null
                              : _handleLogin,
                        ),
                        const SizedBox(height: 16),
                        Center(
                          child: Wrap(
                            alignment: WrapAlignment.center,
                            children: [
                              Text(
                                "Don't have an account? ",
                                style: AppTextStyles.bodyText,
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(
                                    context,
                                  ).pushNamed(SignUpScreen.routeName);
                                },
                                child: Text(
                                  'Create an account',
                                  style: AppTextStyles.linkText,
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: isTablet ? 32 : 20),
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
