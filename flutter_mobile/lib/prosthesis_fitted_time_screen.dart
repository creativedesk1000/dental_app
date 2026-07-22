import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import 'app_bottom_nav_bar.dart';
import 'widgets/app_buttons.dart';
import 'app_pill_header.dart';
import 'date_range_field.dart';
import 'mini_calendar.dart';
import 'time_picker_row.dart';

class ProsthesisFittedTimeScreen extends StatefulWidget {
  const ProsthesisFittedTimeScreen({super.key});

  static const String routeName = '/prosthesis-fitted-time';

  @override
  State<ProsthesisFittedTimeScreen> createState() =>
      _ProsthesisFittedTimeScreenState();
}

class _ProsthesisFittedTimeScreenState
    extends State<ProsthesisFittedTimeScreen> {
  final _hourController = TextEditingController();
  final _minuteController = TextEditingController(text: '00');
  MeridiemPeriod _period = MeridiemPeriod.am;

  int _navIndex = 1;
  bool _calendarOpen = true;

  late DateTime _displayedMonth;
  DateTime? _selectedDate;
  late final Set<DateTime> _markedDates;

  @override
  void initState() {
    super.initState();
    // Seed with a sensible default so the screen isn't empty on first load.
    final seedMonth = DateTime(DateTime.now().year, DateTime.now().month);
    _displayedMonth = seedMonth;
    _selectedDate = DateTime(seedMonth.year, seedMonth.month, 6);
    _markedDates = {DateTime(seedMonth.year, seedMonth.month, 4)};
  }

  @override
  void dispose() {
    _hourController.dispose();
    _minuteController.dispose();
    super.dispose();
  }

  String get _dateRangeText {
    if (_selectedDate == null) return 'Select a date';
    final formatted = _formatDate(_selectedDate!);
    return '$formatted - $formatted';
  }

  String _formatDate(DateTime d) {
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(d.month)}/${two(d.day)}/${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final bool isTablet = width >= 600;
    final double maxContentWidth = isTablet ? 640 : double.infinity;
    final double horizontalPadding = isTablet ? 32 : 20;

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      appBar: const AppPillHeader(title: 'Prosthesis Fitted'),
      body: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxContentWidth),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(
                    horizontalPadding,
                    24,
                    horizontalPadding,
                    12,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Please enter the date and time of the procedure:',
                        style: AppTextStyles.pageSectionHeading,
                      ),
                      const SizedBox(height: 22),

                      TimePickerRow(
                        hourController: _hourController,
                        minuteController: _minuteController,
                        period: _period,
                        onPeriodChanged: (p) => setState(() => _period = p),
                      ),
                      const SizedBox(height: 20),

                      DateRangeField(
                        text: _dateRangeText,
                        active: _calendarOpen,
                        onTap: () =>
                            setState(() => _calendarOpen = !_calendarOpen),
                      ),
                      const SizedBox(height: 14),

                      if (_calendarOpen)
                        MiniCalendar(
                          displayedMonth: _displayedMonth,
                          selectedDate: _selectedDate,
                          markedDates: _markedDates,
                          onDateSelected: (d) =>
                              setState(() => _selectedDate = d),
                          onMonthChanged: (m) =>
                              setState(() => _displayedMonth = m),
                        ),

                      const SizedBox(height: 28),

                      PrimaryAppButton(
                        label: 'Done',
                        onPressed: () {
                          // TODO: persist the selected date/time and continue
                          Navigator.of(context).maybePop();
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
    );
  }
}
