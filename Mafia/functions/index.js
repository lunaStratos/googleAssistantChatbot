'use strict';

const {
  dialogflow,
  Suggestions,
  SimpleResponse,
  BasicCard,
  Image,
  Button,
  List,
  Confirmation
} = require('actions-on-google');
const functions = require('firebase-functions');
// app
const app = dialogflow({
  debug: false
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const STARTGAME = 'StartGame';

const STARTGAME_YES = 'StartGame - yes';
const STARTGAME_NO = 'StartGame - no';

const GAMESELECT_OK = 'Game Select Ok';

// 선택한 직업
const SELECT_MAFIA = 'Game - select mafia';
const SELECT_CIVIL = 'Game - select civil';
const SELECT_POLICE = 'Game - select police';
const SELECT_DOCTOR = 'Game - select doctor';


//basic intent : for quality
const HELP = 'help';
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const EXIT = 'exit';

//entity name
const SELECT_JOB = 'selectJob';
const PEOPLE_NAME = 'peopleName';

//Arr
let peopleArray = [{
  name: '상하이 조',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '와싱턴',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '농부',
  job: '',
  text: ''
}, {
  name: '비둘기',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '미스터리쇼퍼',
  job: '',
  text: ''
}, {
  name: '김첨지',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '마술사',
  job: '',
  text: ''
}, {
  name: '휘발유',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '라플레루', //
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '반 다크홈',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '레너드', //
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '4달러', //
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '엄백호',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '서진희',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '시부린',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}, {
  name: '심영',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
  textJob: '광부',
  job: '',
  text: ''
}]

//for chip  => 사람이름 승계
let suggestions = ["게임시작", "도움말"];

//빈값체크용
var isEmpty = function(value) {
  if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
    return true
  } else {
    return false
  }
};


//ARR를 넣으면 랜덤 해주기
function shuffleRandom(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}

// 마피아 사람 선택
function selectMafiaCivil(array) {
  let selectArray = [];
  if (array.length > 3) {
    selectArray = array.slice(0, 3);
  } else if (array.length == 3) { // 1명이거나 2명이면
    selectArray = array.slice(0, 2);
  } else if (array.length == 2) { // 1명이거나 2명이면
    selectArray = array.slice(0, 1);
  } else if (array.length < 2) { // 1명이거나 2명이면
    selectArray = array.slice(0, 1);
  }
  return selectArray;
}

// Welcome intent.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;

  // let text
  let displayText = '';
  let speechText = '';
  // 앱 이름
  let appTitle = '모두의 마피아';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/mafiaOpning.jpg';
  let text = '여기는 안남시! 최고평의회에서 3명의 마피아가 숨어들었습니다. 시민세력이 되어서 안남시를 지킬것인가, 아니면 마피아가 되어서 도시를 점령할 것인가!';
  let title = appTitle + ' 입니다';
  let subtitle = ''
  let convResponse = 'original'

  let lastConv = '하나의 직업을 선택해 주세요. 시민과 마피아가 가능합니다.';
  let flow = 'welcome';
  let suggestionList = ['마피아', '시민', '끝내기', '도움말'];

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/The%20X%20Files%20theme.ogg";
  welcomeSound = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/kbs_sports.ogg'

  if (conv.user.last.seen) {

    displayText = "다시 " + appTitle + "에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠?";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "7s" soundLevel="-13dB" ><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';

  } else {
    displayText = appTitle + " 에 오신걸 환영합니다. 직업을 선택하면 게임이 시작됩니다. '메뉴얼'를 말하면 안내를 말합니다. 만약 종료하고 싶다면 '끝내기' 라고 말하시면 됩니다."
    speechText = "<speak><par>" +
      '<media><speak><break time="5s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "19s" soundLevel="-13dB"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }

  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  conv.data.repeat = convJson;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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


}); //WELCOME_INTENT


//STARTGAME
app.intent(STARTGAME, (conv) => {
  console.log("STARTGAME");
  conv.data.fallbackCount = 0;

  let selectJob = conv.parameters[SELECT_JOB];
  console.log('selectJob: ', selectJob);
  if (selectJob == undefined) {
    selectJob = conv.data.selectJob;
  }
  conv.data.selectJob = selectJob
  console.log("seiyuEntity data: ", selectJob);
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '이 캐릭터를 선택하신다면 [예], 다른 캐릭터를 선택하고 싶다면 [아니오]를 말해주세요.';
  let flow = 'selectJob';
  let suggestionList = ['예 ', '아니오', '끝내기']
  let soundLink = '';
  switch (selectJob) {
    case '시민':
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/civil.jpg';
      selectJob += '을';
      text = '시민이 되어 안남시의 평화를 지키겠습니까?'
      title = '시민!';

      // 디스플레이 용 텍스트
      displayText = '게이머께서는 ' + selectJob + ' 선택하셨습니다. 시민은 최고평의회에서 인민재판을 열어 마피아를 제거하는 것이 목표입니다. 밤에는 마피아에 당할 수 있습니다. ';

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Credens%20justitiam.ogg';;
      speechText = "<speak><par>" +
        '<media><speak>' + displayText + "</speak></media>" +
        '<media fadeOutDur="1s" end = "12s" soundLevel="-8dB" ><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';
      break;
    case '마피아':
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/mafia.jpg';

      selectJob += '를'
      text = '마피아의 보스가 되어 안남시를 점령하시겠습니까?'
      title = '마피아!';

      // 디스플레이 용 텍스트
      displayText = '게이머께서는 ' + selectJob + ' 선택하셨습니다. 마피아는 인민재판에서 살아남것이 목표입니다. 밤에는 보스가 되어 빵야할 수 있습니다. ';

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/sis_puella.ogg';
      speechText = "<speak><par>" +
        '<media><speak>' + displayText + "</speak></media>" +
        '<media fadeOutDur="1s" end = "12s" soundLevel="-2dB" ><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';
      break;
    case '의사':
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/doctor.jpg';
      selectJob += '를';
      break;
    case '경찰':
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/police.jpg';
      selectJob += '을'
      break;

  }


  //이전 재생과 다시재생을 위한
  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  conv.data.repeat = convJson;


  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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


}); //STARTGAME


