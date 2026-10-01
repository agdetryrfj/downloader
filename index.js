const { Telegraf, Markup } = require('telegraf');
const { ttdl, igdl, pinterest, youtube } = require('btch-downloader');
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

// پردازش و دانلود لینک‌ها با کتابخانه قدرتمند
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    if (text.startsWith('http://') || text.startsWith('https://')) {
        const processingMsg = await ctx.reply('⏳ در حال دریافت اطلاعات و دانلود با بهترین کیفیت...');
        let downloadUrl = null;

        try {
            // تشخیص پلتفرم و دانلود با کتابخانه اختصاصی
            if (text.includes('tiktok.com') || text.includes('vm.tiktok.com')) {
                const res = await ttdl(text);
                downloadUrl = res?.video || res?.url || res?.data?.[0]?.url;
            } 
            else if (text.includes('instagram.com')) {
                const res = await igdl(text);
                downloadUrl = res?.[0]?.url || res?.[0];
            } 
            else if (text.includes('pinterest.com') || text.includes('pin.it')) {
                const res = await pinterest(text);
                downloadUrl = res?.url || res?.dl_url;
            } 
            else if (text.includes('youtube.com') || text.includes('youtu.be')) {
                const res = await youtube(text);
                downloadUrl = res?.dl_url || res?.url;
            }

            // اگر کتابخانه خروجی نداد، از API پشتیبان تیک‌تاک/عمومی استفاده کن
            if (!downloadUrl && text.includes('tiktok.com')) {
                const tikRes = await axios.get(`https://api.tikwm.com/api/?url=${encodeURIComponent(text)}`, { timeout: 10000 });
                downloadUrl = tikRes.data?.data?.play || tikRes.data?.data?.hdplay;
            }

            // پاک کردن پیام انتظار
            await ctx.deleteMessage(processingMsg.message_id).catch(() => {});

            if (downloadUrl) {
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
            await ctx.reply('❌ خطا در پردازش لینک. لطفاً دوباره تلاش کنید.');
        }
    } else {
        await ctx.reply('لطفاً یک لینک معتبر ارسال کنید.');
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
