'use server'
import { createServerSupabaseClient } from '../../lib/supabase-server'
import { revalidatePath } from 'next/cache'

const TL={1:[1,1,1],2:[1,1,0],3:[1,0,1],4:[1,0,0],5:[0,1,1],6:[0,1,0],7:[0,0,1],8:[0,0,0]}
const CHI=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']
const HN=[
  ['Thuần Kiền','Thiên Trạch Lý','Thiên Hỏa Đồng Nhân','Thiên Lôi Vô Vọng','Thiên Phong Cấu','Thiên Thủy Tụng','Thiên Sơn Độn','Thiên Địa Bĩ'],
  ['Trạch Thiên Quải','Thuần Đoài','Trạch Hỏa Cách','Trạch Lôi Tùy','Trạch Phong Đại Quá','Trạch Thủy Khốn','Trạch Sơn Hàm','Trạch Địa Tụy'],
  ['Hỏa Thiên Đại Hữu','Hỏa Trạch Khuể','Thuần Ly','Hỏa Lôi Phệ Hạp','Hỏa Phong Đỉnh','Hỏa Thủy Vị Tế','Hỏa Sơn Lữ','Hỏa Địa Tấn'],
  ['Lôi Thiên Đại Tráng','Lôi Trạch Quy Muội','Lôi Hỏa Phong','Thuần Chấn','Lôi Phong Hằng','Lôi Thủy Giải','Lôi Sơn Tiểu Quá','Lôi Địa Dự'],
  ['Phong Thiên Tiểu Súc','Phong Trạch Trung Phu','Phong Hỏa Gia Nhân','Phong Lôi Ích','Thuần Tốn','Phong Thủy Hoán','Phong Sơn Tiệm','Phong Địa Quan'],
  ['Thủy Thiên Nhu','Thủy Trạch Tiết','Thủy Hỏa Ký Tế','Thủy Lôi Truân','Thủy Phong Tĩnh','Thuần Khảm','Thủy Sơn Kiển','Thủy Địa Tỷ'],
  ['Sơn Thiên Đại Súc','Sơn Trạch Tổn','Sơn Hỏa Bí','Sơn Lôi Di','Sơn Phong Cổ','Sơn Thủy Mông','Thuần Cấn','Sơn Địa Bác'],
  ['Địa Thiên Thái','Địa Trạch Lâm','Địa Hỏa Minh Sản','Địa Lôi Phục','Địa Phong Thăng','Địa Thủy Sư','Địa Sơn Khiêm','Thuần Khôn'],
]

function l2t(a,b,c){for(let t=1;t<=8;t++){const[x,y,z]=TL[t];if(x===a&&y===b&&z===c)return t}return 1}
function getHChi(h){if(h===23||h===0)return 1;return Math.floor((h+1)/2)+1}
function pad(n){return String(n).padStart(2,'0')}

