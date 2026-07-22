import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import 'app_bottom_nav_bar.dart';
import 'app_page_header.dart';
import 'area_of_need_banner.dart';
import 'icon_label_tile.dart';
import 'other_selection_screen.dart';
import 'prosthesis_fitted_time_screen.dart';

class AreaOfNeedPage extends StatefulWidget {
  const AreaOfNeedPage({super.key});

  static const String routeName = '/area-of-need';

  @override
  State<AreaOfNeedPage> createState() => _AreaOfNeedPageState();
}

class _AreaOfNeedPageState extends State<AreaOfNeedPage> {
  int _navIndex = 1;

  static const _options = [
    (icon: Icons.content_cut_rounded, label: 'Tooth Taken Out'),
    (icon: Icons.grid_view_rounded, label: 'Prosthesis Fitted'),
    (icon: Icons.settings_suggest_rounded, label: 'Root Canal/Filling'),
    (icon: Icons.favorite_border_rounded, label: 'Implant'),
    (icon: Icons.broken_image_outlined, label: 'Tooth Fracture'),
    (icon: Icons.grid_on_rounded, label: 'Braces'),
  ];

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final bool isTablet = width >= 600;
    final double maxContentWidth = isTablet ? 640 : double.infinity;
    final double horizontalPadding = isTablet ? 32 : 20;
    final int gridColumns = isTablet ? 4 : 3;

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      body: SafeArea(
        bottom: false,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxContentWidth),
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.fromLTRB(
                    horizontalPadding,
                    12,
                    horizontalPadding,
                    0,
                  ),
                  child: const AppPageHeader(name: 'Ashita'),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(
                      horizontalPadding,
                      18,
                      horizontalPadding,
                      12,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const AreaOfNeedBanner(),
                        const SizedBox(height: 24),

                        Text(
                          'I have/had ...',
                          style: AppTextStyles.pageSectionHeading,
                        ),
                        const SizedBox(height: 14),

                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _options.length,
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: gridColumns,
                                mainAxisSpacing: 14,
                                crossAxisSpacing: 14,
                                childAspectRatio: 0.92,
                              ),
                          itemBuilder: (context, index) {
                            final o = _options[index];
                            final bool filled = o.label == 'Braces';
                            return IconLabelTile(
                              icon: o.icon,
                              label: o.label,
                              iconBg: filled
                                  ? AppColors.primaryTeal
                                  : AppColors.areaCardIconBg,
                              iconColor: filled
                                  ? Colors.white
                                  : AppColors.primaryTeal,
                              onTap: () {
                                if (o.label == 'Prosthesis Fitted') {
                                  Navigator.of(context).pushNamed(
                                    ProsthesisFittedTimeScreen.routeName,
                                  );
                                }
                              },
                            );
                          },
                        ),
                        const SizedBox(height: 14),

                        IconLabelTile(
                          icon: Icons.file_present_rounded,
                          label: 'Search for other operative care',
                          iconBg: AppColors.iconSquareBlue,
                          horizontal: true,
                          onTap: () {
                            Navigator.of(
                              context,
                            ).pushNamed(OtherSelectionScreen.routeName);
                          },
                        ),
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
      ),
    );
  }
}
