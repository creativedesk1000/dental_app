import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/patient_provider.dart';
import 'providers/appointment_provider.dart';
import 'providers/doctor_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/home_shell_screen.dart';
import 'screens/appointment_detail_screen.dart';
import 'screens/appointment_form_screen.dart';
import 'screens/patient_detail_screen.dart';
import 'screens/patient_form_screen.dart';
import 'screens/change_password_screen.dart';
import 'screens/doctor_profile_screen.dart';
import 'screens/doctor_schedule_screen.dart';
import 'screens/doctor_leave_screen.dart';

void main() => runApp(const DentalCareApp());

class DentalCareApp extends StatelessWidget {
  const DentalCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => PatientProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
        ChangeNotifierProvider(create: (_) => DoctorProvider()),
      ],
      child: MaterialApp(
        title: 'Dental Care',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          fontFamily: 'Roboto',
          colorSchemeSeed: const Color(0xFF0F9D8F),
        ),
        initialRoute: SplashScreen.routeName,
        routes: {
          SplashScreen.routeName: (_) => const SplashScreen(),
          LoginScreen.routeName: (_) => const LoginScreen(),
          SignUpScreen.routeName: (_) => const SignUpScreen(),
          ForgotPasswordScreen.routeName: (_) => const ForgotPasswordScreen(),
          HomeShellScreen.routeName: (_) => const HomeShellScreen(),
          AppointmentDetailScreen.routeName: (_) =>
              const AppointmentDetailScreen(),
          AppointmentFormScreen.routeName: (_) => const AppointmentFormScreen(),
          PatientDetailScreen.routeName: (_) => const PatientDetailScreen(),
          PatientFormScreen.routeName: (_) => const PatientFormScreen(),
          ChangePasswordScreen.routeName: (_) => const ChangePasswordScreen(),
          DoctorProfileScreen.routeName: (_) => const DoctorProfileScreen(),
          DoctorScheduleScreen.routeName: (_) => const DoctorScheduleScreen(),
          DoctorLeaveScreen.routeName: (_) => const DoctorLeaveScreen(),
        },
      ),
    );
  }
}
