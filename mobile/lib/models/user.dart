class AppUser {
  final String id;
  final String employeeId;
  final String name;
  final String mobile;
  final String role;

  const AppUser({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.mobile,
    required this.role,
  });

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: (j['_id'] ?? j['id'] ?? '').toString(),
        employeeId: (j['employeeId'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        mobile: (j['mobile'] ?? '').toString(),
        role: (j['role'] ?? 'SURVEYOR').toString(),
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'employeeId': employeeId,
        'name': name,
        'mobile': mobile,
        'role': role,
      };
}
