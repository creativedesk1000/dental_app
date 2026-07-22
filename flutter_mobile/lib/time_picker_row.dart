import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';

enum MeridiemPeriod { am, pm }

/// Hour : Minute input boxes followed by an AM/PM segmented toggle,
/// matching the time picker row in the mockup.
class TimePickerRow extends StatelessWidget {
  final TextEditingController hourController;
  final TextEditingController minuteController;
  final MeridiemPeriod period;
  final ValueChanged<MeridiemPeriod> onPeriodChanged;

  const TimePickerRow({
    super.key,
    required this.hourController,
    required this.minuteController,
    required this.period,
    required this.onPeriodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _TimeBox(controller: hourController, filled: false),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: Text(':', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        ),
        _TimeBox(controller: minuteController, filled: true),
        const SizedBox(width: 16),
        _PeriodToggle(period: period, onChanged: onPeriodChanged),
      ],
    );
  }
}

class _TimeBox extends StatelessWidget {
  final TextEditingController controller;
  final bool filled;

  const _TimeBox({required this.controller, required this.filled});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 56,
      height: 44,
      child: TextField(
        controller: controller,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 2,
        style: AppTextStyles.fieldInput,
        decoration: InputDecoration(
          counterText: '',
          filled: filled,
          fillColor: AppColors.inputBoxBg,
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.inputBoxBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.inputBoxBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.primaryTeal, width: 1.5),
          ),
        ),
      ),
    );
  }
}

class _PeriodToggle extends StatelessWidget {
  final MeridiemPeriod period;
  final ValueChanged<MeridiemPeriod> onChanged;

  const _PeriodToggle({required this.period, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.inputBoxBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _PeriodButton(
            label: 'AM',
            selected: period == MeridiemPeriod.am,
            onTap: () => onChanged(MeridiemPeriod.am),
            roundLeft: true,
          ),
          _PeriodButton(
            label: 'PM',
            selected: period == MeridiemPeriod.pm,
            onTap: () => onChanged(MeridiemPeriod.pm),
            roundRight: true,
          ),
        ],
      ),
    );
  }
}

class _PeriodButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final bool roundLeft;
  final bool roundRight;

  const _PeriodButton({
    required this.label,
    required this.selected,
    required this.onTap,
    this.roundLeft = false,
    this.roundRight = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.horizontal(
        left: roundLeft ? const Radius.circular(9) : Radius.zero,
        right: roundRight ? const Radius.circular(9) : Radius.zero,
      ),
      child: Container(
        width: 44,
        height: 44,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? AppColors.iconSquareBlue : Colors.white,
          borderRadius: BorderRadius.horizontal(
            left: roundLeft ? const Radius.circular(9) : Radius.zero,
            right: roundRight ? const Radius.circular(9) : Radius.zero,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: selected ? Colors.white : AppColors.fieldLabel,
          ),
        ),
      ),
    );
  }
}
