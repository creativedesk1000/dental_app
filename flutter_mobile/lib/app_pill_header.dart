import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';

/// The full-width blue header with a large rounded-bottom "pill" shape,
/// a dark circular back button, and a centered bold title — used across
/// the appointment flow (Other Selection, date/time pickers, etc.).
class AppPillHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onBack;

  const AppPillHeader({
    super.key,
    required this.title,
    this.onBack,
  });

  @override
  Size get preferredSize => const Size.fromHeight(96);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.only(
        bottomLeft: Radius.circular(40),
        bottomRight: Radius.circular(40),
      ),
      child: Container(
        width: double.infinity,
        color: AppColors.pillHeaderBg,
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 22),
        child: SafeArea(
          bottom: false,
          child: Row(
            children: [
              GestureDetector(
                onTap: onBack ?? () => Navigator.of(context).maybePop(),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: AppColors.pillHeaderBackBtnBg,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_ios_new_rounded,
                      color: Colors.white, size: 16),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: 36),
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.pillHeaderTitle,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
