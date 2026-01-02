import re
from datetime import datetime
from typing import Optional, Tuple
from dataclasses import dataclass

@dataclass
class ParsedTransaction:
    intent: str
    amount: float
    currency: str
    category: str
    wallet: Optional[str]
    description: str
    confidence: float
    timestamp: str

class IndonesianNLPEngine:
    """AI/NLP Engine for Indonesian financial text parsing"""
    
    # Category mapping rules (FIXED)
    CATEGORY_KEYWORDS = {
        "Makanan": ["bakso", "nasi", "makan", "kopi", "jajan", "mie", "ayam", "sate", 
                    "gorengan", "es", "teh", "minuman", "snack", "cemilan", "sarapan",
                    "makan siang", "makan malam", "dinner", "lunch", "breakfast"],
        "Tagihan": ["listrik", "air", "wifi", "internet", "pulsa", "token", "pln",
                    "indihome", "telkom", "gas", "pdam"],
        "Transportasi": ["bensin", "parkir", "ojol", "gojek", "grab", "taxi", "bus",
                        "kereta", "mrt", "lrt", "toll", "tol", "bbm", "pertamax"],
        "Keperluan Rumah Tangga": ["sabun", "sikat gigi", "detergen", "shampo", "pasta gigi",
                                   "tissue", "pel", "sapu", "ember", "gayung"],
        "Pemasukan": ["gaji", "salary", "honor", "bonus", "transfer masuk", "terima",
                      "dapat", "freelance", "proyek", "dividen"],
        "Belanja": ["beli", "belanja", "shopping", "mall", "toko", "online"],
        "Hiburan": ["nonton", "bioskop", "game", "spotify", "netflix", "youtube"],
        "Kesehatan": ["obat", "dokter", "rumah sakit", "apotek", "vitamin"],
    }
    
    # Wallet keywords
    WALLET_KEYWORDS = {
        "Bank BRI": ["bri", "bank bri"],
        "Bank BCA": ["bca", "bank bca"],
        "Bank Mandiri": ["mandiri", "bank mandiri"],
        "Bank BNI": ["bni", "bank bni"],
        "GoPay": ["gopay", "go-pay"],
        "OVO": ["ovo"],
        "Dana": ["dana"],
        "ShopeePay": ["shopeepay", "shopee pay"],
        "Cash": ["cash", "tunai", "kas"],
    }
    
    # Amount patterns
    AMOUNT_PATTERNS = [
        (r'(\d+)[.,](\d{3})[.,](\d{3})', lambda m: int(m.group(1) + m.group(2) + m.group(3))),
        (r'(\d+)[.,](\d{3})', lambda m: int(m.group(1) + m.group(2))),
        (r'(\d+)\s*(?:jt|juta)', lambda m: int(m.group(1)) * 1_000_000),
        (r'(\d+)\s*(?:rb|ribu|k)', lambda m: int(m.group(1)) * 1_000),
        (r'(\d+)', lambda m: int(m.group(1))),
    ]
    
    # Indonesian number words
    NUMBER_WORDS = {
        "satu": 1, "dua": 2, "tiga": 3, "empat": 4, "lima": 5,
        "enam": 6, "tujuh": 7, "delapan": 8, "sembilan": 9, "sepuluh": 10,
        "sebelas": 11, "seratus": 100, "seribu": 1000, "sejuta": 1_000_000,
    }
    
    # Intent keywords
    EXPENSE_KEYWORDS = ["beli", "bayar", "buat", "untuk", "habis", "keluar", "spend"]
    INCOME_KEYWORDS = ["dapat", "terima", "masuk", "gaji", "honor", "bonus", "transfer masuk"]
    TRANSFER_KEYWORDS = ["transfer", "kirim", "pindah", "tf"]

    def __init__(self):
        self.confidence_threshold = 0.85
    
    def parse(self, text: str) -> ParsedTransaction:
        """Main parsing method"""
        text_lower = text.lower().strip()
        
        intent, intent_conf = self._extract_intent(text_lower)
        amount, amount_conf = self._extract_amount(text_lower)
        category, cat_conf = self._extract_category(text_lower, intent)
        wallet, wallet_conf = self._extract_wallet(text_lower)
        description = self._extract_description(text_lower, category)
        
        # Calculate overall confidence
        confidence = (intent_conf * 0.3 + amount_conf * 0.4 + cat_conf * 0.3)
        
        return ParsedTransaction(
            intent=intent,
            amount=amount,
            currency="IDR",
            category=category,
            wallet=wallet,
            description=description,
            confidence=round(confidence, 2),
            timestamp=datetime.utcnow().isoformat()
        )
    
    def _extract_intent(self, text: str) -> Tuple[str, float]:
        """Extract transaction intent"""
        for keyword in self.INCOME_KEYWORDS:
            if keyword in text:
                return "income", 0.95
        
        for keyword in self.TRANSFER_KEYWORDS:
            if keyword in text:
                return "transfer", 0.90
        
        for keyword in self.EXPENSE_KEYWORDS:
            if keyword in text:
                return "expense", 0.95
        
        # Default to expense with lower confidence
        return "expense", 0.70
    
    def _extract_amount(self, text: str) -> Tuple[float, float]:
        """Extract amount from text"""
        # Try number word patterns first
        for word, value in self.NUMBER_WORDS.items():
            if word in text:
                if "ribu" in text or "rb" in text:
                    return float(value * 1000), 0.85
                if "juta" in text or "jt" in text:
                    return float(value * 1_000_000), 0.85
        
        # Try numeric patterns
        for pattern, converter in self.AMOUNT_PATTERNS:
            match = re.search(pattern, text)
            if match:
                try:
                    amount = converter(match)
                    if amount > 0:
                        return float(amount), 0.95
                except:
                    continue
        
        return 0.0, 0.0
    
    def _extract_category(self, text: str, intent: str) -> Tuple[str, float]:
        """Extract category based on keywords"""
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    return category, 0.95
        
        # Default categories based on intent
        if intent == "income":
            return "Pemasukan", 0.70
        return "Lainnya", 0.50
    
    def _extract_wallet(self, text: str) -> Tuple[Optional[str], float]:
        """Extract wallet/payment method"""
        for wallet, keywords in self.WALLET_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    return wallet, 0.95
        return None, 0.0
    
    def _extract_description(self, text: str, category: str) -> str:
        """Generate description from text"""
        # Clean up the text for description
        desc = text.strip()
        if len(desc) > 100:
            desc = desc[:100] + "..."
        return desc if desc else category

# Singleton instance
nlp_engine = IndonesianNLPEngine()
