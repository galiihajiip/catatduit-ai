class ApiConstants {
  static const String baseUrl = 'http://localhost:8000';
  
  // Endpoints
  static const String transactions = '/transactions';
  static const String wallets = '/wallets';
  static const String categories = '/categories';
  static const String analytics = '/analytics';
  static const String monthlySummary = '/analytics/summary/monthly';
  static const String history = '/analytics/history';
}

class AppConstants {
  static const String appName = 'CatatDuit AI';
  static const String currency = 'IDR';
  static const String currencySymbol = 'Rp';
  
  // Free tier limits
  static const int freeWalletLimit = 3;
  static const int freeHistoryMonths = 1;
}
