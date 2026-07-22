import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';

/// Displays a "start - end" date range with a calendar icon; tapping it
/// toggles the calendar picker open/closed, matching the mockup's
/// outlined input field.
class DateRangeField extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;
  final bool active;

  const DateRangeField({
    super.key,
    required this.text,
    this.onTap,
    this.active = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: active ? AppColors.primaryTeal : AppColors.inputBoxBorder,
            width: active ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(text, style: AppTextStyles.fieldInput),
            ),
            const Icon(Icons.calendar_month_outlined,
                size: 20, color: AppColors.fieldLabel),
          ],
        ),
      ),
    );
  }
}
