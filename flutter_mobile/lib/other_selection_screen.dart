import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import 'app_bottom_nav_bar.dart';
import 'app_pill_header.dart';
import 'option_list_tile.dart';

class OtherSelectionScreen extends StatefulWidget {
  const OtherSelectionScreen({super.key});

  static const String routeName = '/other-selection';

  @override
  State<OtherSelectionScreen> createState() => _OtherSelectionScreenState();
}

class _OtherSelectionScreenState extends State<OtherSelectionScreen> {
  int _navIndex = 1;

  static const _options = [
    (icon: Icons.medical_information_outlined, label: 'Filling'),
    (icon: Icons.cleaning_services_rounded, label: 'Teeth Cleaning'),
    (icon: Icons.auto_awesome_rounded, label: 'Teeth Whitening'),
    (icon: Icons.healing_rounded, label: 'Gum Surgery'),
    (icon: Icons.grid_on_rounded, label: 'Veneers/Laminates'),
  ];

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final bool isTablet = width >= 600;
    final double maxContentWidth = isTablet ? 640 : double.infinity;
    final double horizontalPadding = isTablet ? 32 : 20;

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: const AppPillHeader(title: 'Other Selection'),
      body: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxContentWidth),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(
                    horizontalPadding,
                    22,
                    horizontalPadding,
                    12,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Please select what other procedure you went through:',
                        style: AppTextStyles.promptText,
                      ),
                      const SizedBox(height: 20),
                      for (int i = 0; i < _options.length; i++) ...[
                        OptionListTile(
                          icon: _options[i].icon,
                          label: _options[i].label,
                          onTap: () {},
                        ),
                        if (i != _options.length - 1)
                          const SizedBox(height: 16),
                      ],
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
              AppBottomNavBar(
                currentIndex: _navIndex,
                onTap: (i) => setState(() => _navIndex = i),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
