class AnalyticsModel {
  final MonthlySummary summary;
  final List<CategoryBreakdown> categoryBreakdown;
  final List<WeeklyTrend> weeklyTrend;
  final int transactionFrequency;

  AnalyticsModel({
    required this.summary,
    required this.categoryBreakdown,
    required this.weeklyTrend,
    required this.transactionFrequency,
  });

  factory AnalyticsModel.fromJson(Map<String, dynamic> json) {
    return AnalyticsModel(
      summary: MonthlySummary.fromJson(json['summary']),
      categoryBreakdown: (json['category_breakdown'] as List)
          .map((e) => CategoryBreakdown.fromJson(e))
          .toList(),
      weeklyTrend: (json['weekly_trend'] as List)
          .map((e) => WeeklyTrend.fromJson(e))
          .toList(),
      transactionFrequency: json['transaction_frequency'] ?? 0,
    );
  }
}

class MonthlySummary {
  final String month;
  final double totalIncome;
  final double totalExpense;
  final double netIncome;
  final double expenseRatio;
  final double savingRatio;

  MonthlySummary({
    required this.month,
    required this.totalIncome,
    required this.totalExpense,
    required this.netIncome,
    required this.expenseRatio,
    required this.savingRatio,
  });

  factory MonthlySummary.fromJson(Map<String, dynamic> json) {
    return MonthlySummary(
      month: json['month'] ?? '',
      totalIncome: (json['total_income'] as num?)?.toDouble() ?? 0,
      totalExpense: (json['total_expense'] as num?)?.toDouble() ?? 0,
      netIncome: (json['net_income'] as num?)?.toDouble() ?? 0,
      expenseRatio: (json['expense_ratio'] as num?)?.toDouble() ?? 0,
      savingRatio: (json['saving_ratio'] as num?)?.toDouble() ?? 0,
    );
  }
}

class CategoryBreakdown {
  final String category;
  final double amount;
  final double percentage;
  final String colorHex;
  final String icon;

  CategoryBreakdown({
    required this.category,
    required this.amount,
    required this.percentage,
    required this.colorHex,
    required this.icon,
  });

  factory CategoryBreakdown.fromJson(Map<String, dynamic> json) {
    return CategoryBreakdown(
      category: json['category'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
      colorHex: json['color_hex'] ?? '#3498DB',
      icon: json['icon'] ?? 'category',
    );
  }
}

class WeeklyTrend {
  final String week;
  final String startDate;
  final String endDate;
  final double income;
  final double expense;

  WeeklyTrend({
    required this.week,
    required this.startDate,
    required this.endDate,
    required this.income,
    required this.expense,
  });

  factory WeeklyTrend.fromJson(Map<String, dynamic> json) {
    return WeeklyTrend(
      week: json['week'] ?? '',
      startDate: json['start_date'] ?? '',
      endDate: json['end_date'] ?? '',
      income: (json['income'] as num?)?.toDouble() ?? 0,
      expense: (json['expense'] as num?)?.toDouble() ?? 0,
    );
  }
}
