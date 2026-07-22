import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class ProgressCard extends StatelessWidget {
  final String currentProgressLabel;
  final int currentStep;
  final int totalSteps;
  final String weeklyProgressLabel;

  /// 7 booleans, Monday first, marking which days are completed.
  final List<bool> weekCompletion;

  const ProgressCard({
    super.key,
    required this.currentProgressLabel,
    required this.currentStep,
    required this.totalSteps,
    required this.weeklyProgressLabel,
    required this.weekCompletion,
  }) : assert(weekCompletion.length == 7);

  static const _weekdayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [
          BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Reserve space on the right for the illustration on wider cards.
          final bool showIllustration = constraints.maxWidth > 260;

          final textColumn = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Current Progress:', style: AppTextStyles.cardHeading),
              const SizedBox(height: 4),
              Text.rich(
                TextSpan(
                  style: AppTextStyles.cardSubText,
                  children: [
                    const TextSpan(text: 'for '),
                    TextSpan(
                      text: currentProgressLabel,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.primaryTeal,
                    size: 20,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Step $currentStep/$totalSteps',
                    style: AppTextStyles.stepLabel,
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text('Weekly Progress:', style: AppTextStyles.cardHeading),
              const SizedBox(height: 4),
              Text.rich(
                TextSpan(
                  style: AppTextStyles.cardSubText,
                  children: [
                    const TextSpan(text: 'for '),
                    TextSpan(
                      text: weeklyProgressLabel,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(7, (i) {
                  return _WeekdayCheck(
                    letter: _weekdayLetters[i],
                    checked: weekCompletion[i],
                  );
                }),
              ),
            ],
          );

          if (!showIllustration) return textColumn;

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: textColumn),
              const SizedBox(width: 12),
              const _ProgressIllustration(),
            ],
          );
        },
      ),
    );
  }
}

class _WeekdayCheck extends StatelessWidget {
  final String letter;
  final bool checked;

  const _WeekdayCheck({required this.letter, required this.checked});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            color: checked ? AppColors.weekdayCheckedBg : Colors.white,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: checked
                  ? AppColors.weekdayCheckedBg
                  : AppColors.weekdayUncheckedBorder,
            ),
          ),
          child: checked
              ? const Icon(Icons.check, size: 14, color: Colors.white)
              : null,
        ),
        const SizedBox(height: 4),
        Text(letter, style: AppTextStyles.weekdayLetter),
      ],
    );
  }
}

/// Simplified vector stand-in for the dental-kit illustration
/// (clipboard chart + mouthwash bottle + mirror tool).
class _ProgressIllustration extends StatelessWidget {
  const _ProgressIllustration();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 90,
      height: 110,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 80,
            height: 100,
            decoration: BoxDecoration(
              color: const Color(0xFFF4A93B),
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.all(8),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.circle,
                    size: 22,
                    color: AppColors.primaryTeal.withValues(alpha: 0.15),
                  ),
                  const SizedBox(height: 6),
                  ...List.generate(
                    3,
                    (i) => Padding(
                      padding: const EdgeInsets.only(bottom: 5),
                      child: Container(
                        height: 3,
                        color: const Color(0xFFE0E0E0),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 4,
            left: 4,
            child: Container(
              width: 20,
              height: 34,
              decoration: BoxDecoration(
                color: AppColors.primaryTeal.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          Positioned(
            top: 4,
            right: 2,
            child: Icon(
              Icons.circle,
              size: 16,
              color: AppColors.iconSquareBlue.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}
