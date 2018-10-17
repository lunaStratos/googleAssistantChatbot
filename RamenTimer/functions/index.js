'use strict';

// npm install
// V2 need 2.0.1 version, So plase make package.json => "actions-on-google": "^2.0.1"
// https://www.npmjs.com/package/actions-on-google
// https://www.npmjs.com/package/firebase-functions?activeTab=readme
const {
  dialogflow,
  Suggestions,
  SimpleResponse,
  BasicCard,
  Image,
  MediaObject
} = require('actions-on-google');

const functions = require('firebase-functions');
// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const RAMEN_INTENT = 'ramen';
const HELP = 'help';
const SUPPORTRAMEN = 'supportRamen';

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const EXIT = 'exit';

//entity name
const RAMEN = 'ramen';

// 300:https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg
// 300:https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3mincat.ogg
// 330:https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/330min.ogg
// 400:https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg
// 430:https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/430min.ogg
// 500:https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg
//array
//name: 라면 이름, imageLink: 이미지링크, kcal: 칼로리와 소금양

const music = "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/Kyrgyzstan_Bouncing_Syndrome.mp3";

const ramenArray = [{
  name: "농심 신라면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_shinramen.jpg",
  subtitle: "조리예 \n 물 550ml에 건더기 스프를 넣고 물이 끓으면 분말스프와 면을 넣고 4분간 더 끓이면 됩니다.",
  info: "칼로리: 500kcal , 나트륨:1,790mg",
  allergy: "밀, 대두, 돼지고기, 계란, 쇠고기 함유",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "신라면"
}, {
  name: "농심 육개장",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_yukggejang_cup.jpg",
  subtitle: "조리예 \n 뚜껑을 개봉 표시선까지 열고 스프를 넣은 후 끓는 물을 용기 안쪽 표시선까지 부은 다음 뚜껑을 닫고 3분간 기다리면 됩니다.",
  info: "열량: 375칼로리(일반적인 작은컵) ",
  allergy: "밀, 대두, 계란, 돼지고기",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "육개장"
}, {
  name: "오뚜기 진라면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/otuggi_jinramen.jpg",
  subtitle: "조리예 \n 물 550ml에 건더기 스프를 넣고 물이 끓으면 분말스프와 면을 넣고 4분간 더 끓이면 됩니다.",
  info: "1봉지 (120g)당 - 칼로리: 500kcal | 지방: 15.00g | 탄수화물: 80.00g | 단백질: 11.00g",
  allergy: "밀, 대두, 계란, 돼지고기",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "진라면"
}, {
  name: "오뚜기 진짬뽕",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/otuggi_jinzamppong.jpg",
  subtitle: "조리예 \n 물 550ml에 건더기 스프를 넣고 끓인 후 액체스프를 넣고 5분간 더 끓입니다. 이후 유성스프를 넣고 드시면 됩니다.",
  info: "열량: 505kcal / 탄수화물: 77g / 당류: 6g / 단백질: 13g / 지방: 16g / 포화지방: 7g / 트랜스지방: 0g / 콜레스테롤: 20mg / 나트륨: 1,850mg",
  allergy: "밀,대두,우유,계란,쇠고기,돼지고기,닭고기,오징어,새우,게,조개류(굴,홍합 포함) ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg",
  originalName: "진짬뽕"
}, { // 농심 라인
  name: "농심 너구리",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_rta.jpg",
  subtitle: "조리예 \n 물 550ml를 끓인 후 면과 분말 스프, 후레이크, 다시마를 넣고 5분간 더 끓입니다.",
  info: " 칼로리: 505kcal | 지방: 17.00g | 탄수화물: 81.00g | 단백질: 7.00g ",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg",
  originalName: "너구리"
}, {
  name: "농심 육개장 큰사발",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_yukgejjangbig.jpg",
  subtitle: "조리예 \n 뚜껑을 개봉한 후 분말스프를 넣고 끓는 물 400ml를 용기 안쪽 표시선까지 넣고 4분간 기다리세요.",
  info: " 칼로리: 485kcal | 지방: 16.00g | 탄수화물: 75.00g | 단백질: 10.00g    ",
  allergy: "소맥분(밀) , 탈지대두(대두) , 유당(우유) , 난각칼슘(계란) , 조미돈지(돼지고기)  ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "육개장 큰사발"
}, {
  name: "농심 신라면 큰사발",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_sinramenbig.jpg",
  subtitle: "조리예 \n 뚜껑을 열고 끓는 물 을 안쪽 표시선까지 넣은 다음 4분간 기다리세요",
  info: " 칼로리: 490kcal | 지방: 17.00g | 탄수화물: 76.00g | 단백질: 8.00g",
  allergy: " 소맥분(밀) , 탈지대두(대두) , 돈지(돼지고기) , 유당(우유) , 난각칼슘(계란) ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "신라면 큰사발"
}, {
  name: "농심 새우탕 큰사발",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_shrimpcupbig.jpg",
  subtitle: "조리예 \n 뚜껑을 닫고 약 4분후에 잘 저어 드십시오.",
  info: " 500kcal | 지방: 16.00g | 탄수화물: 76.00g | 단백질: 10.00g ",
  allergy: "소맥분(밀) , 탈지대두(대두) , 유당(우유) , 난각칼슘(계란) , 새우분말(새우)  ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "새우탕 큰사발"
}, {
  name: "농심 신라면 작은컵",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_sinramensmall.jpg",
  subtitle: "조리예 \n 뚜껑을 열고 끓는 물을 넣은 다음 3분간 기다리세요",
  info: " 칼로리: 300kcal | 지방: 10.00g | 탄수화물: 47.00g | 단백질: 5.00g",
  allergy: "소맥분(밀) , 탈지대두(대두) , 돈지(돼지고기) , 유당(우유) , 난각칼슘(계란)  ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "신라면 컵"
}, {
  name: "농심 안성탕면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_ansung.jpg",
  subtitle: "조리예 \n 물 550ml를 끓인 후 면과 스프를 같이 넣고 4분 30초간 끓이세요.",
  info: " 525kcal | 지방: 17.00g | 탄수화물: 82.00g | 단백질: 11.00g",
  allergy: " 밀 , 우유 , 대두 , 돼지고기 , 계란 , 닭고기 , 쇠고기",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/430min.ogg",
  originalName: "안성탕면"
}, {
  name: "농심 오징어짬뽕",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_ojingazampong.jpg",
  subtitle: "조리예 \n 물 550ml에 4분 30초 정도 끓이세요",
  info: "  510kcal | 지방: 15.00g | 탄수화물: 85.00g | 단백질: 10.00g ",
  allergy: " 밀 , 대두 , 우유 , 돼지고기 , 새우 , 계란 , 게 , 오징어 , 쇠고기 , 닭고기 , 조개류(홍합 포함) ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/430min.ogg",
  originalName: "오징어짬뽕"
}, {
  name: "농심 짜파게티",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/nongsim_japa.jpg",
  subtitle: "조리예 \n 물 600ml를 넣고 5분간 끓인후, 물을 8스푼의 정도 남겨 버리고 스프를 넣어 비비면 됩니다. ",
  info: "칼로리: 610kcal | 지방: 20.00g | 탄수화물: 97.00g | 단백질: 11.00g ",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg",
  originalName: "짜파게티"
}, { // 삼양 라인
  name: "삼양 맛있는라면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/samyang_matsit.jpg",
  subtitle: "조리예 \n 물 500ml를 끓인 후 분말스프와 후레이크를 넣고 4분간 끓여주세요.",
  info: " ",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "맛있는라면"
}, {
  name: "삼양라면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/samyang_samyang.jpg",
  subtitle: "조리예 \n 끓는 물 550ml 면과 스프 후레이크를 넣고 3-4분 정도 끓여주세요.(여기서는 3분 30초 알람으로 합니다.) ",
  info: " 칼로리: 500kcal | 지방: 16.00g | 탄수화물: 79.00g | 단백질: 10.00g",
  allergy: "밀, 대두, 계란, 우유, 돼지고기, 닭고기, 쇠고기, 조개류 함유 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/330min.ogg",
  originalName: "삼양라면"
}, { // 오뚜기라인
  name: "오뚜기 3분카레",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/otuggi_3minretorte.jpg",
  subtitle: "조리예 \n 끓는 물에 3분간 넣고 젓가락 같은것으로 꺼내셔서 밥과 같이 드시면 됩니다.",
  info: " 칼로리: 170kcal | 지방: 7.00g | 탄수화물: 22.00g | 단백질: 5.00g (밥제외)",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3mincat.ogg",
  originalName: "3분카레"
}, {
  name: "오뚜기 육개장 컵",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/otuggi_yukgejjang.jpg",
  subtitle: "조리예 \n 뜨거운 물을 용기 안 선까지 붓고 3분간 기다려 주세요.",
  info: " ",
  allergy: " 칼로리: 380kcal | 지방: 14.00g | 탄수화물: 55.00g | 단백질: 8.00g",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "오뚜기 육개장 컵"
}, {
  name: "오뚜기 참깨라면 컵",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/otuggi_chanke.jpg",
  subtitle: "조리예 \n 끓는 물을 용기 안쪽까지 붓고 4분간 기다려 주세요.",
  info: " ",
  allergy: " 칼로리: 505kcal | 지방: 20.00g | 탄수화물: 71.00g | 단백질: 10.00g   ",
  etc: "만약 컵라면을 찾으신다면 '참깨라면 컵' 이라고만 말하시면 됩니다. ",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "참깨라면 컵"
}, {
  name: "오뚜기 참깨라면 봉지면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/%20otuggi_chamke_bong.jpg",
  subtitle: "조리예 \n 끓는 물을 500ml에 스프와 면을 넣고 4분간 끓여주세요.",
  info: " ",
  allergy: " 칼로리: 505kcal | 지방: 20.00g | 탄수화물: 71.00g | 단백질: 10.00g   ",
  etc: "만약 봉지면을 찾으신다면 '참깨라면' 이라고만 말하시면 됩니다. ",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "참깨라면 봉지면"
}, {
  name: "오뚜기 컵누들",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/ottugi_cupnoodle.jpg",
  subtitle: "조리예 \n 끓는 물과 스프와 면을 넣고 3분간 끓여주세요.",
  info: " ",
  allergy: "작은게 120칼로리, 큰게 195칼로리",
  etc: " ",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "오뚜기 컵누들"
},{
  name: "팔도 비빔면",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/paldo_bibim.jpg",
  subtitle: "조리예 \n 물 600ml를 넣고 3분간 익힌 후 찬물에 면을 행구어주세요. 물을 버린 후 스프로 비벼 주세요.",
  info: " 칼로리: 530kcal | 지방: 19.00g | 탄수화물: 80.00g | 단백질: 9.00g",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "팔도비빔면"
}, {
  name: "팔도 불짬뽕",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/paldo_buljamppong.jpg",
  subtitle: "조리예 \n 끓는 물 550ml를 액상 스프와 후레이크를 넣고 5분간 조리하면 됩니다.",
  info: " 칼로리: 550kcal | 지방: 19.00g | 탄수화물: 82.00g | 단백질: 13.00g ",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg",
  originalName: "불짬뽕"
}, {
  name: "팔도 왕뚜껑",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/paldo_wang.jpg",
  subtitle: "조리예 \n 끓는 물을 안쪽 표시선까지 넣은 후 3분간 기다리면 됩니다.",
  info: " 칼로리: 475kcal | 지방: 17.00g | 탄수화물: 71.00g | 단백질: 9.00g",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "왕뚜껑"
}, {
  name: "닛신 돈베이 키츠네우동",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/japan_donbei_woodon.jpg",
  subtitle: "410ml \n 끓는 물을 안쪽 표시선까지 넣은 후 5분간 기다리면 됩니다.",
  info: " 406kcal",
  allergy: "소맥, 깨, 고등어, 대두(콩),우유",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg",
  originalName: "돈베이 키츠네우동"
}, {
  name: "닛신 컵누들",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/japan_cupnoodle.jpg",
  subtitle: "조리예 \n 끓는 물을 안쪽 표시선까지 넣은 후 3분간 기다리면 됩니다.",
  info: " ",
  allergy: " ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "닛신 컵누들"
}, {
  name: "히든타이머",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/hqdefault.jpg",
  subtitle: "2분 30초 타이머 입니다.",
  info: "2분 30초",
  allergy: "2분 30초 동안 흥겨운 타이머 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/Kyrgyzstan_Bouncing_Syndrome.mp3",
  originalName: "2분30초"
}, {
  name: "3분",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/hqdefault.jpg",
  subtitle: "3분 타이머 입니다.",
  info: "3분 타이머",
  allergy: "3분 타이머 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/3min.ogg",
  originalName: "3분"
}, {
  name: "3분 30초",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/hqdefault.jpg",
  subtitle: "3분 30초 타이머 입니다.",
  info: "3분 30초 타이머",
  allergy: "3분 30초 타이머 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/330min.ogg",
  originalName: "3분 30초"
}, {
  name: "4분",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/hqdefault.jpg",
  subtitle: "4분 타이머 입니다.",
  info: "4분 타이머",
  allergy: "4분 타이머 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/4min.ogg",
  originalName: "4분"
}, {
  name: "4분 30초",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/guchihang.jpg",
  subtitle: "4분 30초 타이머 입니다.",
  info: "4분 30초 타이머",
  allergy: "4분 30초 타이머 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/430min.ogg",
  originalName: "4분 30초"
}, {
  name: "5분",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/hqdefault.jpg",
  subtitle: "5분 타이머 입니다.",
  info: "5분 타이머",
  allergy: "5분 타이머 ",
  etc: "",
  mediaUrl: "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenMp3/5min.ogg",
  originalName: "5분"
}];

