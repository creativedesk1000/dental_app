import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';

/// A self-contained month-view calendar: prev/next month navigation,
/// weekday header row, and a date grid supporting a selected date and
/// "marked" dates (small dot underneath, e.g. for existing appointments).
class MiniCalendar extends StatelessWidget {
  final DateTime displayedMonth;
  final DateTime? selectedDate;
  final Set<DateTime> markedDates;
  final ValueChanged<DateTime> onDateSelected;
  final ValueChanged<DateTime> onMonthChanged;

  const MiniCalendar({
    super.key,
    required this.displayedMonth,
    required this.selectedDate,
    required this.onDateSelected,
    required this.onMonthChanged,
    this.markedDates = const {},
  });

  static const _weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  @override
  Widget build(BuildContext context) {
    final firstOfMonth = DateTime(displayedMonth.year, displayedMonth.month, 1);
    final daysInMonth =
        DateTime(displayedMonth.year, displayedMonth.month + 1, 0).day;
    final leadingEmptyCells = firstOfMonth.weekday % 7; // Sunday-first grid

    final prevMonthLastDay =
        DateTime(displayedMonth.year, displayedMonth.month, 0).day;

    final totalCells = ((leadingEmptyCells + daysInMonth) / 7).ceil() * 7;

    final today = DateTime.now();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [
          BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () => onMonthChanged(
                  DateTime(displayedMonth.year, displayedMonth.month - 1),
                ),
                icon: const Icon(Icons.chevron_left, color: AppColors.headline),
              ),
              Text(
                _monthYearLabel(displayedMonth),
                style: AppTextStyles.calendarMonthLabel,
              ),
              IconButton(
                onPressed: () => onMonthChanged(
                  DateTime(displayedMonth.year, displayedMonth.month + 1),
                ),
                icon: const Icon(Icons.chevron_right, color: AppColors.headline),
              ),
            ],
          ),
          const SizedBox(height: 4),

          Row(
            children: _weekdayLabels
                .map((d) => Expanded(
                      child: Center(
                        child: Text(d, style: AppTextStyles.calendarWeekdayLabel),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 6),

          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: totalCells,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
            ),
            itemBuilder: (context, index) {
              late DateTime cellDate;
              bool inCurrentMonth = true;

              if (index < leadingEmptyCells) {
                final day = prevMonthLastDay - (leadingEmptyCells - index - 1);
                cellDate = DateTime(
                    displayedMonth.year, displayedMonth.month - 1, day);
                inCurrentMonth = false;
              } else if (index - leadingEmptyCells < daysInMonth) {
                final day = index - leadingEmptyCells + 1;
                cellDate =
                    DateTime(displayedMonth.year, displayedMonth.month, day);
              } else {
                final day = index - leadingEmptyCells - daysInMonth + 1;
                cellDate = DateTime(
                    displayedMonth.year, displayedMonth.month + 1, day);
                inCurrentMonth = false;
              }

              final bool isSelected =
                  selectedDate != null && _isSameDay(cellDate, selectedDate!);
              final bool isToday = _isSameDay(cellDate, today);
              final bool isMarked =
                  markedDates.any((m) => _isSameDay(m, cellDate));

              return _DayCell(
                day: cellDate.day,
                inCurrentMonth: inCurrentMonth,
                isSelected: isSelected,
                isToday: isToday,
                isMarked: isMarked,
                onTap: () => onDateSelected(cellDate),
              );
            },
          ),
        ],
      ),
    );
  }

  String _monthYearLabel(DateTime date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return '${months[date.month - 1]} ${date.year}';
  }
}

class _DayCell extends StatelessWidget {
  final int day;
  final bool inCurrentMonth;
  final bool isSelected;
  final bool isToday;
  final bool isMarked;
  final VoidCallback onTap;

  const _DayCell({
    required this.day,
    required this.inCurrentMonth,
    required this.isSelected,
    required this.isToday,
    required this.isMarked,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Padding(
        padding: const EdgeInsets.all(3),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 30,
              height: 30,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected ? AppColors.calendarSelectedBg : null,
                border: (!isSelected && isToday)
                    ? Border.all(color: AppColors.calendarTodayBorder)
                    : null,
              ),
              child: Text(
                '$day',
                style: AppTextStyles.calendarDayNumber.copyWith(
                  color: isSelected
                      ? Colors.white
                      : inCurrentMonth
                          ? AppColors.headline
                          : AppColors.calendarDisabledText,
                  fontWeight:
                      isSelected || isToday ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ),
            SizedBox(
              height: 6,
              child: isMarked && !isSelected
                  ? Container(
                      width: 5,
                      height: 5,
                      decoration: const BoxDecoration(
                        color: AppColors.calendarMarkerDot,
                        shape: BoxShape.circle,
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
