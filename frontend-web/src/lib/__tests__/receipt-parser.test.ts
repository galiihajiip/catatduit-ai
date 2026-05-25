import { parseReceiptText } from '../ocr'
import { categorizeTransactionText, parseTransaction } from '../nlp'

interface ReceiptCase {
  name: string
  text: string
  merchant?: string | null
  total: number
  category: string
  minItems?: number
  forbiddenItemWords?: string[]
}

const receiptCases: ReceiptCase[] = [
  {
    name: 'BreadTalk bakery receipt',
    text: `BreadTalk
RUKO SUMMARECON BEKASI
1 Cream Bruille 14,000
1 Choco Croissant 10,500
1 Bank Of Chocolat 7,500
1 Bread Butter Fug 11,500
Subtotal : 43,500
Total: 43,500
Debit BCA`,
    merchant: 'Breadtalk',
    total: 43500,
    category: 'Makanan',
    minItems: 4,
  },
  {
    name: 'PLN token receipt with KWH amount',
    text: `** AENI CELL **
TOKEN : 200.000, OO JML KWH : 135.00
NO METER : 12345678901
IDPEL : 531000000000
TOTAL BAYAR : Rp 200.000
ADMIN BANK : Rp 3.000`,
    merchant: '** AENI CELL **',
    total: 200000,
    category: 'Tagihan',
    minItems: 1,
    forbiddenItemWords: ['kwh', 'idpel', 'meter'],
  },
  {
    name: 'Restaurant receipt with tax and cash change',
    text: `O BEEPOS
Bakso 2x 12,000
Es Teh 3x 7,500
Cap Jay 3x 17,000
Cumi Goreng Tepung Gurih 3x 25,000
Sub Total 172,500
Pajak 18,975
BS TUNAI 200,000
Kembalian 8,525
Total 172,500`,
    merchant: 'O BEEPOS',
    total: 172500,
    category: 'Makanan',
    minItems: 4,
    forbiddenItemWords: ['pajak', 'tunai', 'kembalian'],
  },
  {
    name: 'Alfamart groceries receipt',
    text: `ALFAMART
SUSU UHT 2 x 8.500
ROTI TAWAR 1 x 15.000
SABUN MANDI 1 x 12.000
TOTAL 44.000
BAYAR CASH 50.000
KEMBALI 6.000`,
    merchant: 'Alfamart',
    total: 44000,
    category: 'Makanan',
    minItems: 3,
    forbiddenItemWords: ['bayar', 'kembali'],
  },
  {
    name: 'Indomaret receipt',
    text: `INDOMARET
INDOMIE GORENG 3 10.500
KOPI SUSU 2 12.000
AIR MINERAL 1 4.000
TOTAL BAYAR 26.500`,
    merchant: 'Indomaret',
    total: 26500,
    category: 'Makanan',
    minItems: 3,
  },
  {
    name: 'SPBU fuel receipt',
    text: `SPBU 34.12345
PERTAMAX
Volume : 10.00 Liter
Harga/Liter : 13.500
Total : 135.000
Tunai : 150.000
Kembalian : 15.000`,
    total: 135000,
    category: 'Transportasi',
    minItems: 1,
    forbiddenItemWords: ['tunai', 'kembalian'],
  },
  {
    name: 'Apotek pharmacy receipt',
    text: `APOTEK SEHAT
PARACETAMOL 1 12.000
VITAMIN C 2 30.000
MASKER 1 15.000
TOTAL Rp 57.000`,
    total: 57000,
    category: 'Kesehatan',
    minItems: 3,
  },
  {
    name: 'Coffee shop receipt',
    text: `KOPI KENANGAN
Kopi Kenangan Mantan 2 44.000
Roti Coklat 1 12.000
Grand Total 56.000`,
    merchant: 'Kopi Kenangan',
    total: 56000,
    category: 'Makanan',
    minItems: 2,
  },
  {
    name: 'Laundry receipt',
    text: `LAUNDRY KILAT
Cuci Kering 5 kg 35.000
Setrika 2 kg 14.000
TOTAL 49.000`,
    total: 49000,
    category: 'Lainnya',
    minItems: 2,
  },
  {
    name: 'Parking receipt',
    text: `PARKIR MALL
No Transaksi 8891
Durasi 2 Jam
Total Rp 10.000
Cash Rp 10.000`,
    total: 10000,
    category: 'Transportasi',
    minItems: 0,
    forbiddenItemWords: ['cash'],
  },
  {
    name: 'PDAM water bill receipt',
    text: `LOKET PDAM
ID PEL : 00990011
Nama : BUDI
Tagihan Air : 125.000
Admin : 2.500
Total Bayar : 127.500`,
    total: 127500,
    category: 'Tagihan',
    minItems: 1,
    forbiddenItemWords: ['id pel'],
  },
  {
    name: 'Pulsa receipt',
    text: `KONTER BERKAH
PULSA TELKOMSEL 50.000
Admin 2.000
TOTAL 52.000`,
    total: 52000,
    category: 'Tagihan',
    minItems: 1,
  },
  {
    name: 'Marketplace receipt',
    text: `TOKOPEDIA
Kaos Polos 2 x 55.000
Ongkir 12.000
Voucher -10.000
Total Bayar 112.000`,
    total: 112000,
    category: 'Belanja',
    minItems: 1,
  },
  {
    name: 'Cinema receipt',
    text: `CGV CINEMA
TIKET REGULAR 2 90.000
POPCORN 1 35.000
TOTAL 125.000`,
    total: 125000,
    category: 'Hiburan',
    minItems: 2,
  },
  {
    name: 'Household store receipt',
    text: `TOKO RUMAH
SABUN CUCI 1 18.000
DETERGEN 2 42.000
TISSUE 1 12.000
TOTAL 72.000`,
    total: 72000,
    category: 'Keperluan Rumah Tangga',
    minItems: 3,
  },
]

describe('receipt parser study cases', () => {
  it.each(receiptCases)('parses $name', (receiptCase) => {
    const receipt = parseReceiptText(receiptCase.text)
    const parsed = parseTransaction(
      [receipt.merchant, receipt.rawText, receipt.items.map((item) => item.name).join(' ')]
        .filter(Boolean)
        .join('\n'),
      receipt.total
    )

    expect(receipt.total).toBe(receiptCase.total)
    expect(parsed.category).toBe(receiptCase.category)
    expect(receipt.items.length).toBeGreaterThanOrEqual(receiptCase.minItems ?? 1)

    if (receiptCase.name.includes('PLN token')) {
      expect(receipt.items[0]).toMatchObject({
        name: 'Token Listrik',
        price: receiptCase.total,
        category: 'Tagihan',
      })
    }

    if (receiptCase.merchant) {
      expect(receipt.merchant?.toLowerCase()).toContain(receiptCase.merchant.toLowerCase().replace(/\*/g, '').trim().split(' ')[0])
    }

    for (const word of receiptCase.forbiddenItemWords ?? []) {
      expect(receipt.items.map((item) => item.name).join(' ').toLowerCase()).not.toContain(word.toLowerCase())
    }
  })

  it('maps common food terms to Makanan', () => {
    for (const text of ['Cream Bruille', 'Choco Croissant', 'Bread Butter', 'Bakso', 'Kopi Susu', 'telor gulung 15rb']) {
      expect(categorizeTransactionText(text).category).toBe('Makanan')
    }
  })
})
