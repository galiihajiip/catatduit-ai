import 'package:dio/dio.dart';
import '../models/transaction_model.dart';
import '../models/wallet_model.dart';
import '../models/category_model.dart';
import '../models/analytics_model.dart';
import '../../core/constants/api_constants.dart';

class ApiRepository {
  final Dio _dio;
  final String userId; // In production, get from auth

  ApiRepository({required this.userId})
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ));

  // Transactions
  Future<List<TransactionModel>> getTransactions({int limit = 50, int offset = 0}) async {
    final response = await _dio.get(
      ApiConstants.transactions,
      queryParameters: {'user_id': userId, 'limit': limit, 'offset': offset},
    );
    return (response.data as List).map((e) => TransactionModel.fromJson(e)).toList();
  }

  Future<TransactionModel> createTransaction(TransactionModel transaction) async {
    final response = await _dio.post(
      ApiConstants.transactions,
      data: transaction.toJson(),
      queryParameters: {'user_id': userId},
    );
    return TransactionModel.fromJson(response.data);
  }

  Future<void> deleteTransaction(String transactionId) async {
    await _dio.delete(
      '${ApiConstants.transactions}/$transactionId',
      queryParameters: {'user_id': userId},
    );
  }

  // Wallets
  Future<List<WalletModel>> getWallets() async {
    final response = await _dio.get(
      ApiConstants.wallets,
      queryParameters: {'user_id': userId},
    );
    return (response.data as List).map((e) => WalletModel.fromJson(e)).toList();
  }

  Future<WalletModel> createWallet(WalletModel wallet) async {
    final response = await _dio.post(
      ApiConstants.wallets,
      data: wallet.toJson(),
      queryParameters: {'user_id': userId},
    );
    return WalletModel.fromJson(response.data);
  }

  // Categories
  Future<List<CategoryModel>> getCategories() async {
    final response = await _dio.get(ApiConstants.categories);
    return (response.data as List).map((e) => CategoryModel.fromJson(e)).toList();
  }

  // Analytics
  Future<AnalyticsModel> getAnalytics() async {
    final response = await _dio.get(
      ApiConstants.analytics,
      queryParameters: {'user_id': userId},
    );
    return AnalyticsModel.fromJson(response.data);
  }

  Future<MonthlySummary> getMonthlySummary() async {
    final response = await _dio.get(
      ApiConstants.monthlySummary,
      queryParameters: {'user_id': userId},
    );
    return MonthlySummary.fromJson(response.data);
  }
}
