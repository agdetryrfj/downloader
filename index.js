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

// پردازش و دانلود لینک‌های ارسالی با موتور دوگانه قدرتمند
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    if (text.startsWith('http://') || text.startsWith('https://')) {
        const processingMsg = await ctx.reply('⏳ در حال دریافت اطلاعات و دانلود با بهترین کیفیت...');

        let downloadUrl = null;

        try {
            // تلاش اول با API اصلی و سریع
            try {
                const apiUrl = `https://widipe.com/download?url=${encodeURIComponent(text)}`;
                const response = await axios.get(apiUrl, { timeout: 15000 });
                const resData = response.data;
                if (resData && resData.result) {
                    downloadUrl = resData.result.url || resData.result.dl_url || resData.result.video || (resData.result.medias && resData.result.medias[0]?.url);
                }
            } catch (err) {
                console.log('Primary API failed, trying backup...');
            }

            // اگر تلاش اول نتیجه نداد، استفاده از API پشتیبان قدرتمند
            if (!downloadUrl) {
                const backupApi = `https://delirius-api-oficial.vercel.app/download/all?url=${encodeURIComponent(text)}`;
                const backupRes = await axios.get(backupApi, { timeout: 15000 });
                const backupData = backupRes.data;
                if (backupData && backupData.status && backupData.data) {
                    downloadUrl = backupData.data.url || backupData.data.download || backupData.data.video;
                }
            }

            // پاک کردن پیام انتظار
            await ctx.deleteMessage(processingMsg.message_id).catch(() => {});

            if (downloadUrl) {
                // ارسال به عنوان ویدیو یا عکس یا لینک مستقیم
                if (typeof downloadUrl === 'string' && (downloadUrl.match(/\.(mp4|m3u8|mov|webm)$/i) || text.includes('instagram.com') || text.includes('tiktok.com') || text.includes('youtube.com') || text.includes('youtu.be') || text.includes('pinterest.com'))) {
                    await ctx.replyWithVideo(downloadUrl, {
                        caption: '✅ فایل شما با موفقیت دانلود شد.\n🤖 BatDL Bot'
                    }).catch(async () => {
                        // اگر حجم فایل بالا بود یا تلگرام خطا داد، لینک مستقیم فرستاده می‌شود
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
                await ctx.reply('❌ متاسفانه لینک دانلود معتبری برای این آدرس پیدا نشد. لطفاً لینک دیگری امتحان کنید.');
            }

        } catch (error) {
            console.error('Download Error:', error.message);
            await ctx.deleteMessage(processingMsg.message_id).catch(() => {});
            await ctx.reply('❌ خطا در ارتباط با سرور دانلود یا زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید.');
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
