
import fg from "fg-senna"
let handler = async (m, { conn, args, usedPrefix, command }) => {

   
      const img = await fg.feed() 
       conn.sendFile(m.chat, img, 'img.jpg', `✅ *النتيجة* 😈`, m)
         m.react(dmoji) 
 
}

handler.help = ['يطعم']
handler.tags = ['الوسائط والترفيه']
handler.command = ['feed', 'fua', "يطعم"] 
//handler.diamond = true

export default handler
