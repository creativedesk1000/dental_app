import 'package:flutter/material.dart';
import 'area_of_need_page.dart';
import 'home_page.dart';
import 'other_selection_screen.dart';
import 'prosthesis_fitted_time_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';

void main() => runApp(const DentalCareApp());

class DentalCareApp extends StatelessWidget {
  const DentalCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dental Care',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true),
      initialRoute: SplashScreen.routeName,
      routes: {
        SplashScreen.routeName: (_) => const SplashScreen(),
        LoginScreen.routeName: (_) => const LoginScreen(),
        SignUpScreen.routeName: (_) => const SignUpScreen(),
        HomePage.routeName: (_) => const HomePage(),
        AreaOfNeedPage.routeName: (_) => const AreaOfNeedPage(),
        OtherSelectionScreen.routeName: (_) => const OtherSelectionScreen(),
        ProsthesisFittedTimeScreen.routeName: (_) =>
            const ProsthesisFittedTimeScreen(),
      },
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case HomePage.routeName:
            return MaterialPageRoute(builder: (_) => const HomePage());
          case AreaOfNeedPage.routeName:
            return MaterialPageRoute(builder: (_) => const AreaOfNeedPage());
          case OtherSelectionScreen.routeName:
            return MaterialPageRoute(
              builder: (_) => const OtherSelectionScreen(),
            );
          case ProsthesisFittedTimeScreen.routeName:
            return MaterialPageRoute(
              builder: (_) => const ProsthesisFittedTimeScreen(),
            );
          default:
            return MaterialPageRoute(builder: (_) => const SplashScreen());
        }
      },
      onUnknownRoute: (settings) {
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      },
    );
  }
}
