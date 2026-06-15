const betData = {}
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]

const RANGES = {
  "1-12":[1,12],
  "13-24":[13,24],
  "25-36":[25,36],
  "1-18":[1,18],
  "19-36":[19,36]
}

let handler = async (m, { usedPrefix, command, args }) => {

  const user = global.db.data.users[m.sender]
  const id = m.sender

  if (betData[id]) {
    const remaining = getRemainingTime(betData[id])
    return m.reply(`⏳ لقد وضعت رهانك بالفعل. انتظر. *${remaining}s*`)
  }

  if (args.length < 2)
    throw `✳️ الاستخدام:\n*${usedPrefix + command} <الكمية> <الفِضاء>*`

  const amount = Number(args[0])
  const space = args[1].toLowerCase()

  if (!amount || amount < 100)
    throw `💰 الحد الأدنى للرهان هو *100 قطعة نقدية*`

  if (amount > 10000)
    throw `🚫 الحد الأقصى المسموح به *10000 قطعة نقدية*`

  if (user.coin < amount)
    throw `❌ ليس لديك ما يكفي من العملات المعدنية`

  const number = /^\d+$/.test(space) ? Number(space) : null
  if (number && (number < 1 || number > 36))
    throw `🎯 يجب أن يكون الرقم بين *1 و؛ 36*`

  const result = Math.floor(Math.random() * 36) + 1
  const color = RED_NUMBERS.includes(result) ? "أحمر" : "زنجي"

  m.reply(`🎲 بالتأكيد *${amount} عملات معدنية* في *${space}*\n\n⏳ تدوير عجلة الروليت...`)
 
  betData[id] = Date.now()

  await new Promise(r => setTimeout(r, 10000))

  let multiplier = getMultiplier(space, result)

  let msg = `🎰 النتيجة: *${color} ${result}*\n\n`

  if (multiplier > 0) {
    const profit = amount * multiplier - amount
    user.coin += profit
    msg += `🎉 مبروك لقد فزت *+${profit} عملات معدنية*`
  } else {
    user.coin -= amount
    msg += `💀 لقد خسرت *-${amount} عملات معدنية*`
  }

  m.reply(msg, null, fwc)

  delete betData[id]
}

handler.help = ['الروليت']
handler.tags = ['الألعاب والتسلية']
handler.command = ['روليت','رهان']

export default handler


function getMultiplier(space, result){

  if (/^\d+$/.test(space)) {
    return Number(space) === result ? 36 : 0
  }

  if (space === "odd") return result % 2 ? 2 : 0
  if (space === "even") return result % 2 === 0 ? 2 : 0

  if (space === "red") return RED_NUMBERS.includes(result) ? 2 : 0
  if (space === "black") return !RED_NUMBERS.includes(result) ? 2 : 0

  if (space === "1st") return (result-1)%3 === 0 ? 3 : 0
  if (space === "2nd") return (result-2)%3 === 0 ? 3 : 0
  if (space === "3rd") return result%3 === 0 ? 3 : 0

  if (RANGES[space]) {
    const [a,b] = RANGES[space]
    return result >= a && result <= b ? 2 : 0
  }

  return 0
}

function getRemainingTime(timestamp){
  const cooldown = 20000
  const remaining = cooldown - (Date.now() - timestamp)
  return Math.ceil(remaining/1000)
}