import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// A white rounded card with a colored icon square on top (or to the left)
/// and a label below — reused for "Jump to" tiles, video tiles, and the
/// Area of Need grid options.
class IconLabelTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color iconBg;
  final Color iconColor;
  final VoidCallback? onTap;

  /// Horizontal layout (icon square left of text) — used for "Jump to" tiles.
  final bool horizontal;

  const IconLabelTile({
    super.key,
    required this.icon,
    required this.label,
    this.iconBg = AppColors.iconSquareBlue,
    this.iconColor = Colors.white,
    this.onTap,
    this.horizontal = false,
  });

  @override
  Widget build(BuildContext context) {
    final iconSquare = Container(
      width: horizontal ? 44 : 56,
      height: horizontal ? 44 : 56,
      decoration: BoxDecoration(
        color: iconBg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, color: iconColor, size: horizontal ? 22 : 26),
    );

    final card = Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 1.5,
      shadowColor: AppColors.cardShadow,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          padding: horizontal
              ? const EdgeInsets.symmetric(horizontal: 12, vertical: 12)
              : const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
          child: horizontal
              ? Row(
                  children: [
                    iconSquare,
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        label,
                        style: AppTextStyles.tileLabel,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    iconSquare,
                    const SizedBox(height: 10),
                    Text(
                      label,
                      textAlign: TextAlign.center,
                      style: AppTextStyles.tileLabel,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
        ),
      ),
    );

    return card;
  }
}
