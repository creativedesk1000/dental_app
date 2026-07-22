import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Blue bottom navigation bar with a floating, raised circular "Home"
/// button that pokes above the bar — matches the mockup's nav bar.
class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int>? onTap;

  const AppBottomNavBar({super.key, this.currentIndex = 2, this.onTap});

  static const List<IconData> _icons = [
    Icons.notifications_none_rounded,
    Icons.grid_view_rounded,
    Icons.home_rounded, // rendered as the floating center button
    Icons.list_alt_rounded,
    Icons.person_outline_rounded,
  ];

  @override
  Widget build(BuildContext context) {
    const double barHeight = 64;
    const double fabSize = 60;

    return SizedBox(
      height: barHeight + fabSize / 2,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          // The bar itself, with a notch carved out for the center button.
          ClipPath(
            clipper: _NotchClipper(),
            child: Container(
              height: barHeight,
              color: AppColors.navBarBg,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(_icons.length, (index) {
                  if (index == 2) {
                    // Leave empty space under the floating button.
                    return const SizedBox(width: 56);
                  }
                  final bool active = index == currentIndex;
                  return _NavIcon(
                    icon: _icons[index],
                    active: active,
                    onTap: () => onTap?.call(index),
                  );
                }),
              ),
            ),
          ),

          // Floating raised home button.
          Positioned(
            bottom: barHeight - fabSize / 2,
            child: GestureDetector(
              onTap: () => onTap?.call(2),
              child: Container(
                width: fabSize,
                height: fabSize,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.home_rounded,
                  color: AppColors.navBarBg,
                  size: 28,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavIcon extends StatelessWidget {
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  const _NavIcon({
    required this.icon,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Icon(
          icon,
          color: active ? Colors.white : AppColors.navIconInactive,
          size: 24,
        ),
      ),
    );
  }
}

/// Carves a small semicircle notch out of the top edge of the bar so the
/// floating home button appears to sit "into" it.
class _NotchClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    final notchCenter = Offset(size.width / 2, 0);
    final notchPath = Path()
      ..addOval(Rect.fromCircle(center: notchCenter, radius: 36));
    return Path.combine(PathOperation.difference, path, notchPath);
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
