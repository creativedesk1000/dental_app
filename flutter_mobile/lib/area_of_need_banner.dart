import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Blue rounded banner card with headline text and a simplified
/// dentist/patient illustration, as seen at the top of the
/// Area of Need mockup.
class AreaOfNeedBanner extends StatelessWidget {
  const AreaOfNeedBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(20, 22, 12, 0),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.accentCyan, AppColors.primaryTeal],
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 6,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: Text(
                  'Please select your area of need',
                  style: AppTextStyles.bannerHeading,
                ),
              ),
            ),
            Expanded(
              flex: 5,
              child: SizedBox(height: 140, child: _DentistIllustration()),
            ),
          ],
        ),
      ),
    );
  }
}

/// Simplified vector stand-in for the dentist-examining-patient artwork.
class _DentistIllustration extends StatelessWidget {
  const _DentistIllustration();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.bottomCenter,
      clipBehavior: Clip.none,
      children: [
        Positioned(
          left: 0,
          bottom: 6,
          child: Icon(
            Icons.face_retouching_natural,
            size: 64,
            color: Colors.white.withValues(alpha: 0.9),
          ),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Icon(Icons.masks_rounded, size: 84, color: Colors.white),
        ),
      ],
    );
  }
}
