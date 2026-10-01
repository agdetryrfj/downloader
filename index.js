const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '8966971586:AAHYHWpvQDeccAZ7zJQ--C4tMRriVXsd60E';
const bot = new Telegraf(BOT_TOKEN);

// دستور Start
bot.start((ctx) => {
    const welcomeMessage = 
        `سلام! به ربات دانلودر **BatDL** خوش آمدید.\n\n` +
        `برای دانلود، لینک خود را زیر همین پست ارسال کنید.`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('سازنده', 'https://t.me/batman1792')]
    ]);

    return ctx.replyWithMarkdown(welcomeMessage, keyboard);
});

// پردازش لینک‌های ارسالی برای دانلود
bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    // اگر پیام لینک بود
    if (text.startsWith('http://') || text.startsWith('https://')) {
        const processingMsg = await ctx.reply('⏳ در حال دریافت اطلاعات و دانلود با بهترین کیفیت...');

        try {
            // استفاده از یک API عمومی قدرتمند برای دانلود ویدیو/تصویر
            const apiUrl = `https://apis.davidcyriltech.my.id/download?url=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });
            const data = response.data;

            if (data && (data.status === 200 || data.success || data.dl_url || data.video)) {
                const downloadUrl = data.dl_url || data.video || data.link || (data.result && data.result.url);

                if (downloadUrl) {
                    await ctx.deleteMessage(processingMsg.message_id).catch(() => {});
                    
                    // تشخیص نوع محتوا و ارسال به کاربر
                    if (downloadUrl.match(/\.(mp4|m3u8|mov)$/i) || text.includes('instagram.com') || text.includes('tiktok.com')) {
                        await ctx.replyWithVideo(downloadUrl, {
                            caption: '✅ فایل شما با موفقیت دانلود شد.\n🤖 BatDL Bot'
                        });
                    } else if (downloadUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        await ctx.replyWithPhoto(downloadUrl, {
                            caption: '✅ تصویر شما با موفقیت دانلود شد.\n🤖 BatDL Bot'
                        });
                    } else {
                        await ctx.reply(`✅ لینک دانلود آماده است:\n\n${downloadUrl}`);
                    }
                } else {
                    throw new Error('لینک دانلود معتبری یافت نشد.');
                }
            } else {
                // روش جایگزین یا مدیریت خطا
                await ctx.telegram.editMessageText(
                    ctx.chat.id,
                    processingMsg.message_id,
                    null,
                    '❌ متاسفانه در پردازش این لینک خطایی رخ داد یا لینک پشتیبانی نمی‌شود.'
                );
            }
        } catch (error) {
            console.error('Download Error:', error.message);
            await ctx.telegram.editMessageText(
                ctx.chat.id,
                processingMsg.message.message_id || processingMsg.message_id,
                null,
                '❌ خطا در ارتباط با سرور دانلود. لطفا لینک دیگری را امتحان کنید.'
            ).catch(() => {
                ctx.reply('❌ خطا در پردازش درخواست.');
            });
        }
    } else {
        // اگر کاربر متن معمولی فرستاد
        await ctx.reply('لطفاً یک لینک معتبر (اینستاگرام، تیک‌تاک، پینترست و...) ارسال کنید.');
    }
});

// راه‌اندازی ربات
bot.launch().then(() => {
    console.log('Bot BatDL is running successfully!');
});

// بستن امن ربات
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
