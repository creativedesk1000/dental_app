import 'dart:math';
import 'package:flutter/material.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  static const String routeName = '/';

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _mainController;
  late final AnimationController _bgController;
  late final AnimationController _pulseController;

  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  late final Animation<double> _ringProgress;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _titleFade;
  late final Animation<Offset> _subtitleSlide;
  late final Animation<double> _subtitleFade;
  late final Animation<double> _taglineFade;

  static const Color primary = Color(0xFF00B4A6);
  static const Color primaryDark = Color(0xFF0A3D3A);
  static const Color accent = Color(0xFF7BF1D6);

  @override
  void initState() {
    super.initState();

    // Slow, continuous background gradient drift.
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat(reverse: true);

    // Gentle breathing glow behind the logo.
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);

    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );

    _logoScale = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 0.0, end: 1.12)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 60,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1.12, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 40,
      ),
    ]).animate(CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.55, curve: Curves.linear),
    ));

    _logoFade = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.35, curve: Curves.easeIn),
    );

    // Ring that draws itself around the logo like a premium loader.
    _ringProgress = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.15, 0.85, curve: Curves.easeOutCubic),
    );

    _titleSlide = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.45, 0.8, curve: Curves.easeOutCubic),
    ));
    _titleFade = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.45, 0.8, curve: Curves.easeIn),
    );

    _subtitleSlide = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.55, 0.9, curve: Curves.easeOutCubic),
    ));
    _subtitleFade = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.55, 0.9, curve: Curves.easeIn),
    );

    _taglineFade = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.75, 1.0, curve: Curves.easeIn),
    );

    _mainController.forward();

    Future.delayed(const Duration(milliseconds: 3200), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            settings: const RouteSettings(name: '/login'),
            transitionDuration: const Duration(milliseconds: 600),
            pageBuilder: (_, anim, __) => FadeTransition(
              opacity: anim,
              child: const LoginScreen(),
            ),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _mainController.dispose();
    _bgController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Animated gradient background.
          AnimatedBuilder(
            animation: _bgController,
            builder: (context, _) {
              final t = _bgController.value;
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment(-1 + t * 0.4, -1),
                    end: Alignment(1, 1 - t * 0.4),
                    colors: const [primaryDark, Color(0xFF0F5C56), primary],
                  ),
                ),
              );
            },
          ),

          // Soft decorative blobs for depth.
          Positioned(
            top: -size.width * 0.25,
            right: -size.width * 0.3,
            child: _blurCircle(size.width * 0.8, accent.withOpacity(0.08)),
          ),
          Positioned(
            bottom: -size.width * 0.35,
            left: -size.width * 0.25,
            child: _blurCircle(size.width * 0.7, accent.withOpacity(0.06)),
          ),

          // Foreground content.
          SafeArea(
            child: Column(
              children: [
                const Spacer(flex: 3),
                _buildLogo(),
                const SizedBox(height: 36),
                _buildTitleBlock(),
                const Spacer(flex: 3),
                _buildFooter(),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _blurCircle(double diameter, Color color) {
    return Container(
      width: diameter,
      height: diameter,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }

  Widget _buildLogo() {
    return AnimatedBuilder(
      animation: Listenable.merge([_mainController, _pulseController]),
      builder: (context, _) {
        final pulse = 1 + (_pulseController.value * 0.06);
        return FadeTransition(
          opacity: _logoFade,
          child: ScaleTransition(
            scale: _logoScale,
            child: SizedBox(
              width: 172,
              height: 172,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Breathing glow.
                  Transform.scale(
                    scale: pulse,
                    child: Container(
                      width: 172,
                      height: 172,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: accent.withOpacity(0.35),
                            blurRadius: 40,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Progress ring.
                  SizedBox(
                    width: 172,
                    height: 172,
                    child: CustomPaint(
                      painter: _RingPainter(
                        progress: _ringProgress.value,
                        color: Colors.white,
                      ),
                    ),
                  ),

                  // Glass circle with icon
                  Container(
                    width: 128,
                    height: 128,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.22),
                          Colors.white.withOpacity(0.06),
                        ],
                      ),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.35),
                        width: 1.2,
                      ),
                    ),
                    child: const Icon(
                      Icons.medical_services_rounded,
                      size: 58,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTitleBlock() {
    return Column(
      children: [
        SlideTransition(
          position: _titleSlide,
          child: FadeTransition(
            opacity: _titleFade,
            child: ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Colors.white, accent],
              ).createShader(bounds),
              child: const Text(
                'Dental Care',
                style: TextStyle(
                  fontSize: 34,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: 0.6,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SlideTransition(
          position: _subtitleSlide,
          child: FadeTransition(
            opacity: _subtitleFade,
            child: Text(
              'Premium dental care, reimagined',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w400,
                color: Colors.white.withOpacity(0.85),
                letterSpacing: 0.3,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return FadeTransition(
      opacity: _taglineFade,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(3, (i) {
              return AnimatedBuilder(
                animation: _pulseController,
                builder: (context, _) {
                  final delay = i * 0.2;
                  final t = (_pulseController.value + delay) % 1.0;
                  final opacity = 0.3 + 0.7 * sin(t * pi);
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(opacity.clamp(0.3, 1)),
                    ),
                  );
                },
              );
            }),
          ),
          const SizedBox(height: 14),
          Text(
            'Trusted by 50,000+ smiles',
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.6),
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}

/// Draws an arc that sweeps around the logo as the splash progresses.
class _RingPainter extends CustomPainter {
  final double progress;
  final Color color;

  _RingPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;

    final trackPaint = Paint()
      ..color = Colors.white.withOpacity(0.15)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, trackPaint);

    final sweep = 2 * pi * progress;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      sweep,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