// Ho Ngoc Duc lunar calendar algorithm
function INT(d){return Math.trunc(d)}
function jdFromDate(dd,mm,yy){var a=INT((14-mm)/12),y=yy+4800-a,m=mm+12*a-3;var jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045;if(jd<2299161)jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083;return jd}
function newMoon(k){var T=k/1236.85,T2=T*T,T3=T2*T,dr=Math.PI/180;var Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3+0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);var M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3;var Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3;var F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;var C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*dr*M)-0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(dr*2*Mpr)-0.0004*Math.sin(dr*3*Mpr)+0.0104*Math.sin(dr*2*F)-0.0051*Math.sin(dr*(M+Mpr))-0.0074*Math.sin(dr*(M-Mpr))+0.0004*Math.sin(dr*(2*F+M))-0.0004*Math.sin(dr*(2*F-M))-0.0006*Math.sin(dr*(2*F+Mpr))+0.0010*Math.sin(dr*(2*F-Mpr))+0.0005*Math.sin(dr*(M+2*Mpr));var deltat=T>=-11?(-0.000278+0.000265*T+0.000262*T2):(0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3);return INT(Jd1+C1-deltat+0.5+7/24)}
function sunLongitude(jdn){var T=(jdn-2451545.5-7/24)/36525,T2=T*T,dr=Math.PI/180;var M=357.5291+35999.0503*T-0.0001559*T2-0.00000048*T*T2;var L0=280.46646+36000.76983*T+0.0003032*T2;var DL=(1.9146-0.004817*T-0.000014*T2)*Math.sin(dr*M)+(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.00029*Math.sin(dr*3*M);var L=(L0+DL)%360;if(L<0)L+=360;return INT(L/30)}
function getLeapMonthOffset(a11){var k=INT((a11-2415021.076998695)/29.530588853+0.5);var last=0,i=1,arc=sunLongitude(newMoon(k+i));while(arc!==last&&i<14){last=arc;i++;arc=sunLongitude(newMoon(k+i))}return i-1}
function getLunarYear11(yy){var off=jdFromDate(31,12,yy)-2415021.076998695;var k=INT(off/29.530588853);var nm=newMoon(k);if(sunLongitude(nm)>=9)nm=newMoon(k-1);return nm}
function toLunar(gY,gM,gD){var dayNumber=jdFromDate(gD,gM,gY);var k=INT((dayNumber-2415021.076998695)/29.530588853);var monthStart=newMoon(k+1);if(monthStart>dayNumber)monthStart=newMoon(k);var a11=getLunarYear11(gM>=11?gY:gY-1);var b11=getLunarYear11(gM>=11?gY+1:gY);var lunarMonth=INT((monthStart-a11)/29)+11;if(b11-a11>365){var leapOff=getLeapMonthOffset(a11);if(lunarMonth>=leapOff)lunarMonth--}if(lunarMonth>12)lunarMonth-=12;if(lunarMonth<1)lunarMonth+=12;var lunarDay=dayNumber-monthStart+1;var lunarYear=(lunarMonth>=11&&gM<3)?gY-1:gY;var canArr=['Canh','Tân','Nhâm','Quý','Giáp','Ất','Bính','Đinh','Mậu','Kỷ'];var chiArr=['Thân','Dậu','Tuất','Hợi','Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi'];var yn=canArr[lunarYear%10]+' '+chiArr[lunarYear%12];return{ld:lunarDay,lm:lunarMonth,yn}}

function computeQueData({queName,hao,trigUp,trigLo,source,sourceData}){
  const L6=[...TL[trigLo],...TL[trigUp]]
  const hoL=l2t(L6[1],L6[2],L6[3]),hoU=l2t(L6[2],L6[3],L6[4])
  const ho_que=HN[hoU-1][hoL-1]
  const B6=[...L6];B6[hao-1]=B6[hao-1]===1?0:1
  const bL=l2t(B6[0],B6[1],B6[2]),bU=l2t(B6[3],B6[4],B6[5])
  const bien_que=HN[bU-1][bL-1]

  let solar_date=null,lunar_date=null,gio_chi=null
  if(source==='xem_gio'&&sourceData?.date){
    const d=sourceData.date
    solar_date=`${d.Y}-${pad(d.M)}-${pad(d.D)}`
    gio_chi=CHI[getHChi(d.h)-1]
    if(sourceData.lunarDate){const lu=sourceData.lunarDate;lunar_date=`${lu.ld}/${lu.lm} ${lu.yn}`}
  } else {
    const now=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Ho_Chi_Minh'}))
    const Y=now.getFullYear(),M=now.getMonth()+1,D=now.getDate(),h=now.getHours()
    solar_date=`${Y}-${pad(M)}-${pad(D)}`
    gio_chi=CHI[getHChi(h)-1]
    const lu=toLunar(Y,M,D)
    if(lu)lunar_date=`${lu.ld}/${lu.lm} ${lu.yn}`
  }

  // Format source_data label
  let source_data=null
  if(source==='boc_bai'&&sourceData?.left&&sourceData?.right)
    source_data=`${sourceData.left} · ${sourceData.right}`
  else if((source==='bien_so'||source==='so_dt')&&sourceData?.input)
    source_data=sourceData.input

  return {ho_que,bien_que,solar_date,lunar_date,gio_chi,source_data}
}

export async function saveQue({queName,hao,trigUp,trigLo,source='xem_gio',sourceData,note}){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)throw new Error('Unauthorized')

  const{ho_que,bien_que,solar_date,lunar_date,gio_chi,source_data}=computeQueData({queName,hao,trigUp,trigLo,source,sourceData})

  const{error}=await supabase.from('saved_ques').insert({
    user_id:user.id,chanh_que:queName,hao_dong:hao,
    ho_que,bien_que,solar_date,lunar_date,gio_chi,
    source:source||'xem_gio',source_data,ghi_chu:note||'',is_public:false,
  })
  if(error)throw new Error(error.message)
  revalidatePath('/xem-que');revalidatePath('/lich-su')
  return{success:true}
}

export async function autoSaveQue({queName,hao,trigUp,trigLo,source,sourceData}){
  try{
    const supabase=await createServerSupabaseClient()
    const{data:{user}}=await supabase.auth.getUser()
    if(!user)return

    const{ho_que,bien_que,solar_date,lunar_date,gio_chi,source_data}=computeQueData({queName,hao,trigUp,trigLo,source,sourceData})

    await supabase.from('saved_ques').insert({
      user_id:user.id,chanh_que:queName,hao_dong:hao,
      ho_que,bien_que,solar_date,lunar_date,gio_chi,
      source:source||'xem_gio',source_data,ghi_chu:'',is_public:false,
    })
  }catch(e){/* silent fail */}
}

export async function getSavedQues(){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)return[]
  const{data}=await supabase.from('saved_ques').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(200)
  return data||[]
}

export async function updateQueNote(id,note){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)throw new Error('Unauthorized')
  const{error}=await supabase.from('saved_ques').update({ghi_chu:note}).eq('id',id).eq('user_id',user.id)
  if(error)throw new Error(error.message)
  revalidatePath('/lich-su')
}

export async function getAnniversaries(){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)return[]
  const{data}=await supabase.from('anniversaries').select('id,title,lunar_month,lunar_day').eq('user_id',user.id).order('lunar_month').order('lunar_day')
  return(data||[]).map(e=>({id:e.id,name:e.title,lm:e.lunar_month,ld:e.lunar_day}))
}

export async function addAnniversary(name,lm,ld){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)throw new Error('Unauthorized')
  const{data,error}=await supabase.from('anniversaries').insert({user_id:user.id,title:name,lunar_month:lm,lunar_day:ld}).select('id,title,lunar_month,lunar_day').single()
  if(error)throw new Error(error.message)
  return{id:data.id,name:data.title,lm:data.lunar_month,ld:data.lunar_day}
}

export async function deleteAnniversary(id){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)throw new Error('Unauthorized')
  const{error}=await supabase.from('anniversaries').delete().eq('id',id).eq('user_id',user.id)
  if(error)throw new Error(error.message)
}

export async function deleteQue(id){
  const supabase=await createServerSupabaseClient()
  const{data:{user}}=await supabase.auth.getUser()
  if(!user)throw new Error('Unauthorized')
  const{error}=await supabase.from('saved_ques').delete().eq('id',id).eq('user_id',user.id)
  if(error)throw new Error(error.message)
  revalidatePath('/lich-su')
}
