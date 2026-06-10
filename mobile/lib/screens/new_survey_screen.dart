import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:wechat_assets_picker/wechat_assets_picker.dart';

import '../core/routes.dart';
import '../providers/survey_provider.dart';
import '../services/location_service.dart';
import '../utils/vehicle_number.dart';
import '../widgets/photo_thumbnail.dart';
import '../widgets/vehicle_number_field.dart';

class NewSurveyScreen extends StatefulWidget {
  const NewSurveyScreen({super.key});

  @override
  State<NewSurveyScreen> createState() => _NewSurveyScreenState();
}

class _NewSurveyScreenState extends State<NewSurveyScreen> {
  final _vehicle = TextEditingController();
  final _notes = TextEditingController();
  final _locationService = LocationService();
  bool _locating = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final p = context.read<SurveyProvider>();
      final s = p.current;
      if (s != null) {
        _vehicle.text = s.vehicleNumber;
        _notes.text = s.notes;
        setState(() {});
      }
      await _captureLocationOnce();
    });
  }

  @override
  void dispose() {
    _vehicle.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _captureLocationOnce() async {
    final s = context.read<SurveyProvider>();
    if (s.current?.latitude != null) return;
    setState(() => _locating = true);
    final loc = await _locationService.getCurrentLocation();
    if (loc != null) {
      s.setLocation(loc.latitude, loc.longitude);
    }
    if (mounted) setState(() => _locating = false);
  }

  Future<void> _pickFromGallery() async {
    final assets = await AssetPicker.pickAssets(
      context,
      pickerConfig: const AssetPickerConfig(
        maxAssets: 200,
        requestType: RequestType.image,
      ),
    );
    if (assets == null || assets.isEmpty) return;
    final files = <File>[];
    for (final a in assets) {
      final f = await a.file;
      if (f != null) files.add(f);
    }
    await context.read<SurveyProvider>().addPhotos(files);
  }

  Future<void> _captureCamera() async {
    final picker = ImagePicker();
    final xfile = await picker.pickImage(source: ImageSource.camera, imageQuality: 92);
    if (xfile == null) return;
    await context.read<SurveyProvider>().addPhotos([File(xfile.path)]);
  }

  Future<void> _submit() async {
    final provider = context.read<SurveyProvider>();
    final s = provider.current!;
    final vn = VehicleNumber.normalize(_vehicle.text);
    if (!VehicleNumber.isValid(vn)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid vehicle number (e.g. MH12AB1234)')),
      );
      return;
    }
    if (s.photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one photo before saving')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      try {
        final dup = await provider.duplicateCheck();
        if (dup['duplicate'] == true && mounted) {
          final cont = await showDialog<bool>(
            context: context,
            builder: (_) => AlertDialog(
              title: const Text('Recent survey found'),
              content: const Text('This vehicle was surveyed recently.\nContinue anyway?'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Continue')),
              ],
            ),
          );
          if (cont != true) {
            setState(() => _submitting = false);
            return;
          }
        }
      } catch (_) {
        // Offline — skip duplicate check; backend will accept on sync.
      }

      await provider.enqueueForSync();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Survey saved. Will upload when online.')),
      );
      Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.home, (_) => false);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<SurveyProvider>().current;
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Survey'),
        actions: [
          IconButton(
            tooltip: 'Discard draft',
            icon: const Icon(Icons.delete_outline),
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Discard draft?'),
                  content: const Text('All entered data and selected photos will be lost.'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
                    FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Discard')),
                  ],
                ),
              );
              if (confirm == true) {
                await context.read<SurveyProvider>().abandonDraft();
                if (mounted) Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.home, (_) => false);
              }
            },
          ),
        ],
      ),
      body: s == null
          ? const Center(child: Text('No active survey.'))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                VehicleNumberField(
                  controller: _vehicle,
                  onChanged: (v) => context.read<SurveyProvider>().setVehicleNumber(v),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _notes,
                  decoration: const InputDecoration(
                    labelText: 'Notes',
                    hintText: 'Customer name, location, damage description...',
                    alignLabelWithHint: true,
                  ),
                  maxLines: 5,
                  onChanged: (v) => context.read<SurveyProvider>().setNotes(v),
                ),
                const SizedBox(height: 16),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.location_on),
                    title: Text(s.latitude == null
                        ? (_locating ? 'Capturing location...' : 'Location not captured')
                        : 'GPS: ${s.latitude!.toStringAsFixed(5)}, ${s.longitude!.toStringAsFixed(5)}'),
                    trailing: TextButton.icon(
                      icon: const Icon(Icons.refresh),
                      label: const Text('Re-capture'),
                      onPressed: _locating ? null : _captureLocationOnce,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text('Photos (${s.photos.length})',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Camera'),
                        onPressed: _captureCamera,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.photo_library),
                        label: const Text('Gallery'),
                        onPressed: _pickFromGallery,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (s.photos.isNotEmpty)
                  OutlinedButton.icon(
                    icon: const Icon(Icons.reorder),
                    label: Text('Preview & reorder (${s.photos.length})'),
                    onPressed: () => Navigator.of(context).pushNamed(AppRoutes.photoPreview),
                  ),
                const SizedBox(height: 12),
                if (s.photos.isNotEmpty)
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 6,
                      crossAxisSpacing: 6,
                    ),
                    itemCount: s.photos.length,
                    itemBuilder: (_, i) => PhotoThumbnail(
                      photo: s.photos[i],
                      onDelete: () => context.read<SurveyProvider>().removePhotoAt(i),
                    ),
                  ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting ? null : _submit,
                  child: _submitting
                      ? const SizedBox(
                          height: 20, width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Save & Upload'),
                ),
              ],
            ),
    );
  }
}
