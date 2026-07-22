import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/app_buttons.dart';
import '../widgets/app_text_field.dart';
import '../widgets/social_login_button.dart';
import '../widgets/top_curve_blob.dart';
import 'signup_screen.dart';
import '../home_page.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  static const String routeName = '/login';

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

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
                      const SizedBox(height: 10),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
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
                      ),
                      SizedBox(height: isTablet ? 40 : 28),
                      Text(
                        'Welcome back! Ready to jump back in?',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodyText,
                      ),
                      const SizedBox(height: 20),
                      PrimaryAppButton(
                        label: 'Sign in',
                        onPressed: () {
                          Navigator.of(context).pushNamedAndRemoveUntil(
                            HomePage.routeName,
                            (route) => false,
                          );
                        },
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
        ],
      ),
    );
  }
}
