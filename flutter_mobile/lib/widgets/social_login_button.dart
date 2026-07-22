import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum SocialProvider { google, facebook }

class SocialLoginButton extends StatelessWidget {
  final SocialProvider provider;
  final VoidCallback? onPressed;
  final double size;

  const SocialLoginButton({
    super.key,
    required this.provider,
    this.onPressed,
    this.size = 56,
  });

  @override
  Widget build(BuildContext context) {
    final bool isGoogle = provider == SocialProvider.google;

    return Material(
      color: isGoogle ? AppColors.socialButtonBg : const Color(0xFF1877F2),
      borderRadius: BorderRadius.circular(16),
      elevation: 2,
      shadowColor: AppColors.socialButtonShadow,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onPressed,
        child: SizedBox(
          width: size,
          height: size,
          child: Center(
            child: isGoogle
                ? _GoogleMark(size: size * 0.42)
                : Icon(
                    Icons.facebook_rounded,
                    color: Colors.white,
                    size: size * 0.55,
                  ),
          ),
        ),
      ),
    );
  }
}

class _GoogleMark extends StatelessWidget {
  final double size;
  const _GoogleMark({required this.size});

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => const LinearGradient(
        colors: [
          Color(0xFF4285F4),
          Color(0xFFEA4335),
          Color(0xFFFBBC05),
          Color(0xFF34A853),
        ],
      ).createShader(bounds),
      child: Text(
        'G',
        style: TextStyle(
          fontSize: size,
          fontWeight: FontWeight.w900,
          color: Colors.white,
        ),
      ),
    );
  }
}
