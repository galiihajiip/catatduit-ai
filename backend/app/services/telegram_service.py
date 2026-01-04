import httpx
from typing import Optional
from app.core.config import settings

class TelegramService:
    """Telegram Bot Service"""
    
    BASE_URL = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"
    
    @classmethod
    async def send_message(cls, chat_id: int, text: str, reply_markup: Optional[dict] = None) -> bool:
        """Send message to Telegram chat"""
        async with httpx.AsyncClient() as client:
            payload = {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML"
            }
            if reply_markup:
                payload["reply_markup"] = reply_markup
            
            response = await client.post(f"{cls.BASE_URL}/sendMessage", json=payload)
            return response.status_code == 200
    
    @classmethod
    async def send_confirmation(cls, chat_id: int, parsed_data: dict) -> bool:
        """Send confirmation message with inline keyboard"""
        text = f"""
✅ <b>Transaksi Terdeteksi</b>

📝 <b>Tipe:</b> {parsed_data['intent'].upper()}
💰 <b>Jumlah:</b> Rp {parsed_data['amount']:,.0f}
📂 <b>Kategori:</b> {parsed_data['category']}
💳 <b>Wallet:</b> {parsed_data.get('wallet', 'Belum dipilih')}
📄 <b>Deskripsi:</b> {parsed_data['description']}
🎯 <b>Confidence:</b> {parsed_data['confidence']*100:.0f}%

Apakah data ini sudah benar?
"""
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "✅ Ya, Simpan", "callback_data": "confirm_yes"},
                    {"text": "❌ Tidak", "callback_data": "confirm_no"}
                ],
                [
                    {"text": "✏️ Edit", "callback_data": "confirm_edit"}
                ]
            ]
        }
        return await cls.send_message(chat_id, text, reply_markup)
    
    @classmethod
    async def send_success(cls, chat_id: int, transaction_data: dict) -> bool:
        """Send success message after saving transaction"""
        text = f"""
✅ <b>Transaksi Berhasil Disimpan!</b>

💰 Rp {transaction_data['amount']:,.0f}
📂 {transaction_data['category']}
📄 {transaction_data['description']}

Ketik /today untuk lihat ringkasan hari ini.
"""
        return await cls.send_message(chat_id, text)

    @classmethod
    async def send_daily_summary(cls, chat_id: int, summary: dict) -> bool:
        """Send daily summary"""
        text = f"""
📊 <b>Ringkasan Hari Ini</b>

💵 <b>Pemasukan:</b> Rp {summary['income']:,.0f}
💸 <b>Pengeluaran:</b> Rp {summary['expense']:,.0f}
📈 <b>Net:</b> Rp {summary['net']:,.0f}

📝 <b>Transaksi:</b> {summary['transaction_count']} kali

Top Pengeluaran:
{cls._format_top_categories(summary.get('top_categories', []))}
"""
        return await cls.send_message(chat_id, text)
    
    @classmethod
    async def send_monthly_summary(cls, chat_id: int, summary: dict) -> bool:
        """Send monthly summary"""
        text = f"""
📊 <b>Ringkasan Bulan Ini</b>

💵 <b>Total Pemasukan:</b> Rp {summary['total_income']:,.0f}
💸 <b>Total Pengeluaran:</b> Rp {summary['total_expense']:,.0f}
📈 <b>Net Income:</b> Rp {summary['net_income']:,.0f}

📉 <b>Rasio Pengeluaran:</b> {summary['expense_ratio']:.1f}%
💰 <b>Rasio Tabungan:</b> {summary['saving_ratio']:.1f}%

Top 5 Kategori Pengeluaran:
{cls._format_top_categories(summary.get('top_categories', []))}
"""
        return await cls.send_message(chat_id, text)
    
    @classmethod
    def _format_top_categories(cls, categories: list) -> str:
        """Format top categories for display"""
        if not categories:
            return "Belum ada data"
        
        lines = []
        for i, cat in enumerate(categories[:5], 1):
            lines.append(f"{i}. {cat['name']}: Rp {cat['amount']:,.0f}")
        return "\n".join(lines)
    
    @classmethod
    async def send_welcome(cls, chat_id: int, user_name: str) -> bool:
        """Send welcome message"""
        text = f"""
👋 <b>Halo {user_name}!</b>

Selamat datang di <b>CatatDuit AI</b> 🤖💰

Cukup chat, keuangan langsung tercatat & dianalisis!

<b>Cara Pakai:</b>
• Ketik langsung: "beli bakso 15rb"
• Atau: "gaji masuk 5jt dari kantor"

<b>Perintah:</b>
/today - Ringkasan hari ini
/month - Ringkasan bulan ini
/summary - Ringkasan lengkap
/undo - Batalkan transaksi terakhir

Mulai catat keuanganmu sekarang! 🚀
"""
        return await cls.send_message(chat_id, text)
    
    @classmethod
    async def send_undo_success(cls, chat_id: int, transaction: dict) -> bool:
        """Send undo success message"""
        text = f"""
↩️ <b>Transaksi Dibatalkan</b>

Transaksi berikut telah dihapus:
💰 Rp {transaction['amount']:,.0f}
📂 {transaction['category']}
📄 {transaction['description']}
"""
        return await cls.send_message(chat_id, text)

    @classmethod
    async def download_photo(cls, file_id: str) -> Optional[bytes]:
        """Download photo from Telegram"""
        try:
            async with httpx.AsyncClient() as client:
                # Get file path
                response = await client.get(f"{cls.BASE_URL}/getFile?file_id={file_id}")
                if response.status_code != 200:
                    return None
                
                data = response.json()
                if not data.get('ok'):
                    return None
                
                file_path = data['result']['file_path']
                
                # Download file
                file_url = f"https://api.telegram.org/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path}"
                file_response = await client.get(file_url)
                
                if file_response.status_code == 200:
                    return file_response.content
                
                return None
        except Exception as e:
            print(f"Error downloading photo: {e}")
            return None
    
    @classmethod
    async def send_receipt_result(cls, chat_id: int, receipt_data: dict, transaction_data: dict) -> bool:
        """Send receipt scan result"""
        items_text = ""
        if receipt_data.get('items'):
            items_text = "\n\n📦 <b>Items:</b>\n"
            for item in receipt_data['items'][:5]:  # Show max 5 items
                items_text += f"• {item['name']} - Rp {item['price']:,.0f}\n"
            if len(receipt_data['items']) > 5:
                items_text += f"... dan {len(receipt_data['items']) - 5} item lainnya\n"
        
        text = f"""
📸 <b>Struk Berhasil Diproses!</b>

🏪 <b>Merchant:</b> {receipt_data.get('merchant', 'Unknown')}
💰 <b>Total:</b> Rp {receipt_data['total']:,.0f}
📊 <b>Confidence:</b> {receipt_data['confidence']*100:.0f}%
{items_text}
✅ Transaksi telah dicatat dan saldo dompet diperbarui.
💳 <b>Saldo Baru:</b> Rp {transaction_data['new_balance']:,.0f}

Ketik /wallets untuk lihat semua dompet.
"""
        return await cls.send_message(chat_id, text)