app.intent(STARTGAME_YES, (conv) => {
  console.log("STARTGAME_YES");
  conv.data.fallbackCount = 0;

  //게임이 끝났는지 안끝났는지
  conv.data.gameEnd = false;
  conv.data.sun = true;

  //선택한 직업
  const selectJob = conv.data.selectJob;

  //context name
  const CIVILSELECT = 'civil';
  const MAFIASELECT = 'mafia';
  const DOCTORSELECT = 'doctor';
  const POLICESELECT = 'police';

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/mafiaGame_annam.png';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '이제 이름을 말해주세요.';
  let flow = '';
  let suggestionList = []

  let soundLink = '';

  let tempText = '';

  //섞어주기
  shuffleRandom(peopleArray);
  //13명중에 유저를 제외한 나머지를 선택
  //마피아 3 시민세력 10명
  // 유저가 마피아로 가면 마피아는 2 + 유저
  // 시민세력으로 가면 시민세력 1명 제외
  // 1~10까지는 시민세력이름으로
  // 11~13은 마피아 이름으로 지정

  let civilDefine = peopleArray.slice(0, 10);
  let doctorDefine = peopleArray.slice(8, 9);
  let policeDefine = peopleArray.slice(9, 10);
  let mafiaDefine = peopleArray.slice(10, peopleArray.length)
  conv.data.civil = civilDefine;
  //특수직업은 따로지정한다.
  conv.data.doctor = doctorDefine;
  conv.data.police = policeDefine;
  // 마피아
  conv.data.mafia = mafiaDefine;
  conv.data.deadList = [];

  console.log('civilDefine ', civilDefine)
  console.log('mafiaDefine ', mafiaDefine)

  let userData = {
    name: '보스',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg',
    textJob: '보스',
    job: '',
    text: ''
  }

  let arrDefine = '';
  let tempArr = []
  //    StartGame-yes-followup 진입을 위해서 만들기
  conv.contexts.set('StartGame-yes-followup', 1);
  //각 직업별 consext 생성
  switch (selectJob) {
    // 깨시민
    case '시민':

      userData.name = '의장'
      userData.textJob = '시민'
      userData.job = '시민'
      //시민 선택시 한명을 없에고 유저를 넣는다.
      civilDefine.pop();
      civilDefine.push(userData)
      arrDefine = mafiaDefine.concat(civilDefine);
      conv.data.civil = civilDefine; //시민세력 저장

      arrDefine = civilDefine.concat(mafiaDefine);
      conv.data.allArray = arrDefine; //전체 만들어진 리스트

      //chip make
      //전체 리스트를 받는다.
      suggestionList = chipMake(suggestionList, arrDefine);
      tempText = peopleListTextMake(arrDefine);

      displayText = '당신은 안남시의 시민! 시민으로서 최고평의회에 참가하게 되었습니다. 하지만 마피아가 숨어들어 있는거 같군요. 13명의 위원중 마피아는 3명! 안남시의 평화를 위해서 한명을 투표하세요.'

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Misirlou.ogg';

      speechText = '<speak><par>' +
        '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
        '<media fadeOutDur="1s" end = "17s" soundLevel="-8dB" ><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      text = '여기는 안남시. 우리의 목표는 마피아를 색출하고 도시의 평화를 지키는 것! 투표로 인민재판을 여세요. \n * 현재 전체 리스트 \n ' + tempText
      title = '안남시, 지금은 낮'
      flow = 'selectCivil';

      conv.contexts.set(CIVILSELECT, 1);
      break;

      //마피아
    case '마피아':

      userData.name = '보스'
      userData.textJob = '마피아'
      userData.job = '마피아'

      mafiaDefine.pop(); // 마피아 한명 없에기
      mafiaDefine.push(userData) // 마피아에 유저 넣기
      conv.data.mafia = mafiaDefine;

      //전체 데이터 만들기
      arrDefine = mafiaDefine.concat(civilDefine);
      conv.data.allArray = arrDefine;
      //chip make
      suggestionList = chipMake(suggestionList, civilDefine);
      tempText = peopleListTextMake(civilDefine);

      displayText = '당신은 마피아! 성공적으로 안남시에 잠입하여 최고평의회에 참가하게 되었습니다. 하지만 시민들이 인민재판으로 방해를 하네요. \n 지금은 낮! 인민재판이 열렸습니다. 시민의 이름을 한명 말해주세요'
      // 마녀가 되는 테마곡
      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Mission-Impossible_cut.ogg';
      speechText = '<speak><par>' +
        '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
        '<media fadeOutDur="1s" end = "17s" soundLevel="-8dB" ><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      text = '여기는 안남시. 우리의 목표는 안남시에 최후까지 살아남아 점령하는 것! 시민들의 인민재판 때 투표를, 밤에는 한명을 빵야하기 위해 지목한다! \n * 현재 시민 리스트 \n ' + tempText
      title = '안남시, 지금은 낮'

      flow = 'selectMafia';

      //consext 생성
      conv.contexts.set(MAFIASELECT, 1);
      break;
      //의사
    case '의사':
      userData.job = '의사'

      tempArr = peopleArray.slice(0, 10);
      tempArr = tempArr.splice(8, 1); //기존 의사 지우기
      tempArr = tempArr.splice(8, 0, userData); //지운 데이터에 유저 넣기
      conv.data.civil = tempArr;

      arrDefine = tempArr.concat(mafiaDefine);
      conv.data.allArray = arrDefine;

      conv.data.doctor = userData;

      displayText = '당신은 안남시의 의사! 시민세력으로서 최고평의회에 참가하게 되었습니다. 하지만 마피아가 숨어들어 있는거 같군요. 13명의 위원중 마피아는 3명! 안남시의 평화를 위해서 낮에는 한명을 투표하세요.'
      speechText = '<speak><seq>' +
        "<media><speak>당신은 안남시의 의사! 시민세력으로서 최고평의회에 참가하게 되었습니다. 하지만 마피아가 숨어들어 있는거 같군요. </speak></media>";
      '<media><audio src="https://actions.google.com/sounds/v1/weapons/gun_trigger_release.ogg" clipEnd ="2s"/></media>' +
      "<media><speak> 안남시의 평화를 위해서 낮에는 한명을 투표하세요.</speak></media></seq> </speak>";

      conv.contexts.set(DOCTORSELECT, 1);

      break;
      //경찰
    case '경찰':
      userData.job = '경찰'

      tempArr = peopleArray.slice(0, 10);
      tempArr = tempArr.splice(9, 1); //기존 의사 지우기
      tempArr = tempArr.splice(9, 0, userData); //기존 의사 지우기
      conv.data.civil = tempArr;

      conv.data.police = userData;

      arrDefine = tempArr.concat(mafiaDefine);
      conv.data.allArray = arrDefine;

      displayText = '당신은 안남시의 경찰! 시민세력으로서 최고평의회에 참가하게 되었습니다. 하지만 마피아가 숨어들어 있는거 같군요. \n13명의 위원중 마피아는 3명! 지금은 낮! 안남시의 평화를 위해서 낮에는 한명을 투표하세요.'
      speechText = '<speak><seq>' +
        "<media><speak>당신은 안남시의 경찰! 시민세력으로서 최고평의회에 참가하게 되었습니다. 하지만 마피아가 숨어들어 있는거 같군요.  </speak></media>";
      '<media><audio src="https://actions.google.com/sounds/v1/weapons/gun_trigger_release.ogg" clipEnd ="2s"/></media>' +
      "<media><speak> 13명의 위원중 마피아는 3명! 안남시의 평화를 위해서 낮에는 한명을 투표하세요 </speak></media></seq> </speak>";

      conv.contexts.set(POLICESELECT, 1);

      break;
  }

  //사용자 정보 따로 저장
  conv.data.user = userData;
  //낮 밤
  conv.data.sun = false;
  //이전 재생과 다시재생을 위한
  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  conv.data.repeat = convJson;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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


// STARTGAME_NO
app.intent(STARTGAME_NO, (conv) => {
  console.log("STARTGAME_NO");
  conv.data.fallbackCount = 0;
  // 바로 welcome으로 이동한다
  // 이벤트에 이름 넣고 followup으로 승천
  conv.followup('selectJob');
});

//arr가지고 사람 리스트 텍스트 만드는 function
function peopleListTextMake(arr) {
  let text = '';
  for (var j = 0; j < arr.length; j++) {

    if(arr[j].name == '의장' || arr[j].name == '보스'){

    }else{
      if (j == (arr.length - 1)) { //마지막은 , 제외
        text += arr[j].name + '';
      } else {
        text += arr[j].name + ', ';
      }
    }

  }
  return text;
} //peopleListTextMake

// chip 만들어주는 부분
function chipMake(suggest, arr) {
  let tempLength = 0;
  //chip은 8개 이하로 고정
  if (arr.length > 8) {
    tempLength = 7;
  } else {
    tempLength = arr.length;
  }
  // chip 만들기
  for (var j = 0; j < tempLength; j++) {
    //의장은 빼준다.
    if(arr[j].name == '의장' || arr[j].name == '보스'){

    }else{
      suggest[j] = arr[j].name;
    }

  }
  return suggest;
} // chipMake

// 마피아인 경우 밤에 시민을 선택한다
// 낮->밤->낮->밤 루프식
app.intent(SELECT_MAFIA, (conv) => {
  console.log("SELECT_MAFIA");
  conv.data.fallbackCount = 0;

  const peopleName = conv.parameters[PEOPLE_NAME];
  //처음은 이름 -> 밤 -> 낮 -> 밤

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '보스! 시민세력 중에서 한명의 이름을 말해주세요!';
  let flow = 'selectMafia';
  let suggestionList = ['끝내기']

  let mafiaList = conv.data.mafia;
  let civilList = conv.data.civil;
  let civilListLength = conv.data.civil.length;
  let mafiaListLength = conv.data.mafia.length;

  let policeList = conv.data.police;
  let doctorList = conv.data.doctor;
  let allList = conv.data.allArray;
  let deadList = conv.data.deadList;

  let tempTextMafia = '';
  let tempTextCivil = '';
  let tempTextDoctor = '';
  let tempTextPolice = '';
  let tempDoctorPolice = '';

  let VoteSeleted = ''; // 선택된 사람
  let deadMafia = ''; // 마피아 죽음
  let deadCivil = ''; // 시민 죽음

  let deadFlag = false; // 죽은 사람 선택시

  let soundLink = '';

  if (conv.data.sun) { // 낮이라면
    imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/morning.jpg';

    VoteSeleted = peopleName; //선택한 이름이 투표한 이름에 투표한 이름으로 교체

    //deadList 분석
    for (var j = 0; j < deadList.length; j++) {
      if (deadList[j].name == VoteSeleted) {
        deadFlag = true;
      }
    }
    //이미 죽은 사람이라면
    if (deadFlag) {

      // chip 만들기
      suggestionList = chipMake(suggestionList, civilList);
      tempTextCivil = peopleListTextMake(civilList);
      //이미지 밤을 변경
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/night.jpg';

      displayText = '선택하신' + VoteSeleted + "는 이미 빵야된 몸입니다!"
      displayText += '다시 선택해 주세요.\n';
      displayText += '현재 시민세력은 ' + tempTextCivil;
      displayText += '들이 있는 상태입니다.'

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Ironside.ogg';
      speechText = "<speak><par>" +
        '<media><speak>' + displayText + "</speak></media>" +
        '<media fadeInDur="1s" fadeOutDur="1s" soundLevel="-9dB"><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      text = '이미 빵야된 사람입니다!\n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n *시민 리스트: \n' + tempTextCivil
      title = '안남시, 지금은 밤'

      conv.contexts.set('mafia', 1);
      conv.contexts.set('StartGame-yes-followup', 1);


    } else { //선택한 사람이 죽은 사람이 아니라면 정상 플로우로 작동

      //시민세력 없에기
      let civilFlag = false;

      let definePeople = '';
      for (var i = 0; i < civilList.length; i++) {
        if (VoteSeleted == civilList[i].name) {

          deadList = deadList.concat(civilList.slice(i, i + 1));
          conv.data.deadList = deadList;

          civilList.splice(i, 1);
          conv.data.civil = civilList;

          definePeople = 'civil'
          deadCivil = VoteSeleted.name + '는 시민세력 이였습니다! ';
          civilFlag = true;


        }
        if (VoteSeleted == doctorList.name) {
          definePeople = 'doctor';
          conv.data.doctor = undefined;
          deadCivil = VoteSeleted.name + '는 의사였습니다! ';
        }
        if (VoteSeleted == policeList.name) {
          definePeople = 'police';
          conv.data.police = undefined;
          deadCivil = VoteSeleted.name + '는 잠복경찰이였습니다! ';
        }
      } // for 시민세력 없에기

      //모든 리스트에서 없에주기
      let resultPeople = allList;
      for (var i = 0; i < resultPeople.length; i++) {
        if (VoteSeleted == resultPeople[i].name) {
          resultPeople.splice(i, 1); // 사람삭제
        }

      } // for 시민세력 없에기
      conv.data.allArray = resultPeople; //모든 사람 재저장

      // 시민세력 리스트 만들기
      tempTextCivil = peopleListTextMake(civilList);
      // 마피아 리스트 만들기
      tempTextMafia = peopleListTextMake(mafiaList);

      // chip 만들기
      suggestionList = chipMake(suggestionList, civilList);

      if (civilFlag) { // 선택한 사람이 시민세력이라면

        //리스트 길이 다시 받기
        civilListLength = conv.data.civil.length;
        mafiaListLength = conv.data.mafia.length;

        if (civilList.length != 0) {
          displayText = '보스의 선택 결과 ' + VoteSeleted + "가 선택되어 빵야 되었습니다! "
          displayText += '이제 낮이되고 시민들이 일어났네요. \n';
          displayText += '현재 마피아는 ' + tempTextMafia + "가 있습니다. 시민세력은 " + tempTextCivil;
          displayText += '들이 있습니다.' + tempTextPolice + tempTextDoctor;
          lastConv = '인민재판이 열렸습니다. 시민세력의 사람중 한명에게 투표를 하세요'
          soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Soviet%20Connection.ogg';
          speechText = "<speak><par>" +
            '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
            '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-7dB" end ="16s"><audio src="' + soundLink + '"/></media>' +
            '</par></speak>';

          text = '보스! 투표를 해 주십쇼!\n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n *시민 리스트: \n' + tempTextCivil
          title = '안남시, 지금은 낮'

          conv.contexts.set('mafia', 1);
          conv.contexts.set('StartGame-yes-followup', 1);
          conv.data.sun = false; // 밤으로 교체

        } else { //모든 시민 빵야시 => 승리

          displayText = '보스의 선택 결과 ' + VoteSeleted + "가 선택되어 빵야 되었습니다! \n"
          displayText += '보스! 성공입니다! 안남시를 모두 점령하였습니다!';

          soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/konan_sound_cut.ogg';
          speechText = '<speak><par>' +
            '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
            '<media fadeInDur="3s" fadeOutDur="3s" end ="12s"><audio src="' + soundLink + '"/></media>' +
            '</par></speak>';

          lastConv = '다시 게임을 시작하시겠습니까?';

          text = '보스! 성공했습니다! 안남시가 우리 손안에 들어왔습니다!'
          title = '안남시 정ㅋ복ㅋ'
          suggestionList = ["마피아", '시민', '게임종료', '메뉴얼']

          conv.data.sun = true;
          conv.data.gameEnd = true;

        }

      } else { //선택한 사람이 마피아였다면 =>
        imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/night.jpg';

        displayText = '보스! 선택하신 ' + VoteSeleted + '는 우리 마피아입니다! 다시 선택해 주세요! \n'
        displayText += '현재 마피아는 ' + tempTextMafia + "가 있습니다. 현재 시민세력은 " + tempTextCivil;
        displayText += '들이 있습니다.';

        soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Ironside.ogg';
        speechText = "<speak><par>" +
          '<media><speak>' + displayText + "</speak></media>" +
          '<media soundLevel="-6dB" end ="15s" soundLevel="-9dB"><audio src="' + soundLink + '"/></media>' +
          '</par></speak>';

        text = '보스! 말하신 사람은 우리 마피아 팀원입니다. 다시 투표를 해 주십쇼!\n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n *시민 리스트: \n' + tempTextCivil
        title = '안남시, 지금은 밤'

        conv.contexts.set('mafia', 1);
        conv.contexts.set('StartGame-yes-followup', 1);

      }
    }

    //Night====================================================================================
    //Night====================================================================================
    //Night====================================================================================

  } else { // 밤이라면 => 시민이 선택한 사람이 죽음

    // 밤 이미지로 변경
    imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/night.jpg'

    //투표결과를 부르기 (아침결과) => 밤에만 사용
    let resultPeople = shuffleRandom(allList);

    console.log('선택된 0번 사람 ', resultPeople)
    VoteSeleted = resultPeople[resultPeople.length - 1]; // 마지막 사람을 일단 고른다

    // 유저가 죽었다면 => 게임종료
    if (VoteSeleted.name == conv.data.user.name) {

      // 디스플레이 용 텍스트
      displayText = '시민들의 투표결과 보스가 선택되어 빵야 되었습니다! \n';
      displayText += '저런! 게이머가 당했습니다! 이렇게 게임이 끝났습니다.';

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Lonely%20Shepherd_cut.ogg';
      speechText = '<speak><par>' +
        '<media><speak><break time="4s"/>' + displayText + "</speak></media>" +
        '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-4dB" end ="13s"><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      lastConv = '다시 게임을 시작하시겠습니까? 캐릭터로 답해주시면 됩니다.';
      suggestionList = ["마피아", '시민', '게임종료', '메뉴얼']

      text = '보스ㅜㅜ';
      title = '보스 빵야';

      conv.data.sun = true;
      conv.data.gameEnd = true;
      conv.contexts.set('StartGame-followup', 1);

    } else { // 죽은 사람이 유저가 아니라면 일단 게임계속

      //죽은 사람리스트에 추가
      deadList = deadList.concat(VoteSeleted);
      conv.data.deadList = deadList;

      //마지막 사람 죽이기
      resultPeople.pop();
      conv.data.allArray = resultPeople; //모든 사람 재저장

      let definePeople = ''; //사람정의

      //마피아인지 시민인지 찾아서 삭제
      for (var i = 0; i < civilList.length; i++) {
        if (VoteSeleted.name == civilList[i].name) {

          civilList.splice(i, 1)
          conv.data.civil = civilList;

          definePeople = 'civil'
          deadCivil = VoteSeleted.name + '는 시민세력 이였습니다! ';

        }

      }
      //의사와 경찰
      if (VoteSeleted.name == conv.data.doctor.name) {
        definePeople = 'doctor';
        conv.data.doctor = undefined; // 의사 삭제
        deadCivil = VoteSeleted.name + '는 의사였습니다! ';
      }
      if (VoteSeleted.name == conv.data.police.name) {
        definePeople = 'police';
        conv.data.police = undefined; // 경찰 삭제
        deadCivil = VoteSeleted.name + '는 잠복경찰이였습니다! ';
      }

      // 마피아인 경우 삭제
      for (var i = 0; i < mafiaList.length; i++) {
        if (VoteSeleted.name == mafiaList[i].name) {
          mafiaList.splice(i, 1); // 한명삭제
          conv.data.mafia = mafiaList; // 그리고 저장
          definePeople = 'mafia'
          deadMafia = VoteSeleted.name + '는 마피아 였습니다! ';
        }
      }

      // 낮으로 바꾸기
      // 게임종료나 게임중이나 둘다 낮
      conv.data.sun = true;

      if (civilList.length != 0) {

        //인원 수 다시 만들기
        civilListLength = conv.data.civil.length;
        mafiaListLength = conv.data.mafia.length;

        //리스트 만들기
        tempTextMafia = peopleListTextMake(mafiaList);
        tempTextCivil = peopleListTextMake(civilList);

        //CHIP 만들기
        suggestionList = chipMake(suggestionList, civilList);

        // 디스플레이 용 텍스트
        displayText = '시민들의 투표결과 ' + VoteSeleted.name + "가 선택되어 빵야 되었습니다! ";
        displayText += deadMafia + deadCivil
        displayText += '이제 시민들이 집으로 들어가고, 밤이 되었습니다. 마피아가 일어났네요. \n';
        displayText += '현재 마피아는 ' + tempTextMafia + "가 있습니다. 시민세력은 " + tempTextCivil;
        displayText += '들이 있습니다.' + tempTextPolice + tempTextDoctor;

        soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/randy-edelman.ogg';
        speechText = '<speak><par>' +
          '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
          '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-5dB" end ="16s"><audio src="' + soundLink + '"/></media>' +
          '</par></speak>';

        text = '보스의 선택을 기다리고 있습니다. \n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n*시민 리스트: \n ' + tempTextCivil
        title = '안남시, 지금은 밤'

        //context생성
        conv.contexts.set('mafia', 1);
        conv.contexts.set('StartGame-yes-followup', 1);

      } else { //모든 시민 빵야시 => 승리

        displayText = '보스의 선택 결과 ' + VoteSeleted + "가 선택되어 빵야 되었습니다! \n"
        displayText += '보스! 성공입니다! 안남시를 모두 점령하였습니다!';

        soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/konan_sound_cut.ogg';
        speechText = '<speak><par>' +
          '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
          '<media fadeInDur="3s" fadeOutDur="3s" end ="12s"><audio src="' + soundLink + '"/></media>' +
          '</par></speak>';

        lastConv = '다시 게임을 시작하시겠습니까?';

        text = '보스! 성공했습니다! 안남시가 우리 손안에 들어왔습니다!'
        title = '안남시 정ㅋ복ㅋ'
        suggestionList = ["마피아", '시민', '게임종료', '메뉴얼']

        conv.contexts.set('StartGame-yes-followup', 1);
        conv.data.sun = true;
        conv.data.gameEnd = true;

      }

    } // if 죽은 사람이 유저가 아니라면 end


  } //밤이라면



  //이전 재생과 다시재생을 위한
  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  conv.data.repeat = convJson;

  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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



// 시민
// 낮-> 낮 ->낮
app.intent(SELECT_CIVIL, (conv) => {
  console.log("SELECT_CIVIL");
  conv.data.fallbackCount = 0;

  const peopleName = conv.parameters[PEOPLE_NAME];
  //처음은 이름 -> 밤 -> 낮 -> 밤

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '의장님! 신성한 한표를 행사해 주세요!';
  let flow = 'selectCivil';
  let suggestionList = ['끝내기']

  let mafiaList = conv.data.mafia;
  let civilList = conv.data.civil;
  let civilListLength = conv.data.civil.length;
  let mafiaListLength = conv.data.mafia.length;

  let policeList = conv.data.police;
  let doctorList = conv.data.doctor;
  let allList = conv.data.allArray;
  let deadList = conv.data.deadList;

  let tempTextMafia = '';
  let tempTextCivil = '';
  let tempTextDoctor = '';
  let tempTextPolice = '';
  let tempDoctorPolice = '';
  let tempTextAll = '';

  let VoteSeleted = ''; // 선택된 사람
  let deadMafia = ''; // 마피아 죽음
  let deadCivil = ''; // 시민 죽음

  let deadFlag = false; // 죽은 사람 선택시


  let soundLink = '';

  if (conv.data.sun) { // 낮이라면
    imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/morning.jpg';

    //시민중에서 뽑는다
    civilList = shuffleRandom(civilList);
    VoteSeleted = civilList[civilList.length - 1]; // 마지막 사람을 일단 고른다

    // 유저가 죽었다면 => 게임종료
    if (VoteSeleted.name == conv.data.user.name) {

      // 디스플레이 용 텍스트
      displayText = '마피아들의 결과 게이머가 선택되어 빵야 되었습니다! \n';
      displayText += '저런! 게이머가 당했습니다! 이렇게 게임이 끝났습니다.';

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/28%20Theme.ogg';
      speechText = '<speak><par>' +
        '<media><speak><break time="4s"/>' + displayText + "</speak></media>" +
        '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-4dB" end ="13s"><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      lastConv = '다시 게임을 시작하시겠습니까? 캐릭터로 답해주시면 됩니다.';
      suggestionList = ["마피아", "시민", '게임종료', '메뉴얼']

      text = '시민ㅜㅜ';
      title = '게이머 빵야';

      conv.data.sun = true;
      conv.data.gameEnd = true;
      conv.contexts.set('StartGame-followup', 1);

    } else { // 죽은 사람이 유저가 아니라면 일단 게임계속

      //죽은 사람리스트에 추가
      deadList = deadList.concat(VoteSeleted);
      conv.data.deadList = deadList;

      // 마지막 삭제
      civilList.pop();
      // conv 시민입력
      conv.data.civil = civilList;

      //고른 시민을 모든 리스트에서 사람 삭제
      for (var i = 0; i < allList.length; i++) {
        if (VoteSeleted.name == allList[i].name) {
          allList.splice(i, 1); // 사람삭제
        }
      } // for 시민세력 없에기
      conv.data.allArray = allList; //모든 사람 재저장

      let definePeople = ''; //사람정의

      //마피아인지 시민인지 찾아서 삭제

      definePeople = 'civil'
      deadCivil = VoteSeleted.name + ' 빵야 당했습니다! ';

      if (VoteSeleted.name == conv.data.doctor.name) {
        definePeople = 'doctor';
        conv.data.doctor = undefined; // 의사 삭제
        deadCivil = VoteSeleted.name + ' 빵야 당했습니다! ';
      }
      if (VoteSeleted.name == conv.data.police.name) {
        definePeople = 'police';
        conv.data.police = undefined; // 경찰 삭제
        deadCivil = VoteSeleted.name + ' 빵야 당했습니다! ';
      }


      conv.data.sun = false; // 밤으로 바꾸기
      //context생성
      conv.contexts.set('civil', 1);
      conv.contexts.set('StartGame-yes-followup', 1);

      tempTextAll = peopleListTextMake(allList)

      //CHIP 만들기
      suggestionList = chipMake(suggestionList, allList);

      //인원 수 다시 만들기
      civilListLength = conv.data.civil.length;
      mafiaListLength = conv.data.mafia.length;

      // 디스플레이 용 텍스트
      displayText = '밤이 지났습니다! 마피아들은 ' + VoteSeleted.name + "을 빵야 하였습니다! ";
      displayText += deadMafia + deadCivil
      displayText += '이제 시민들이 나오고 최고평의회에서 인민재판이 열렸습니다. \n';
      displayText += ' 현재 ' + tempTextAll;
      displayText += '들이 있습니다.' + tempTextPolice + tempTextDoctor;

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/nhk_cut.ogg';
      speechText = '<speak><par>' +
        '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
        '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-13dB" end ="16s"><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      text = '의장님! 신성한 한표! 부탁드립니다.! \n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n *전체 리스트: \n ' + tempTextAll
      title = '안남시, 지금은 낮'

      lastConv = '아래의 칩을 보시고 신성한 한표를 행사해 주세요.'

    } // if 죽은 사람이 유저가 아니라면 end

    //Night====================================================================================
    //Night====================================================================================
    //Night====================================================================================

  } else { // 밤-> 낮 마피아가 선택한 사람이 죽음

    imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/morning.jpg'

    //deadList 분석 => 이름과 같은 사람이 있다면 true 반환
    for (var j = 0; j < deadList.length; j++) {
      if (deadList[j].name == peopleName) {
        deadFlag = true;
      }
    }

    //이미 죽은 사람이라면
    if (deadFlag) {

      // chip 만들기 => 전체인원으로 한다. (특정 세력 아님)
      suggestionList = chipMake(suggestionList, allList);
      tempTextAll = peopleListTextMake(allList);

      //이미지 밤을 변경
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/mafiaGame/morning.jpg';

      displayText = '선택하신' + VoteSeleted + "는 이미 빵야된 몸입니다!"
      displayText += '다시 선택해 주세요.\n';
      displayText += '현재 안남시에는 ' + tempTextAll;
      displayText += '들이 있는 상태입니다.'

      soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/licoder.ogg';
      speechText = "<speak><par>" +
        '<media><speak>' + displayText + "</speak></media>" +
        '<media fadeInDur="1s" fadeOutDur="3s" soundLevel="-9dB" end ="12s"><audio src="' + soundLink + '"/></media>' +
        '</par></speak>';

      text = '이미 빵야된 사람입니다!\n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n *전체 리스트: \n' + tempTextAll
      title = '안남시, 지금은 낮'

      conv.contexts.set('civil', 1);
      conv.contexts.set('StartGame-yes-followup', 1);

    } else { //죽은 사람이 아니라면

      // 시민 인민투표 시간
      // 모든 리스트에서 삭제
      allList = shuffleRandom(allList);
      VoteSeleted = allList[allList.length - 1]; // 마지막 사람을 일단 고른다

      // 유저가 죽었다면 => 게임종료
      if (VoteSeleted.name == conv.data.user.name) {

        // 디스플레이 용 텍스트
        displayText = '시민들의 투표결과 게이머가 선택되어 빵야 되었습니다! \n';
        displayText += '저런! 게이머가 당했습니다! 이렇게 게임이 끝났습니다.';

        soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/28%20Theme.ogg';
        speechText = '<speak><par>' +
          '<media><speak><break time="4s"/>' + displayText + "</speak></media>" +
          '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-4dB" end ="13s"><audio src="' + soundLink + '"/></media>' +
          '</par></speak>';

        lastConv = '다시 게임을 시작하시겠습니까? 캐릭터로 답해주시면 됩니다.';
        suggestionList = ["마피아", "시민", '게임종료', '메뉴얼']

        text = '시민ㅜㅜ';
        title = '게이머 빵야';

        conv.data.sun = true;
        conv.data.gameEnd = true;
        conv.contexts.set('StartGame-followup', 1);

      } else { // 죽은 사람이 유저가 아니라면 게임지속 => 시민 죽이기

        //죽은 사람리스트에 추가
        deadList = deadList.concat(VoteSeleted);
        conv.data.deadList = deadList;

        // allList에서 마지막 시민 삭제
        allList.pop();

        conv.data.allArray = allList; //모든 사람 재저장

        let definePeople = ''; //사람정의

        //VoteSeleted.name가 값을 가지고 있다.
        //마피아인지 시민인지 찾아서 삭제
        for (var i = 0; i < civilList.length; i++) {
          if (VoteSeleted.name == civilList[i].name) {

            civilList.splice(i, 1)
            conv.data.civil = civilList;

            definePeople = 'civil'
            deadCivil = VoteSeleted.name + '는 시민세력이었습니다. ';

          }
          if (VoteSeleted.name == conv.data.doctor.name) {
            definePeople = 'doctor';
            conv.data.doctor = undefined; // 의사 삭제
            deadCivil = VoteSeleted.name + '는 의사였습니다. ';
          }
          if (VoteSeleted.name == conv.data.police.name) {
            definePeople = 'police';
            conv.data.police = undefined; // 경찰 삭제
            deadCivil = VoteSeleted.name + '는 경찰이었습니다. ';
          }
        }
        // 마피아인 경우 삭제
        for (var i = 0; i < mafiaList.length; i++) {
          if (VoteSeleted.name == mafiaList[i].name) {

            mafiaList.splice(i, 1); // 한명삭제
            conv.data.mafia = mafiaList; // 그리고 저장
            definePeople = 'mafia'
            deadMafia = VoteSeleted.name + '는 마피아 였습니다! ';
          }
        }

        //마피아가 모두 죽었다면?
        conv.data.sun = true; // 낮으로 바꾸기

        //인원 수 다시 만들기
        civilListLength = conv.data.civil.length;
        mafiaListLength = conv.data.mafia.length;

        if (mafiaList.length == 0) {

          //CHIP 만들기
          suggestionList = ['마피아', '시민', '게임종료', '도움말']

          // 디스플레이 용 텍스트
          displayText = '시민들의 투표결과 ' + VoteSeleted.name + "가 선택되어 빵야 되었습니다! ";
          displayText += deadMafia + deadCivil
          displayText += '축하합니다! 안남시의 마피아가 모두 빵야되었습니다.\n';
          displayText += '이렇게 안남시는 평화를 되찾았습니다! '

          soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/Going%20The%20Distance.ogg';
          speechText = '<speak><par>' +
            '<media><speak><break time="5s"/>' + displayText + "</speak></media>" +
            '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-10dB" end ="16s"><audio src="' + soundLink + '"/></media>' +
            '</par></speak>';
          lastConv = '게임을 다시 하시겠습니까? 캐릭터를 말하면 각 캐릭터로 시작됩니다.'

          text = '안남시는 평화를 되찾았습니다!'
          title = '시민세력의 승리!'
          conv.contexts.set('StartGame-yes-followup', 1);

        } else { //마피아가 다 안죽은 상태
          //전체사람으로 텍스트리스트만들기
          tempTextAll = peopleListTextMake(allList);

          //CHIP 만들기
          suggestionList = ['다음'];

          // 디스플레이 용 텍스트
          displayText = '시민들의 투표결과 ' + VoteSeleted.name + "가 선택되어 빵야 되었습니다! ";
          displayText += deadMafia + deadCivil
          displayText += '이제 시민들이 집으로 들어가고, 밤이 되었습니다. 마피아가 일어났네요. \n';
          displayText += '마피아는 과연 누구에게 투표를 할까요?'

          lastConv = '다음 이라고 말하면 밤이 지나갑니다.'
          soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg';
          speechText = '<speak><par>' +
            '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
            '<media fadeInDur="1s" fadeOutDur="4s" soundLevel="-1dB" end ="16s"><audio src="' + soundLink + '"/></media>' +
            '</par></speak>';

          text = '밤이 되었습니다. 시민은 고개를 숙이고 마피아는 고개를 들어 한명을 지목하세요.\n 남은 마피아: ' + mafiaListLength + '명\n 남은 시민: ' + civilListLength + '명\n *전체 리스트: \n ' + tempTextAll
          title = '안남시, 지금은 낮'

          //context생성
          conv.contexts.set('civil', 1);
          conv.contexts.set('StartGame-yes-followup', 1);
        }

      } // if 죽은 사람이 유저가 아니라면 end

    }

  } //밤이라면



  //이전 재생과 다시재생을 위한
  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  conv.data.repeat = convJson;

  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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

  let lastConv = '이제 말을 해 주세요.';
  let flow = 'fallback';
  let convResponse = 'original'
  let suggestionList = [];

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count < 3 && (conv.data.repeat.flow == 'selectMafia' || conv.data.repeat.flow == 'selectCivil')) {


    switch (conv.data.repeat.flow) {
      case 'selectMafia':
        conv.contexts.set('mafia', 1);
        conv.contexts.set('StartGame-yes-followup', 1);

        break;
      case 'selectCivil':
        conv.contexts.set('civil', 1);
        conv.contexts.set('StartGame-yes-followup', 1);

        break;
    }

    suggestionList = conv.data.repeat.suggestion

    if (count === 1) {
      displayText = '제가 잘 모르는 캐릭터입니다. 아래의 칩을 보고 눌러보시는 건 어떨까요? ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 혹시 잘 안되시나요? 음성인식이 잘 안된다면 칩을 누르시거나 텍스트 모드로 해보시는게 좋을수도 있습니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
      speechText = displayText;
    }

    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestionList));
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

  if (count < 3 && conv.data.repeat.flow != 'selectMafia') {

    suggestionList = conv.data.repeat.data.suggestion;

    if (count === 1) {
      displayText = '제가 잘 모르는 명령어입니다. 아래의 칩이 도움이될 수 있습니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 혹시 잘 안되시나요? 설명서 라고 말하시면 도움말이 나옵니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
      speechText = displayText;
    }
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestionList));
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

  if (count > 2) {
    displayText = '정말로 죄송합니다. 제가 잘 모르는 회사이거나 인식이 실패했습니다. 앱을 종료하겠습니다. ';
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

  let displayText = '안녕하세요! 모두의 마피아 입니다. 이 게임은 안남시에 잠입하여 도시를 점령하는 게임입니다. 게임중이시라면 시민의 이름을 맞추어서 살아남으면 됩니다. ';
  let soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/25.ogg';
  let speechText = "<speak><par>" +
    '<media><speak>' + displayText + "</speak></media>" +
    '<media fadeInDur="1s" fadeOutDur="1s" end = "11s" soundLevel="-2.28dB"><audio src="' + soundLink + '"/></media>' +
    '</par></speak>';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '설명서';
  let subtitle = ''

  let lastConv = '다음 질문을 해 주세요.';
  let flow = 'help';
  let convResponse = 'original'
  let suggestionList = conv.data.repeat.data.suggestion; //이전 chip을 부른다


  //이전 재생을 위한 arrays
  let convArray = conv.data.repeat;

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
      'suggestion': suggestionList
    }
  }
  conv.data.repeat = convJson;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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



// REPEAT
app.intent(REPEAT, (conv) => {
  console.log("REPEAT");
  conv.data.fallbackCount = 0;

  let convArray = conv.data.repeat;

  let displayText = convArray.data.displayText;
  let speechText = convArray.data.speechText;
  let imageLink = convArray.data.imageLink;

  let text = convArray.data.text;
  let title = convArray.data.title;
  let subtitle = convArray.data.subtitle;
  let lastConv = convArray.data.lastConv;
  let suggestionList = convArray.data.suggestion;

  let convResponse = convArray.convResponse;
  let flow = convArray.flow;

  speechText = displayText;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
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

//EXIT
app.intent(EXIT, (conv) => {
  console.log("EXIT");
  conv.data.fallbackCount = 0;
  let displayText = '앱을 종료합니다. 이용해 주셔서 감사합니다냥!';
  let soundLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/blade_runner.ogg';
  let speechText = "<speak><par>" +
    '<media><speak><break time="3s"/>' + displayText + "</speak></media>" +
    '<media fadeInDur="1s" fadeOutDur="3s" end = "10s"><audio src="' + soundLink + '"/></media>' +
    '</par></speak>';

  // let text
  let name = '끝내기';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/bye.jpg';

  let text = '';
  let title = '모두의 마피아 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '';
  let flow = 'end';


  //ask
  conv.close(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
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
exports.mafiaGame = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