//Chip 랜덤 섞기
function randomMaker(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }

}

//랜덤으로 칩을 만들어주는 믹서기
function randomMakerForChips() {
  //7 + 1로 한다.
  let arrayForChip = ["도움말", "지원되는 라면"]; // 기본 명령어를 만듬.
  randomMaker(ramenArray);

  for (let i = 2; i < 8; i++) { //3번부터 8번까지의 칩을 만든다.
    arrayForChip[i] = ramenArray[i].name;
  }

  return arrayForChip;
} // suggestions = randomMakerForChips();

//for chip
let suggestions = ["도움말", "지원되는 라면", "신라면", "진짬뽕", "육개장", "진라면", "2분 30초"];

// Welcome intent.
// V2, It use intent name, not action name.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;

  //console.log("conv: " + JSON.stringify(conv));
  //console.log("action: " + JSON.stringify(conv.action));

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/welcome.png';
  let text = '라면타이머에 오신것을 환영합니다.';
  let title = '라면 타이머 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '라면타이머!';
  let lastConv = '알고 싶은 라면을 말해주세요! 아니면 아래의 칩을 선택해도 됩니다.';
  let flow = 'welcome';

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/kbs_sports.ogg";
  if (conv.user.last.seen) {
    displayText = "다시 " + appTitle + "에 오신것을 환영합니다. 저번에 방문하셨으니 사용법은 아시리라 믿어요! ";
    speechText = "<speak><par>" +
      '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="2s" soundLevel="-10dB" end="12s" ><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  } else if (conv.user.storage != undefined) {

  } { //최초 시작
    displayText = "안녕하세요? " + appTitle + " 입니다. " + appTitle + "는 각종 라면의 물 붙는 시간과 조리방법을 알려줍니다. '지원되는 라면'이라고 물어보면 현재 가능한 라면을 알려드립니다."
    speechText = "<speak><par>" +
      '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="4s" soundLevel="-10dB" end="16s" ><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }

  let convArray = [];
  //이전 재생과 다시재생을 위한
  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;


  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));

});




