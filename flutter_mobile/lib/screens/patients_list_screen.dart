import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/patient_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../app_page_header.dart';
import 'patient_form_screen.dart';
import 'patient_detail_screen.dart';

class PatientsListScreen extends StatefulWidget {
  const PatientsListScreen({super.key});

  @override
  State<PatientsListScreen> createState() => _PatientsListScreenState();
}

class _PatientsListScreenState extends State<PatientsListScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PatientProvider>().loadPatients();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final double horizontalPadding = width >= 600 ? 32 : 20;
    final provider = context.watch<PatientProvider>();

    return Scaffold(
      backgroundColor: AppColors.screenBg,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).pushNamed(PatientFormScreen.routeName);
        },
        backgroundColor: AppColors.primaryTeal,
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                12,
                horizontalPadding,
                0,
              ),
              child: const AppPageHeader(name: 'Patients'),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search patients...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onChanged: (value) {
                  provider.setSearch(value);
                  provider.loadPatients();
                },
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => provider.refresh(),
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.patients.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: EdgeInsets.symmetric(
                          horizontal: horizontalPadding,
                        ),
                        itemCount: provider.patients.length,
                        itemBuilder: (context, index) {
                          final patient = provider.patients[index];
                          return _PatientCard(
                            patient: patient,
                            onTap: () {
                              context.read<PatientProvider>().loadPatient(
                                patient.id,
                              );
                              Navigator.of(
                                context,
                              ).pushNamed(PatientDetailScreen.routeName);
                            },
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline, size: 64, color: AppColors.fieldHint),
          const SizedBox(height: 16),
          const Text(
            'No patients found',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text('Tap + to add a new patient'),
        ],
      ),
    );
  }
}

class _PatientCard extends StatelessWidget {
  final dynamic patient;
  final VoidCallback onTap;

  const _PatientCard({required this.patient, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final initials = '${patient.firstName[0]}${patient.lastName[0]}'
        .toUpperCase();
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.areaCardIconBg,
                child: Text(
                  initials,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryTeal,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(patient.fullName, style: AppTextStyles.cardHeading),
                    const SizedBox(height: 4),
                    if (patient.email != null)
                      Text(patient.email!, style: AppTextStyles.cardSubText),
                    if (patient.phone != null)
                      Text(patient.phone!, style: AppTextStyles.cardSubText),
                  ],
                ),
              ),
              if (patient.appointmentCount != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryTeal.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${patient.appointmentCount} appts',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryTeal,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
