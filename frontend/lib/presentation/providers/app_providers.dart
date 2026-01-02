import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/api_repository.dart';
import '../../data/models/transaction_model.dart';
import '../../data/models/wallet_model.dart';
import '../../data/models/category_model.dart';
import '../../data/models/analytics_model.dart';

// Repository Provider
final apiRepositoryProvider = Provider<ApiRepository>((ref) {
  // In production, get userId from auth state
  return ApiRepository(userId: 'demo-user-id');
});

// Transactions Provider
final transactionsProvider = FutureProvider<List<TransactionModel>>((ref) async {
  final repo = ref.watch(apiRepositoryProvider);
  return repo.getTransactions();
});

// Wallets Provider
final walletsProvider = FutureProvider<List<WalletModel>>((ref) async {
  final repo = ref.watch(apiRepositoryProvider);
  return repo.getWallets();
});

// Categories Provider
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final repo = ref.watch(apiRepositoryProvider);
  return repo.getCategories();
});

// Analytics Provider
final analyticsProvider = FutureProvider<AnalyticsModel>((ref) async {
  final repo = ref.watch(apiRepositoryProvider);
  return repo.getAnalytics();
});

// Monthly Summary Provider
final monthlySummaryProvider = FutureProvider<MonthlySummary>((ref) async {
  final repo = ref.watch(apiRepositoryProvider);
  return repo.getMonthlySummary();
});

// Total Balance Provider
final totalBalanceProvider = Provider<double>((ref) {
  final walletsAsync = ref.watch(walletsProvider);
  return walletsAsync.when(
    data: (wallets) => wallets.fold(0.0, (sum, w) => sum + w.balance),
    loading: () => 0.0,
    error: (_, __) => 0.0,
  );
});

// User Pro Status Provider
final isProUserProvider = StateProvider<bool>((ref) => false);
