# CatatDuit AI Pro Features

## Free vs Pro Comparison

| Feature | Free | Pro |
|---------|------|-----|
| Wallets | 3 max | Unlimited |
| Categories | System only | Custom categories |
| Transaction History | 1 month | Unlimited |
| Analytics | Basic | Advanced + AI Insights |
| Export | - | PDF & CSV |
| Budget Alerts | - | ✓ |
| Historical Comparison | - | ✓ |
| Cloud Sync | - | ✓ |
| AI Processing | Standard | Priority |
| Support | Community | Priority |

## Pro Feature Details

### 1. Unlimited Wallets
- Create unlimited wallet accounts
- Custom colors and icons
- Multi-currency support (future)

### 2. Custom Categories
- Create personal categories
- Custom icons and colors
- Category merging
- Sub-categories

### 3. AI Insight Recommendations
- Spending pattern analysis
- Saving recommendations
- Budget optimization tips
- Anomaly detection alerts
- Monthly financial health score

### 4. Monthly PDF Export
- Professional report design
- Income vs expense breakdown
- Category analysis charts
- Transaction list
- Trend analysis
- Customizable date range

### 5. CSV Export
- Full transaction history
- Filterable by date/category
- Compatible with Excel/Sheets
- Bulk data backup

### 6. Smart Budget Alerts
- Category spending limits
- Daily/weekly/monthly budgets
- Real-time notifications
- Overspending warnings
- Goal tracking

### 7. Historical Comparison
- Month-over-month analysis
- Year-over-year trends
- Category comparison
- Seasonal patterns
- Growth metrics

### 8. Cloud Sync
- Multi-device sync
- Real-time updates
- Secure backup
- Data recovery
- Cross-platform access

### 9. Priority AI Processing
- Faster response times
- Higher accuracy parsing
- Advanced entity extraction
- Context-aware suggestions

## Pricing

### Monthly Plan
- Rp 49.000/month
- Cancel anytime
- Full feature access

### Annual Plan
- Rp 399.000/year (Save 32%)
- Rp 33.250/month equivalent
- 2 months free

### Lifetime
- Rp 999.000 one-time
- All future updates included
- Priority support forever

## Implementation Notes

### Feature Gating
```dart
// Check pro status before feature access
if (!user.isPro) {
  showUpgradeModal();
  return;
}
// Proceed with pro feature
```

### API Enforcement
```python
# Backend check
if not user.is_pro:
    raise HTTPException(
        status_code=403,
        detail="This feature requires Pro subscription"
    )
```

### Database Flag
```sql
-- User table
is_pro BOOLEAN DEFAULT FALSE
pro_expires_at TIMESTAMP NULL
```

### Upgrade Flow
1. User taps locked feature
2. Show upgrade modal with benefits
3. Redirect to payment
4. Process payment
5. Update user.is_pro = true
6. Unlock features immediately

### Payment Integration
- Google Play Billing (Android)
- Apple In-App Purchase (iOS)
- Stripe (Web fallback)

## Analytics Events

Track these for conversion optimization:
- `pro_modal_shown`
- `pro_modal_dismissed`
- `pro_checkout_started`
- `pro_purchase_completed`
- `pro_purchase_failed`
- `pro_feature_attempted` (with feature name)
