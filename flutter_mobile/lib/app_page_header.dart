import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Back button + "Hi {name} 👋" greeting + circular avatar, as seen at the
/// top of the Home and Area of Need mockups.
class AppPageHeader extends StatelessWidget {
  final String name;
  final String? avatarUrl;
  final VoidCallback? onBack;
  final VoidCallback? onAvatarTap;

  const AppPageHeader({
    super.key,
    required this.name,
    this.avatarUrl,
    this.onBack,
    this.onAvatarTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _CircleIconButton(
          icon: Icons.arrow_back,
          onTap: onBack ?? () => Navigator.of(context).maybePop(),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Row(
            children: [
              Flexible(
                child: Text(
                  'Hi $name',
                  style: AppTextStyles.greeting,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              const Text('👋', style: TextStyle(fontSize: 20)),
            ],
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: onAvatarTap,
          child: CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.areaCardIconBg,
            backgroundImage:
                avatarUrl != null ? NetworkImage(avatarUrl!) : null,
            child: avatarUrl == null
                ? const Icon(Icons.person, color: AppColors.primaryTeal)
                : null,
          ),
        ),
      ],
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _CircleIconButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      elevation: 2,
      shadowColor: AppColors.cardShadow,
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            border: Border.fromBorderSide(
              BorderSide(color: AppColors.cardBorder),
            ),
          ),
          child: Icon(icon, size: 20, color: AppColors.headline),
        ),
      ),
    );
  }
}
