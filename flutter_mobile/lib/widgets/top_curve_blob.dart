import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class TopCurveBlob extends StatelessWidget {
  final double height;
  final double width;

  const TopCurveBlob({super.key, this.height = 140, this.width = 220});

  @override
  Widget build(BuildContext context) {
    return ClipPath(
      clipper: _BlobClipper(),
      child: Container(
        height: height,
        width: width,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [AppColors.accentCyan, AppColors.primaryTeal],
          ),
        ),
      ),
    );
  }
}

class _BlobClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.moveTo(0, size.height * 0.55);
    path.quadraticBezierTo(
      size.width * 0.18,
      size.height * 0.95,
      size.width * 0.42,
      size.height * 0.68,
    );
    path.quadraticBezierTo(
      size.width * 0.62,
      size.height * 0.42,
      size.width * 0.85,
      size.height * 0.62,
    );
    path.quadraticBezierTo(
      size.width,
      size.height * 0.74,
      size.width,
      size.height * 0.5,
    );
    path.lineTo(size.width, 0);
    path.lineTo(0, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
