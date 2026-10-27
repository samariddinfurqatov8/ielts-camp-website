import { getDb } from './db.js';

export interface TelegramNotificationParams {
  applicationId: number;
  applicationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  courseName: string;
  level?: string;
  preferredTime: string;
  comment?: string;
  status: string;
}

export interface TelegramStatusResult {
  configured: boolean;
  botTokenSet: boolean;
  chatIdSet: boolean;
  chatIdMasked: string;
}

export function getTelegramStatus(): TelegramStatusResult {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() || '';

  const configured = Boolean(token && chatId && !token.includes('123456789:ABCdef'));
  const chatIdMasked = chatId
    ? chatId.length > 5
      ? `${chatId.slice(0, 3)}***${chatId.slice(-2)}`
      : '***'
    : '';

  return {
    configured,
    botTokenSet: Boolean(token),
    chatIdSet: Boolean(chatId),
    chatIdMasked,
  };
}

export async function sendTelegramNotification(params: TelegramNotificationParams): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const now = new Date().toISOString();

  // Format message text in Uzbek as required
  const messageLines = [
    `🎓 *IELTS CAMP — YANGI ARIZA*`,
    ``,
    `📌 *Ariza raqami:* #${params.applicationCode}`,
    `👤 *Ism-familiya:* ${escapeMarkdown(params.firstName)} ${escapeMarkdown(params.lastName)}`,
    `📞 *Telefon:* \`${escapeMarkdown(params.phone)}\``,
    `📚 *Kurs:* ${escapeMarkdown(params.courseName)}`,
  ];

  if (params.level) {
    messageLines.push(`🎯 *Daraja:* ${escapeMarkdown(params.level)}`);
  }

  messageLines.push(`⏰ *Qulay vaqt:* ${escapeMarkdown(params.preferredTime)}`);

  if (params.comment && params.comment.trim()) {
    messageLines.push(`📝 *Izoh:* ${escapeMarkdown(params.comment.trim())}`);
  }

  messageLines.push(`⚡ *Holat:* ${params.status === 'NEW' ? 'Yangi ariza' : params.status}`);
  messageLines.push(``);
  messageLines.push(`🔗 _Arizani ko‘rish va boshqarish uchun admin paneliga kiring._`);

  const text = messageLines.join('\n');

  if (!token || !chatId || token.includes('123456789:ABCdef')) {
    const note = 'Telegram bot tokeni yoki chat_id sozlanmagan (.env ichida TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID kiritilishi kerak)';
    await db.run(
      `INSERT INTO notification_logs (application_id, channel, recipient, status, payload, error_message, sent_at)
       VALUES (?, 'telegram', ?, 'SKIPPED_NOT_CONFIGURED', ?, ?, ?)`,
      [params.applicationId, chatId || 'none', text, note, now]
    );
    return { success: false, message: note };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = (await response.json()) as any;

    if (response.ok && result.ok) {
      await db.run(
        `INSERT INTO notification_logs (application_id, channel, recipient, status, payload, error_message, sent_at)
         VALUES (?, 'telegram', ?, 'SENT', ?, '', ?)`,
        [params.applicationId, chatId, text, now]
      );
      return { success: true, message: 'Telegram xabari muvaffaqiyatli yuborildi' };
    } else {
      const errMsg = result.description || `HTTP ${response.status}`;
      await db.run(
        `INSERT INTO notification_logs (application_id, channel, recipient, status, payload, error_message, sent_at)
         VALUES (?, 'telegram', ?, 'FAILED', ?, ?, ?)`,
        [params.applicationId, chatId, text, errMsg, now]
      );
      return { success: false, message: `Telegram xatoligi: ${errMsg}` };
    }
  } catch (err: any) {
    const errMsg = err?.message || 'Ulanish xatosi';
    await db.run(
      `INSERT INTO notification_logs (application_id, channel, recipient, status, payload, error_message, sent_at)
       VALUES (?, 'telegram', ?, 'ERROR', ?, ?, ?)`,
      [params.applicationId, chatId, text, errMsg, now]
    );
    return { success: false, message: `Tarmoq xatosi: ${errMsg}` };
  }
}

export async function testTelegramBot(): Promise<{ success: boolean; message: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId || token.includes('123456789:ABCdef')) {
    return {
      success: false,
      message: 'Telegram sozlamalari to‘liq emas. TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID parametrlarini tekshiring.',
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const text = `🔔 *IELTS CAMP — TEST BILDIRISHNOMASI*\n\nAdmin paneli orqali Telegram Bot aloqasi muvaffaqiyatli tekshirildi.\nSana: ${new Date().toLocaleString('uz-UZ')}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const result = (await response.json()) as any;
    if (response.ok && result.ok) {
      return { success: true, message: 'Test xabari Telegramga muvaffaqiyatli yetkazildi!' };
    } else {
      return { success: false, message: result.description || `Xatolik kodi: ${response.status}` };
    }
  } catch (err: any) {
    return { success: false, message: `Ulanib bo‘lmadi: ${err.message}` };
  }
}

function escapeMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
