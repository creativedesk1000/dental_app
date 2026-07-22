import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';
import '../widgets/social_login_button.dart';
import '../widgets/top_curve_blob.dart';
import 'login_screen.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  static const String routeName = '/signup';

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isTablet = width >= 600;
    final maxContentWidth = isTablet ? 480.0 : double.infinity;
    final horizontalPadding = isTablet ? 32.0 : 24.0;

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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: isTablet ? 24 : 12),
                      Text(
                        'Sign Up',
                        style: AppTextStyles.authHeadline.copyWith(
                          fontSize: isTablet ? 36 : 32,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text('Sign up with', style: AppTextStyles.sectionLabel),
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
                      SizedBox(height: isTablet ? 36 : 28),
                      AppTextField(
                        label: 'Name',
                        hintText: 'Your Name',
                        controller: _nameController,
                        keyboardType: TextInputType.name,
                      ),
                      const SizedBox(height: 20),
                      AppTextField(
                        label: 'Email',
                        hintText: 'example@gmail.com',
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 20),
                      AppTextField(
                        label: 'Password',
                        hintText: 'Enter password',
                        controller: _passwordController,
                        obscureText: _obscurePassword,
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
                      SizedBox(height: isTablet ? 36 : 28),
                      Text(
                        'Creating an account means that you are okay with our Terms of Service and our Privacy Policy',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodyTextSmall,
                      ),
                      const SizedBox(height: 20),
                      PrimaryAppButton(
                        label: 'Create an Account',
                        onPressed: () {},
                      ),
                      const SizedBox(height: 16),
                      Center(
                        child: Wrap(
                          alignment: WrapAlignment.center,
                          children: [
                            Text(
                              'Already have an account? ',
                              style: AppTextStyles.bodyText,
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.of(
                                  context,
                                ).pushNamed(LoginScreen.routeName);
                              },
                              child: Text(
                                'Sign in',
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
        ],
      ),
    );
  }
}
