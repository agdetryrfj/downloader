const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const express = require('express');

const BOT_TOKEN = '8966971586:AAHYHWpvQDeccAZ7zJQ--C4tMRriVXsd60E';
const bot = new Telegraf(BOT_TOKEN);
const app = express();

const PORT = process.env.PORT || 3000;

// دستور Start با دکمه شیشه‌ای سازنده
bot.start((ctx) => {
    const welcomeMessage = 
        `سلام! به ربات دانلودر **BatDL** خوش آمدید.\n\n` +
        `برای دانلود، لینک خود را زیر همین پست ارسال کنید.`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('سازنده', 'https://t.me/batman1792')]
    ]);

    return ctx.replyWithMarkdown(welcomeMessage, keyboard);
});

// پردازش و دانلود لینک‌های ارسالی با APIهای جدید و پایدار
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    if (text.startsWith('http://') || text.startsWith('https://')) {
        const processingMsg = await ctx.reply('⏳ در حال دریافت اطلاعات و دانلود با بهترین کیفیت...');

        let downloadUrl = null;

        try {
            // تلاش ۱: استفاده از API مخصوص تیک‌تاک (اگر لینک تیک‌تاک باشد)
            if (text.includes('tiktok.com')) {
                try {
                    const tikApi = `https://api.tikwm.com/api/?url=${encodeURIComponent(text)}`;
                    const res = await axios.get(tikApi, { timeout: 10000 });
                    if (res.data && res.data.data) {
                        downloadUrl = res.data.data.play || res.data.data.hdplay;
                    }
                } catch (e) {}
            }

            // تلاش ۲: استفاده از API عمومی قدرتمند سایبر (Axiom / All-in-one)
            if (!downloadUrl) {
                try {
                    const generalApi = `https://api.siputzx.my.id/api/downloader/all?url=${encodeURIComponent(text)}`;
                    const res = await axios.get(generalApi, { timeout: 12000 });
                    if (res.data && res.data.status && res.data.data) {
                        const d = res.data.data;
                        downloadUrl = d.url || d.dl_url || d.video || (d.medias && d.medias[0]?.url);
                    }
                } catch (e) {}
            }

            // تلاش ۳: API جایگزین کمکی
            if (!downloadUrl) {
                try {
                    const altApi = `https://apis.davidcyriltech.my.id/download?url=${encodeURIComponent(text)}`;
                    const res = await axios.get(altApi, { timeout: 12000 });
                    if (res.data) {
                        downloadUrl = res.data.dl_url || res.data.video || res.data.link || (res.data.result && res.data.result.url);
                    }
                } catch (e) {}
            }

            // پاک کردن پیام انتظار
            await ctx.deleteMessage(processingMsg.message_id).catch(() => {});

            if (downloadUrl) {
                // ارسال ویدیو یا لینک
                if (typeof downloadUrl === 'string' && (downloadUrl.match(/\.(mp4|m3u8|mov|webm)$/i) || text.includes('instagram.com') || text.includes('tiktok.com') || text.includes('youtube.com') || text.includes('pinterest.com'))) {
                    await ctx.replyWithVideo(downloadUrl, {
                        caption: '✅ فایل شما با موفقیت دانلود شد.\n🤖 BatDL Bot'
                    }).catch(async () => {
                        await ctx.reply(`✅ لینک دانلود مستقیم آماده است:\n\n${downloadUrl}`);
                    });
                } else if (typeof downloadUrl === 'string' && downloadUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    await ctx.replyWithPhoto(downloadUrl, {
                        caption: '✅ تصویر شما با موفقیت دانلود شد.\n🤖 BatDL Bot'
                    });
                } else {
                    await ctx.reply(`✅ لینک دانلود آماده است:\n\n${downloadUrl}`);
                }
            } else {
                await ctx.reply('❌ متاسفانه لینک دانلود از این آدرس استخراج نشد. لطفاً لینک معتبر دیگری امتحان کنید.');
            }

        } catch (error) {
            console.error('Download Error:', error.message);
            await ctx.deleteMessage(processingMsg.message_id).catch(() => {});
            await ctx.reply('❌ خطا در ارتباط با سرور دانلود. لطفاً دوباره تلاش کنید.');
        }
    } else {
        await ctx.reply('لطفاً یک لینک معتبر (اینستاگرام، تیک‌تاک، پینترست و...) ارسال کنید.');
    }
});

// تنظیمات وب‌هوک و سرور Express برای Railway
app.use(express.json());
app.use(bot.webhookCallback('/'));

app.get('/', (req, res) => {
    res.send('BatDL Bot is active and running smoothly!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
