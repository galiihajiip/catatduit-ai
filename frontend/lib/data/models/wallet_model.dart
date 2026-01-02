class WalletModel {
  final String id;
  final String name;
  final double balance;
  final String colorHex;
  final String icon;
  final DateTime createdAt;

  WalletModel({
    required this.id,
    required this.name,
    required this.balance,
    required this.colorHex,
    required this.icon,
    required this.createdAt,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      id: json['id'],
      name: json['name'],
      balance: (json['balance'] as num).toDouble(),
      colorHex: json['color_hex'] ?? '#16A085',
      icon: json['icon'] ?? 'wallet',
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'balance': balance,
      'color_hex': colorHex,
      'icon': icon,
    };
  }
}
