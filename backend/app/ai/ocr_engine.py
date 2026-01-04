"""
OCR Engine for Receipt/Invoice Processing
Extracts transaction data from receipt images
"""
import re
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import base64

try:
    from PIL import Image
    import pytesseract
except ImportError:
    pytesseract = None

@dataclass
class ReceiptItem:
    name: str
    quantity: int
    price: float
    category: str

@dataclass
class ReceiptData:
    merchant_name: Optional[str]
    total_amount: float
    items: List[ReceiptItem]
    date: Optional[str]
    payment_method: Optional[str]
    confidence: float
    raw_text: str

class OCREngine:
    """OCR Engine for receipt processing"""
    
    # Merchant patterns
    MERCHANT_PATTERNS = [
        r'(?:alfamart|indomaret|hypermart|carrefour|giant|lotte)',
        r'(?:mcd|kfc|burger king|pizza hut|domino)',
        r'(?:starbucks|kopi kenangan|janji jiwa)',
    ]
    
    # Amount patterns
    AMOUNT_PATTERNS = [
        r'total\s*:?\s*rp\.?\s*([\d.,]+)',
        r'grand total\s*:?\s*rp\.?\s*([\d.,]+)',
        r'jumlah\s*:?\s*rp\.?\s*([\d.,]+)',
        r'bayar\s*:?\s*rp\.?\s*([\d.,]+)',
    ]
    
    # Item patterns
    ITEM_PATTERN = r'(.+?)\s+(\d+)\s*x?\s*rp\.?\s*([\d.,]+)'
    
    # Category keywords
    CATEGORY_KEYWORDS = {
        "Makanan": ["nasi", "mie", "roti", "kue", "snack", "makanan", "ayam", "sate", "bakso"],
        "Minuman": ["kopi", "teh", "jus", "air", "susu", "minuman", "es"],
        "Keperluan Rumah Tangga": ["sabun", "detergen", "shampo", "tissue", "pasta gigi"],
        "Belanja": ["baju", "celana", "sepatu", "tas"],
    }
    
    def __init__(self):
        if pytesseract is None:
            raise ImportError("pytesseract not installed. Run: pip install pytesseract pillow")
    
    def process_image(self, image_path: str) -> ReceiptData:
        """Process receipt image and extract data"""
        try:
            # Extract text using OCR
            image = Image.open(image_path)
            raw_text = pytesseract.image_to_string(image, lang='ind+eng')
            
            # Parse the extracted text
            return self._parse_receipt_text(raw_text)
        except Exception as e:
            print(f"OCR Error: {e}")
            return ReceiptData(
                merchant_name=None,
                total_amount=0.0,
                items=[],
                date=None,
                payment_method=None,
                confidence=0.0,
                raw_text=str(e)
            )
    
    def process_base64_image(self, base64_string: str) -> ReceiptData:
        """Process base64 encoded image"""
        import io
        
        try:
            # Decode base64
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            
            # Extract text
            raw_text = pytesseract.image_to_string(image, lang='ind+eng')
            
            # Parse
            return self._parse_receipt_text(raw_text)
        except Exception as e:
            print(f"OCR Error: {e}")
            return ReceiptData(
                merchant_name=None,
                total_amount=0.0,
                items=[],
                date=None,
                payment_method=None,
                confidence=0.0,
                raw_text=str(e)
            )
    
    def _parse_receipt_text(self, text: str) -> ReceiptData:
        """Parse extracted text to structured data"""
        text_lower = text.lower()
        
        # Extract merchant
        merchant = self._extract_merchant(text_lower)
        
        # Extract total amount
        total_amount = self._extract_total_amount(text_lower)
        
        # Extract items
        items = self._extract_items(text_lower)
        
        # Extract date
        date = self._extract_date(text_lower)
        
        # Extract payment method
        payment_method = self._extract_payment_method(text_lower)
        
        # Calculate confidence
        confidence = self._calculate_confidence(merchant, total_amount, items)
        
        return ReceiptData(
            merchant_name=merchant,
            total_amount=total_amount,
            items=items,
            date=date,
            payment_method=payment_method,
            confidence=confidence,
            raw_text=text
        )
    
    def _extract_merchant(self, text: str) -> Optional[str]:
        """Extract merchant name from text"""
        for pattern in self.MERCHANT_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).title()
        
        # Try to get first line as merchant
        lines = text.strip().split('\n')
        if lines:
            return lines[0].strip().title()
        
        return None
    
    def _extract_total_amount(self, text: str) -> float:
        """Extract total amount from text"""
        for pattern in self.AMOUNT_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace('.', '').replace(',', '')
                try:
                    return float(amount_str)
                except:
                    continue
        
        # Fallback: find largest number
        numbers = re.findall(r'(\d{4,})', text)
        if numbers:
            amounts = [float(n) for n in numbers]
            return max(amounts)
        
        return 0.0
    
    def _extract_items(self, text: str) -> List[ReceiptItem]:
        """Extract line items from receipt"""
        items = []
        lines = text.split('\n')
        
        for line in lines:
            # Try to match item pattern
            match = re.search(self.ITEM_PATTERN, line, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                quantity = int(match.group(2))
                price_str = match.group(3).replace('.', '').replace(',', '')
                
                try:
                    price = float(price_str)
                    category = self._categorize_item(name)
                    
                    items.append(ReceiptItem(
                        name=name,
                        quantity=quantity,
                        price=price,
                        category=category
                    ))
                except:
                    continue
        
        return items
    
    def _categorize_item(self, item_name: str) -> str:
        """Categorize item based on name"""
        item_lower = item_name.lower()
        
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in item_lower:
                    return category
        
        return "Lainnya"
    
    def _extract_date(self, text: str) -> Optional[str]:
        """Extract transaction date"""
        # Pattern: DD/MM/YYYY or DD-MM-YYYY
        date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
        match = re.search(date_pattern, text)
        if match:
            return match.group(1)
        return None
    
    def _extract_payment_method(self, text: str) -> Optional[str]:
        """Extract payment method"""
        payment_keywords = {
            "Cash": ["cash", "tunai", "uang tunai"],
            "Debit": ["debit", "kartu debit"],
            "Credit": ["credit", "kartu kredit"],
            "GoPay": ["gopay", "go-pay"],
            "OVO": ["ovo"],
            "Dana": ["dana"],
            "ShopeePay": ["shopeepay", "shopee pay"],
        }
        
        for method, keywords in payment_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    return method
        
        return None
    
    def _calculate_confidence(self, merchant: Optional[str], 
                            total: float, items: List[ReceiptItem]) -> float:
        """Calculate confidence score"""
        score = 0.0
        
        if merchant:
            score += 0.3
        if total > 0:
            score += 0.4
        if items:
            score += 0.3
        
        return round(score, 2)

# Singleton instance
ocr_engine = OCREngine() if pytesseract else None