//RAMEN Intent
app.intent(RAMEN_INTENT, (conv) => {
  suggestions = randomMakerForChips();
  console.log("RAMEN_INTENT");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]

  const ramen = conv.parameters[RAMEN];

  //console.log("ramen entity data: " + ramen);
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'mediaResponse'
  let appTitle = '!';
  let lastConv = '';
  let flow = 'ramenTimer';

  let mediaUrl = '';


  //search data
  let ramenData = ramenArray.find(item => {
    return item.name == ramen;
  });

  //직접 받아야 하는 겹치는거
  mediaUrl = ramenData.mediaUrl;
  imageLink = ramenData.imageLink;
  subtitle = ramenData.subtitle;
  title = ramenData.name;

  let name = ramenData.name; // "농심 신라면"
  let allergy = ramenData.allergy; //"밀, 대두, 돼지고기, 계란, 쇠고기 함유"
  let etc = ramenData.etc; //아직 정보 없음
  let info = ramenData.info; //"칼로리: 500kcal , 나트륨:1,790mg"

  lastConv = '';
  flow = 'ramenTimer';

  // 디스플레이 용 텍스트
  speechText = name + '의 타이머를 시작하겠습니다.'
  displayText = speechText + "\n * 영양정보: " + info + "\n * 조리법: " + subtitle;
  text = "알레르기 정보: " + allergy; // 알레르기 정보 표시

  if (name == "히든타이머") { // 히든타이머의 경우 스피치와 텍스트의 재정의가 필요
    speechText += '흥겨운 음악과 함께 2분 30초를 보내세요.'
    displayText = speechText + "\n * 영양정보: " + info + "\n * " + subtitle;
    text = "알레르기 정보: " + allergy; // 알레르기 정보 표시
  }

  //이전 재생을 위한 arrays
  let convArray = conv.data.previous;
  if (convArray === undefined) {
    convArray = [];
  }
  //이전 재생과 다시재생을 위한
  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'mediaUrl': mediaUrl
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

  if (!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
    conv.close('죄송합니다 이 기기에서는 오디오가 지원되지 않습니다. 앱을 종료합니다.');
    return;
  }

  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new MediaObject({
    name: title,
    url: mediaUrl,
    description: text,
    icon: new Image({
      url: imageLink,
      alt: title,
    }),
  }));



});

