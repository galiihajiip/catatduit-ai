class TransactionModel {
  final String id;
  final String walletId;
  final String categoryId;
  final TransactionType type;
  final double amount;
  final String? description;
  final double? aiConfidence;
  final DateTime createdAt;

  TransactionModel({
    required this.id,
    required this.walletId,
    required this.categoryId,
    required this.type,
    required this.amount,
    this.description,
    this.aiConfidence,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'],
      walletId: json['wallet_id'],
      categoryId: json['category_id'],
      type: TransactionType.fromString(json['type']),
      amount: (json['amount'] as num).toDouble(),
      description: json['description'],
      aiConfidence: json['ai_confidence']?.toDouble(),
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'wallet_id': walletId,
      'category_id': categoryId,
      'type': type.value,
      'amount': amount,
      'description': description,
    };
  }
}

enum TransactionType {
  expense('expense'),
  income('income'),
  transfer('transfer');

  final String value;
  const TransactionType(this.value);

  static TransactionType fromString(String value) {
    return TransactionType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => TransactionType.expense,
    );
  }
}
