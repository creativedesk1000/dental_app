import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import 'app_bottom_nav_bar.dart';
import 'app_page_header.dart';
import 'icon_label_tile.dart';
import 'progress_card.dart';
import 'area_of_need_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  static const String routeName = '/home';

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _navIndex = 2;

  static final _videos = [
    (icon: Icons.brush_rounded, label: 'Brushing'),
    (icon: Icons.medical_information_outlined, label: 'Flossing'),
    (icon: Icons.water_drop_outlined, label: 'Mouth wash'),
    (icon: Icons.healing_outlined, label: 'Aftercare'),
  ];

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final bool isTablet = width >= 600;
    final double maxContentWidth = isTablet ? 640 : double.infinity;
    final double horizontalPadding = isTablet ? 32 : 20;

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
                        ProgressCard(
                          currentProgressLabel: 'Tooth Taken Out',
                          currentStep: 3,
                          totalSteps: 4,
                          weeklyProgressLabel: 'Brushing',
                          weekCompletion: [
                            true,
                            true,
                            true,
                            true,
                            false,
                            false,
                            false,
                          ],
                        ),
                        const SizedBox(height: 26),

                        Text(
                          'Jump to:',
                          style: AppTextStyles.pageSectionHeading,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: IconLabelTile(
                                icon: Icons.event_seat_rounded,
                                label: 'Get Care',
                                iconBg: AppColors.iconSquareBlue,
                                horizontal: true,
                                onTap: () {
                                  Navigator.of(
                                    context,
                                  ).pushNamed(AreaOfNeedPage.routeName);
                                },
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: IconLabelTile(
                                icon: Icons.notifications_active_rounded,
                                label: 'Daily Reminders',
                                iconBg: AppColors.iconSquareBlue,
                                horizontal: true,
                                onTap: () {},
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 26),

                        Text(
                          'Or you can watch videos related to:',
                          style: AppTextStyles.pageSectionHeading,
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          height: 148,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _videos.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 14),
                            itemBuilder: (context, index) {
                              final v = _videos[index];
                              return SizedBox(
                                width: 108,
                                child: IconLabelTile(
                                  icon: v.icon,
                                  label: v.label,
                                  iconBg: AppColors.iconSquareTeal,
                                  onTap: () {},
                                ),
                              );
                            },
                          ),
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