//미디어 레스폰스 끝나면 이걸로 들어감
app.intent('actions.intent.MEDIA_STATUS', (conv) => {
  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = '미디어의 상태를 알 수가 없습니다.';
  if (mediaStatus && mediaStatus.status === 'FINISHED') {
    response = '알람이 끝났습니다. 이제 다음 명령을 말해주세요.';
  }
  conv.ask(response);
  conv.ask(new Suggestions(suggestions));
});


// =======================================================================

// FALLBACK
app.intent(FALLBACK, (conv) => {
  console.log("FALLBACK");

  // let text
  let displayText = '';
  let speechText = '';
  let imageLink = '';
  let text = '';
  let title = '죄송합니다';
  let subtitle = ''

  let lastConv = '아니면 아래 칩을 참조하세요!';
  let flow = 'fallback';
  let convResponse = 'original'

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count <= 2) {

    if (count === 1) {
      displayText = '제가 잘 모르는 라면 입니다. "도움말"을 참조해 보시는건 어떨까요?';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 혹시 제가 모르는 라면인가요? 추가가 되었으면 하는 라면이 있다면 dev.LunaStratos@gmail.com 으로 메일로 알려주세요! "현재 가능한 라면" 이라고 말하시면 어떤 라면이 가능한지 알 수있습니다.';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
      speechText = displayText;
    }

    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
    conv.ask(new SimpleResponse(lastConv));

  } else if (count > 2) {
    displayText = '정말로 죄송합니다. 제가 잘 모르는 라면이거나 인식이 실패했습니다. 앱을 종료하겠습니다. ';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png";
    speechText = displayText;

    conv.close(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }), new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } //if 1


});




