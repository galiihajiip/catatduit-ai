class CategoryModel {
  final String id;
  final String name;
  final String colorHex;
  final String icon;
  final String type;

  CategoryModel({
    required this.id,
    required this.name,
    required this.colorHex,
    required this.icon,
    required this.type,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'],
      name: json['name'],
      colorHex: json['color_hex'] ?? '#3498DB',
      icon: json['icon'] ?? 'category',
      type: json['type'] ?? 'expense',
    );
  }
}
