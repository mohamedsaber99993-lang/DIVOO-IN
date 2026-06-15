
let cooldown = 7200000; 
let handler = async (m, { usedPrefix, args, command, text }) => {
  const user = global.db.data.users[m.sender];
  const eligibleUsers = Object.entries(global.db.data.users).filter(([key, value]) => value.coin > 200);

if (new Date - user.crime < cooldown) throw `⏰ لا يمكنك ارتكاب جريـ ـمة الآن. عليك الانتظار. *${msToTime((user.crime + cooldown) - new Date())}*`;

  if (eligibleUsers.length > 0) {
    const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    const userID = randomUser[0];
    const user2 = global.db.data.users[userID];
    const rob = Math.floor(Math.random() * Math.min(user2.coin - 100 + 1, 2000)) + 100;
    const success = Math.random() < 0.6;
    const alarmActivated = Math.random() < 0.3;
    const robA = Math.floor(rob * 0.1);
    const multa = Math.floor(Math.random() * 500);

    if (success) {
    	user.coin += rob;
        user2.coin -= rob;
      m.reply(`✅ لقد ارتكبت جريـ ـمة بنجاح
      
┌───⊷ *الضحية*
- *الاسم:* ${user2.name}
- *المنشن:* @${userID.split('@')[0]}
- *القوة:* +${rob} 🪙
└──────────────`, null, { mentions: [userID] });
    } else if (alarmActivated) {
    	user.coin += robA;
        user2.coin -= robA;
      m.reply(`🚨 لم تكن حذرًا بما يكفي عندما اقتحمت المنزل، مما أدى إلى انطلاق جهاز الإنذار. لم تتمكن إلا من أخذ...

┌───⊷ *الضحية*
- *الاسم:* ${user2.name}
- *المنشن:* @${userID.split('@')[0]}
- *القوة:* *+${robA}🪙* de (${rob} 🪙)
└────────────── `, null, { mentions: [userID] });
    } else {
     user.coin -= multa;
      m.reply(`🚔 اوبس! لقد فشلت جريمتك وتم تغريمك بـ *-${multa}* 🪙`);
    }
    user.crime = new Date * 1
  } else {
    m.reply('🏦 يحتفظ المستخدمون بعملاتهم في البنك. ويحاول سرقتها لاحقاً.');
  }
  
};
handler.help = ['السرقات'];
handler.tags = ['الاقتصاد / العاب RPG']
handler.command = ['سرقة', 'اخذ', 'rob', 'robar'];

export default handler;


function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return `${hours} الوقت ${minutes} الدقائق`;
}