// HELP
app.intent(HELP, (conv) => {
  console.log("HELP");
  conv.data.fallbackCount = 0;

  let displayText = '라면 타이머는 여러 라면의 조리예와 타이머 기능을 가지고 있습니다. 예를들어 진짬뽕 이라고 말하면 조리예와 함께 타이머를 알려드립니다. 가능한 라면의 종류는 "현재 가능한 라면"을 참조하세요. 다음 질문을 해 주세요.';
  let speechText = '';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '설명서';
  let subtitle = ''

  let lastConv = '아래 칩을 참조하세요!그리고 말하고 싶은 라면을 물어보세요!';
  let flow = 'help';
  let convResponse = 'original'

  speechText = displayText;

  //이전 재생을 위한 arrays
  let convArray = conv.data.previous;

  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));
});


//지원되는 라면 리스트 만드는 function
function supportRamen() {
  let list = '';
  for (let i = 0; i < ramenArray.length; i++) {

    list += ramenArray[i].originalName; // 이름 리스트 가져오기

    if (i == ramenArray.length - 1) { // 마지막

    } else {
      list += ', ';
    }

  }
  return list;
}

// SUPPORTRAMEN
app.intent(SUPPORTRAMEN, (conv) => {
  suggestions = randomMakerForChips();
  console.log("SUPPORTRAMEN");
  conv.data.fallbackCount = 0;

  let getList = supportRamen();

  let displayText = '지원되는 라면종류는 ' + getList + ' 입니다. 앞으로 더욱 늘어날 예정입니다. ';
  let speechText = '';
  let convResponse = 'original';
  speechText = displayText;
  // let text

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/info.png';
  // let text
  let text = '';
  let title = '지원되는 라면종류';
  let subtitle = ''
  let flow = '';
  let lastConv = '다음 질문을 해 주세요.';


  //이전 재생과 다시재생을 위한
  let convArray = conv.data.previous;
  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));

});



