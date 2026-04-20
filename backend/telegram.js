require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram belum dikonfigurasi');
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Gagal kirim Telegram:', err.message);
  }
}

async function notifyLowStock(products) {
  if (products.length === 0) return;

  const lines = products.map(p => {
    const status = p.stock === 0 ? '🔴 HABIS' : '🟡 Rendah';
    return `${status} <b>${p.name}</b> — sisa: ${p.stock} (batas: ${p.low_stock_threshold})`;
  });

  const message = `⚠️ <b>NOTIFIKASI STOK</b>\n\n${lines.join('\n')}\n\n🕐 ${new Date().toLocaleString('id-ID')}`;
  await sendTelegram(message);
}

module.exports = { sendTelegram, notifyLowStock };