// PREVIOUS
app.intent(PREVIOUS, (conv) => {
  console.log("PREVIOUS");
  conv.data.fallbackCount = 0;

  let convArray = conv.data.previous;
  let convArraylength = convArray.length - 1; //현재 array
  let flow = convArray[convArraylength].flow
  let convResponse = convArray[convArraylength].convResponse

  console.log(convArray);
  console.log('convArraylength: ', convArraylength);

  let displayText = convArray[convArraylength].data.displayText;
  let speechText = convArray[convArraylength].data.speechText;

  let text = convArray[convArraylength].data.text;
  let imageLink = convArray[convArraylength].data.imageLink;
  let title = convArray[convArraylength].data.title;
  let subtitle = convArray[convArraylength].data.subtitle;
  let lastConv = convArray[convArraylength].data.lastConv;

  if (convArraylength == 0) { // 처음이라면

  } else { // 처음이 아니라면

    //마지막 array제거 후 저장하기
    convArray.pop();
    //제거된 array의 -1인 길이를 가져와야 한다.
    //-1을 안하면 방금 말한 데이터를 가져오기 때문.
    convArraylength = convArraylength - 1;

    displayText = convArray[convArraylength].data.displayText;
    speechText = convArray[convArraylength].data.speechText;

    // let text
    imageLink = convArray[convArraylength].data.imageLink;
    text = convArray[convArraylength].data.text;
    subtitle = convArray[convArraylength].data.subtitle;
    title = convArray[convArraylength].data.title;
    lastConv = convArray[convArraylength].data.lastConv;

    flow = convArray[convArraylength].flow
    convResponse = convArray[convArraylength].convResponse;

    //last save
    conv.data.previous = convArray;

  }

  if (convResponse == "mediaResponse") {
    if (!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
      conv.close('죄송합니다 이 기기에서는 오디오가 지원되지 않습니다. 앱을 종료합니다.');
      return;
    }
    let mediaUrl = convArray[convArraylength].data.mediaUrl; //media인 경우는 따로 설정한다

    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new MediaObject({
      name: title,
      url: mediaUrl,
      description: text,
      icon: new Image({
        url: imageLink,
        alt: title,
      }),
    }));
    conv.ask(new Suggestions(suggestions));

  } else {
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
    conv.ask(new SimpleResponse(lastConv));
  }

});

// REPEAT
app.intent(REPEAT, (conv) => {
  console.log("REPEAT");
  conv.data.fallbackCount = 0;

  let convArray = conv.data.previous;
  let convArraylength = convArray.length - 1

  let displayText = convArray[convArraylength].data.displayText;
  let speechText = convArray[convArraylength].data.speechText;
  let imageLink = convArray[convArraylength].data.imageLink;

  let text = convArray[convArraylength].data.imageLink;
  let title = convArray[convArraylength].data.title;
  let subtitle = convArray[convArraylength].data.subtitle;
  let lastConv = convArray[convArraylength].data.lastConv;

  let convResponse = convArray[convArraylength].convResponse;
  let flow = convArray[convArraylength].flow;
  speechText = displayText;

  if (convResponse == "mediaResponse") { //media
    if (!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
      conv.close('죄송합니다 이 기기에서는 오디오가 지원되지 않습니다. 앱을 종료합니다.');
      return;
    }
    let mediaUrl = convArray[convArraylength].data.mediaUrl; //media인 경우는 따로 설정한다

    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new MediaObject({
      name: title,
      url: mediaUrl,
      description: text,
      icon: new Image({
        url: imageLink,
        alt: title,
      }),
    }));
    conv.ask(new Suggestions(suggestions));

  } else {
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
    conv.ask(new SimpleResponse(lastConv));

  }
});

//EXIT
app.intent(EXIT, (conv) => {
  console.log("EXIT");
  conv.data.fallbackCount = 0;
  let displayText = '앱을 종료합니다. 이용해 주셔서 감사합니다. 라면 맛있게 드세요!';
  let speechText = '';

  // let text
  let name = '끝내기';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png';

  let text = '';
  let title = '라면 타이머 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '';
  let flow = 'end';
  speechText = displayText;

  //ask
  conv.close(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.close(new Suggestions(suggestions));
  conv.close(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
});

// Action name is different to method name.
// my action name is dialogv2. So If you want another name, please rename it.
// action name: dialogv2 => change your action name.
exports.ramenTimer = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
