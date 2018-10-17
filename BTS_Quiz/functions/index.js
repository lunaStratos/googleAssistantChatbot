'use strict';

// npm install
// V2 need 2.0.1 version, So plase make package.json => "actions-on-google": "^2.0.1"
// https://www.npmjs.com/package/actions-on-google
// https://www.npmjs.com/package/firebase-functions?activeTab=readme

// 효과음
// https://www.youtube.com/watch?v=XPzV85QWFZ0
// https://www.youtube.com/watch?v=4TvQydvkGDk
// https://www.youtube.com/watch?v=DVVqrE143N4
// https://www.youtube.com/watch?v=worclOeTALw

const {
  dialogflow,
  Suggestions,
  SimpleResponse,
  BasicCard,
  Image,
  Button
} = require('actions-on-google');
const functions = require('firebase-functions');

// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const WELCOME_INTENT_YES = 'Default Welcome Intent - yes';

const GAME = 'game';

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const HELP = 'help';
const EXIT = 'exit';


//for chip

let endText = " 다음 질문을 해 주세요.";

//젠카이노 러브라이브 문제집
//폰트: https://lovelive.kr/xe/freeboard/388492
let arrays = [{
  number: 1,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "신인왕 방탄소년단에서 방탄소년단이 길거리 공연을 했던 공원은? 1번 파고다공원, 2번 학동공원, 3번 올림픽공원.",
  answer: 2,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "호르몬전쟁 할로윈버전에서 뷔가 코스프레 했던 캐릭터는?   1번 조커, 2번 배트맨, 3번 스파이더맨.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "아메리칸 허슬라이프 5화에서 가위바위보를 해서 양파를 먹지 않은 멤버는?  1번 슈가, 2번 정국, 3번 제이홉.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 방탄소년단의 고향이 아닌 것은?  1번 강릉, 2번 전주, 3번 합천.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 정국의 고등학교는?   1번 한림연예예술고등학교, 2번 서울공연예술고등학교, 3번 서울예술고등학교.",
  answer: 2,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "2016년 8월 29일 아육대에서 방탄소년단이 아미를 위한 점심 메뉴로 준비한 것은?   1번 버거킹, 2번 맥도날드, 3번 롯데리아.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "더쇼 방탄소년단 60초 인터뷰에서 제이홉의 얼굴 길이 측정 결과는?   1번 27cm, 2번 30cm, 25cm.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "방탄밤에서 제이홉이 예쁘게 먹은 타르트는? 1번 에그타르트, 2번 자몽타르트, 3번 레몬치즈타르트.",
  answer: 2,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "피땀눈물 뮤직비디오속 뷔의 머리 색은?   1번 빨간색, 2번 갈색, 3번 금발.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "상남자 더쇼 60초인터뷰때 매니저의 말을 가장 듣지 않는 멤버로 슈가가 뽑혔다. 이유가 아닌것은?  1번 연습을 안해서, 2번 대들어서, 3번 약속시간을 잘 안지켜서.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 지민의 별명은?  1번 고양이, 2번 메타몽, 3번 망개떡.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "	다음 중 피땀눈물 뮤직비디오에서 랩몬스터의 나레이션 앞부분은?   1번 You can do it, 2번 I'm your man, 3번 he too was a tempter.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 뷔의 반려견 이름은?  1번 영심, 2번 뾰룡, 3번 순심.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 방탄소년단 첫콘서트 [BTS 2014 LIVE TRILOGY : EPISODE Ⅱ. THE RED BULLET]의 오프닝곡은?  1번 N.O, 2번 Y.E.S, 3번 M.I.D.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 방탄소년단 팬클럽 이름은? 1번 A.R.M.Y, 2번 G.U.N.D.E.A, 3번 B.T.S.I.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "지민이 오디션때 부른 노래는? 1번 오리날다, 2번 하늘을 달리다, 3번 애인있어요.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 랩몬스터의 태몽은?  1번 할머니가 고추밭에서 뱀이 발목 뒤를 꽉 물었다, 2번 큰 까마기가 알을 감싸다, 3번 거꾸로 내리는 비속에 아이가 걸어왔다.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "다음 중 진이 다녀온 정글은? 1번 미얀마, 2번 아마존, 3번 코타 마나도.",
  answer: 3,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "방탄소년단 2015 BTS Live 화양연화 On Stage DVD DISC 1의 첫번째 무대는?  1번 올림픽 경기장, 2번 House of Cards, 3번 고덕 돔",
  answer: 2,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "2015년 12월 31일 방탄소년단의 Perfect man 무대에서 [혹시 너 기억속에 내가 아주 덤덤하게 느껴질때] 라는 파트를 부른 멤버는? 1번 지민, 2번 제이홉, 3번 RM.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}, {
  number: 2,
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/quiz_pannel.jpg",
  question: "2014년 6월 27일 뮤직뱅크에서 something 무대에선 단한명의 멤버만이 반바지를 입었는데 이 멤버는 누구일까  1번 뷔, 2번 진, 3번 정국.",
  answer: 1,
  title: "문제",
  insertText: "",
  suggestions: ['1번', '2번', '3번'],
  etc: ''
}];

//Shuffle mascine
function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }

  return a;
}
//app name
//다른 앱으로 교체시 이 부분을 교체한다.
let appName = '방탄소년단 퀴즈';
let appTitle = '방탄소년단';

// Welcome intent.
// V2, It use intent name, not action name.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;
  conv.data.flow = 'start';
  // conv is json data.
  console.log("conv: " + JSON.stringify(conv));
  // if you want use to action name, use below code. : conv.action
  console.log("action: " + JSON.stringify(conv.action));



  // let TTS Area
  let displayText = '';
  let speechText = '';
  // response area
  let number = 0;
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/BTS/bts-logo-C697D558F3-seeklogo.com.png';
  let question = '';
  let answer = '';
  let title = "환영합니다.";
  let insertText = appName + '앱에 오신것을 환영합니다.';
  let suggestions = ['메뉴얼', '게임시작', '끝내기'];
  let etc = '';
  let flow = 'start';
  //Shuffle & array
  let arrayNumber = 0;
  let shuffleArray = shuffle(arrays);
  console.log(shuffleArray);
  //Correct
  let correct = 0;


  //welcome Sound
  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/baseball_sound_fx.mp3";

  //revisit or new visit
  if (conv.user.last.seen) { //방문한 적이 있다면
    displayText = "다시 " + appName + "에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠? 바로 시작하죠. 게임시작을 하려면 '게임시작'을 말해주세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "9s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  } else {
    displayText = appName + "에 오신것을 환영합니다. 이 앱은 " + appTitle + "에 대한 퀴즈를 하는 앱입니다. 게임은 1번부터 3번까지 주어지며 이를 번호로 맞추면 됩니다. 게임시작은 '게임시작'을, 끝내기는 언제든 '종료' 라고 말해주세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="2s" end = "13s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }


  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;

  conv.data.number = number;
  conv.data.imageLink = imageLink;
  conv.data.question = question;
  conv.data.answer = answer;
  conv.data.title = title;
  conv.data.insertText = insertText;
  conv.data.suggestions = suggestions;
  conv.data.etc = etc;


  //현재 array와 번호를 저장
  conv.data.arrayNumber = arrayNumber;
  conv.data.shuffleArray = shuffleArray;
  //Correct 정답여부
  conv.data.correct = correct;

  let previousArray = [];
  //이전 재생을 위한 arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'number': number,
    'imageLink': imageLink,
    'question': question,
    'answer': answer,
    'title': title,
    'insertText': insertText,
    'suggestions': suggestions,
    'etc': etc,
    'arrayNumber': arrayNumber,
    'shuffleArray': shuffleArray,
    'correct': correct,
    'flow': flow
  }
  previousArray.push(previousJson);
  conv.data.previous = previousArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: insertText,
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));

});

//WELCOME_INTENT_YES
app.intent(WELCOME_INTENT_YES, (conv) => {
  console.log("WELCOME_INTENT_YES");
  conv.data.fallbackCount = 0;
  conv.data.flow = 'yes';
  // let TTS Area
  let displayText = '';
  let speechText = '';
  // response area
  let number = 0;
  let imageLink = '';
  let question = '';
  let answer = '';
  let title = '';
  let insertText = '';
  let suggestions = '';
  let etc = '';
  let flow = 'yes';
  //Array
  let arrayNumber = 0;
  let shuffleArray = shuffle(arrays);
  let correct = 0;
  console.log("arrayNumber: " + arrayNumber);
  console.log(JSON.stringify(shuffleArray));


  let soundNext = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/game_on_start.mp3';

  //shuffle array call
  number = shuffleArray[arrayNumber].number;
  imageLink = shuffleArray[arrayNumber].imageLink;
  question = shuffleArray[arrayNumber].question;
  answer = shuffleArray[arrayNumber].answer;
  title = shuffleArray[arrayNumber].title;
  insertText = shuffleArray[arrayNumber].insertText;
  suggestions = shuffleArray[arrayNumber].suggestions;
  etc = shuffleArray[arrayNumber].etc;

  //text make
  displayText = question + " 다음의 정답은?";
  //tts some different. Because it has ssml
  speechText = "<speak><seq>" +
    '<media><speak>' + "자 그럼 문제입니다." + '</speak></media>' +
    '<media><audio src="' + soundNext + '"/></media>' +
    '<media><speak>' + displayText + '"</speak></media>' +
    '</seq></speak>';
  displayText = "자 그럼 문제입니다. " + displayText;
  console.log("displayText : " + displayText);

  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;

  conv.data.number = number;
  conv.data.imageLink = imageLink;
  conv.data.question = question;
  conv.data.answer = answer;
  conv.data.title = title;
  conv.data.insertText = insertText;
  conv.data.suggestions = suggestions;
  conv.data.etc = etc;

  //현재 array와 번호를 저장
  conv.data.arrayNumber = arrayNumber;
  //Correct 정답여부
  conv.data.correct = correct;
  conv.data.shuffleArray = shuffleArray;

  let previousArray = conv.data.previous;
  //previous arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'number': number,
    'imageLink': imageLink,
    'question': question,
    'answer': answer,
    'title': title,
    'insertText': insertText,
    'suggestions': suggestions,
    'etc': etc,
    'arrayNumber': arrayNumber,
    'correct': correct,
    'flow': flow
  }
  previousArray.push(previousJson);
  conv.data.previous = previousArray;



  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: insertText,
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
});


//GAME Intent
// 게임을 하는 곳
// 주로 사용되는 기술은 정규표현식으로 인보케이션에서 말한 언어중 정답을 체크한다.
// 받은 언어를 우선 체크를 하고, 정답이 없으면 단어를 스페이스 없이 압축
// 압축된 언어를 정답과 비교하여 있으면 정답으로 처리
// 없으면 정답이 아닌 것으로 처리한다.
app.intent(GAME, (conv) => {
  console.log("GAME");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]
  const say = conv.parameters["number"];
  console.log("say data: " + say);

  // let TTS Area
  let displayText = '';
  let speechText = '';
  // response area
  let number = 0;
  let imageLink = '';
  let question = '';
  let answer = '';
  let title = '';
  let insertText = '';
  let suggestions = '';
  let etc = '';
  let flow = '';
  //Array
  let arrayNumber = conv.data.arrayNumber + 1;
  let shuffleArray = conv.data.shuffleArray;
  //Correct
  let correct = conv.data.correct;

  console.log(JSON.stringify(shuffleArray));

  console.log("arrayNumber : " + arrayNumber)
  console.log("shuffleArray.length : " + shuffleArray.length);
  answer = conv.data.answer;
  console.log("answer: " + answer);

  // 정답확인
  let atari = "";

  let soundFxDJ = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/djSound.mp3';
  let soundFxFail = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/fail%20Sound.mp3';
  let soundFxCorrect = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/correct_soundfx.mp3';
  let soundAtari = '';

  let soundNext = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/game_on_start.mp3';

  if (parseInt(say) == answer) {
    atari = "정답입니다. ";
    correct++; // 정답시 1+
    soundAtari = soundFxCorrect;
    //imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/o.png';
  } else if (parseInt(say) > 3) {
    atari = "1번 2번 3번으로 말해야 하는데... 틀렸습니다. 정답은 " + answer + "번 이었습니다. ";
    soundAtari = soundFxFail;
    //imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/x.jpg';
  } else if (parseInt(say) != answer) {
    atari = "틀렸습니다. 정답은 " + answer + "번 이었습니다. ";
    soundAtari = soundFxFail;
    //imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/x.jpg';
  }

  // 종료하기
  // 게임은 총 5번 한다.
  if (arrayNumber == 5) {
    //text make

    //shuffle array call
    number = 0;
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/lovelive/gameover.jpg";
    question = "";
    title = "게임이 끝났습니다.";
    insertText = "게임이 모두 끝났습니다. 총 점수는 " + correct + "입니다.";
    suggestions = ['메뉴얼', '게임시작', '끝내기'];
    etc = "";

    displayText = atari + " 5번 게임중 " + correct + "번 맞추었습니다. 당신도 이제 휼룡한 ARMY! 다시 게임을 할려면 '게임시작'을 말하면 됩니다. '끝내기'를 말하면 앱이 종료됩니다.";
    //tts some different. Because it has ssml
    speechText = "<speak><seq>" +
      '<media><speak>' + say + "번을 말하셨습니다. 정답은" + '</speak></media>' +
      '<media><audio src="' + soundFxDJ + '"/></media>' +
      '<media><audio src="' + soundAtari + '"/></media>' +
      '<media><speak>' + displayText + '"</speak></media>' +
      '</seq></speak>';
    displayText = say + "번을 말하셨습니다. 정답은 (재생중) " + displayText;

    console.log("displayText : " + displayText);
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);
    conv.data.flow = 'gameend';
    flow = 'gameend';
  } else { //게임진행
    //shuffle array call
    number = shuffleArray[arrayNumber].number;
    imageLink = shuffleArray[arrayNumber].imageLink;
    question = shuffleArray[arrayNumber].question;
    title = shuffleArray[arrayNumber].title;
    insertText = shuffleArray[arrayNumber].insertText;
    suggestions = shuffleArray[arrayNumber].suggestions;
    answer = shuffleArray[arrayNumber].answer;

    etc = shuffleArray[arrayNumber].etc;
    //text make
    displayText = atari + " 그럼 다음 문제 입니다. ";
    //tts some different. Because it has ssml
    speechText = "<speak><seq>" +
      '<media><speak>' + say + "번을 말하셨습니다. 정답은" + '</speak></media>' +
      '<media><audio src="' + soundFxDJ + '"/></media>' +
      '<media><audio src="' + soundAtari + '"/></media>' +
      '<media><speak>' + displayText + '"</speak></media>' +
      '<media><audio src="' + soundNext + '"/></media>' +
      '<media><speak>' + question + '"</speak></media>' +
      '</seq></speak>';
    displayText = say + "번을 말하셨습니다. 정답은 (재생중) " + displayText + question + "";

    console.log("displayText : " + displayText);
    conv.contexts.set("gameflow", 1);
    conv.data.flow = 'gaming';
    flow = 'gaming';
  }


  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;

  conv.data.number = number;
  conv.data.imageLink = imageLink;
  conv.data.question = question;
  conv.data.answer = answer;
  conv.data.title = title;
  conv.data.insertText = insertText;
  conv.data.suggestions = suggestions;
  conv.data.etc = etc;


  //현재 array와 번호를 저장
  conv.data.arrayNumber = arrayNumber;
  //Correct 정답여부
  conv.data.correct = correct;

  let previousArray = conv.data.previous;

  //previous arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'number': number,
    'imageLink': imageLink,
    'question': question,
    'answer': answer,
    'title': title,
    'insertText': insertText,
    'suggestions': suggestions,
    'etc': etc,
    'arrayNumber': arrayNumber,
    'correct': correct,
    'flow': flow
  }
  previousArray.push(previousJson);
  conv.data.previous = previousArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: insertText,
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
});


// =======================================================================

// FALLBACK
app.intent(FALLBACK, (conv) => {
  console.log("FALLBACK");
  // let text
  // let TTS Area
  let displayText = '죄송합니다. 선택되지 않은 답입니다.';
  let speechText = '';
  // response area
  let number = 0;
  let imageLink = '';
  let question = '';
  let answer = '';
  let title = '';
  let insertText = '';
  let suggestions = ['메뉴얼', '게임시작', '끝내기'];
  let etc = '';
  let flow = '';


  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;
  console.log("conv.data.flow: " + conv.data.flow)
  console.log("contexts: " + JSON.stringify(conv.contexts.get("gameflow")))
  if (conv.data.flow == 'gameend' || conv.data.flow == 'start') {
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);

  } else if (conv.data.flow == 'gaming' || conv.data.flow == 'yes') {
    conv.contexts.set("gameflow", 1)
    suggestions = ['1번', '2번', '3번', '끝내기'];
  } else if (conv.data.flow == 'help' && conv.contexts.get("gameflow") != undefined) {
    //게임중
    suggestions = ['1번', '2번', '3번', '끝내기'];
    conv.contexts.set("gameflow", 1)
  } else if (conv.data.flow == 'help' && conv.contexts.get("gameflow") == undefined) {
    //게임중
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);
  }


  if (count === 1) {
    displayText = '제가 잘 모르는 명령어 입니다. 게임중 이라면 1번 2번 3번 이렇게 말해주세요. 게임중이 아니라면 "도움말"을 참조해 보세요. 다시 말해주세요.';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
    speechText = displayText;
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: insertText,
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } else if (count === 2) {
    displayText = '죄송합니다. 게임중인가요? 1번 2번 3번 이렇게 말해주세요. 정 힘들다면 아래 있는 버튼을 눌러서 답해주세요. 자 다시 말해주세요.';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
    speechText = displayText;
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: insertText,
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } else if (count > 2) {
    displayText = '정말로 죄송합니다. 인식이 실패했습니다. 앱을 종료하겠습니다. ';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png";
    speechText = displayText;
    //ask
    conv.close(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.close(new BasicCard({
      text: insertText,
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } // if

}); // intent


// HELP
app.intent(HELP, (conv) => {

  // let TTS Area
  let displayText = appName + '는 퀴즈를 맞추는 게임입니다. 앱의 설명에 나오는 1번 2번 3번 으로 말하면 그에 맞는 답을 선택할 수 있습니다.' + endText;
  let speechText = '';
  // response area
  let number = 0;
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let question = '';
  let answer = '';
  let title = "";
  let insertText = '';
  let suggestions = ['메뉴얼', '게임시작', '끝내기'];
  let etc = '';
  let correct = 0;
  let flow = 'help';
  let arrayNumber = 0;

  console.log("HELP");
  conv.data.fallbackCount = 0;
  console.log("conv.data.flow : " + conv.data.flow)
  console.log("gameflow :" + conv.contexts.get("gameflow"));
  if (conv.data.flow == 'gameend' || conv.data.flow == 'start') {
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);
  } else if (conv.data.flow == 'gaming' || conv.data.flow == 'yes') {
    conv.contexts.set("gameflow", 1)
    suggestions = ['1번', '2번', '3번', "끝내기"];
  } else if (conv.data.flow == 'help' && conv.contexts.get("gameflow") == undefined) {
    //게임시작전 
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);
  }


  speechText = displayText;

  if (conv.data.flow == 'yes') {
    flow = 'yes'
  } else if (conv.data.flow == 'gaming') {
    flow = 'gaming'
  } else if (conv.data.flow == 'start') {
    flow = 'start'
  } else if (conv.data.flow == 'gameend') {
    flow = 'gameend'
  }

  //save data : for previous and repeat

  conv.data.number = number;
  conv.data.imageLink = imageLink;
  conv.data.question = question;
  conv.data.answer = answer;
  conv.data.title = title;
  conv.data.insertText = insertText;
  conv.data.suggestions = suggestions;
  conv.data.etc = etc;
  conv.data.flow = flow; // help
  conv.data.correct = correct;


  let previousArray = conv.data.previous;

  //previous arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'number': number,
    'imageLink': imageLink,
    'question': question,
    'answer': answer,
    'title': title,
    'insertText': insertText,
    'suggestions': suggestions,
    'etc': etc,
    'arrayNumber': arrayNumber,
    'correct': correct,
    'flow': flow
  }
  previousArray.push(previousJson);
  conv.data.previous = previousArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: insertText,
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
});

// PREVIOUS
app.intent(PREVIOUS, (conv) => {
  console.log("PREVIOUS");
  conv.data.fallbackCount = 0;

  let previousArray = conv.data.previous;
  let previousState = previousArray.length - 1;

  console.log(JSON.stringify(previousArray));
  console.log(previousState);

  let displayText = previousArray[previousState].displayText;
  let speechText = previousArray[previousState].speechText;

  // response area
  let number = previousArray[previousState].number;
  let imageLink = previousArray[previousState].imageLink;
  let question = previousArray[previousState].question;
  let answer = previousArray[previousState].answer;
  let title = previousArray[previousState].title;
  let insertText = previousArray[previousState].insertText;
  let suggestions = previousArray[previousState].suggestions;
  let etc = previousArray[previousState].etc;
  let arrayNumber = previousArray[previousState].arrayNumber;
  let correct = previousArray[previousState].correct;
  let flow = previousArray[previousState].flow;


  if (previousState == 0) { // 처음이라면
    //save data : for previous and repeat
    conv.data.number = number;
    conv.data.imageLink = imageLink;
    conv.data.question = question;
    conv.data.answer = answer;
    conv.data.title = title;
    conv.data.insertText = insertText;
    conv.data.suggestions = suggestions;
    conv.data.etc = etc;
    conv.data.flow = 'start';

    conv.data.arrayNumber = arrayNumber;
    conv.data.correct = correct;
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);

  } else { // 처음이 아니라면

    //마지막 array제거 후 저장하기
    previousArray.pop();
    //제거된 array의 -1인 길이를 가져와야 한다.
    //-1을 안하면 방금 말한 데이터를 가져오기 때문.
    previousState = previousArray.length - 1;
    console.log(JSON.stringify(previousArray));
    console.log(previousState);

    displayText = previousArray[previousState].displayText;
    speechText = previousArray[previousState].speechText;

    // response area
    number = previousArray[previousState].number;
    imageLink = previousArray[previousState].imageLink;
    question = previousArray[previousState].question;
    answer = previousArray[previousState].answer;
    title = previousArray[previousState].title;
    insertText = previousArray[previousState].insertText;
    suggestions = previousArray[previousState].suggestions;
    etc = previousArray[previousState].etc;
    arrayNumber = previousArray[previousState].arrayNumber;
    correct = previousArray[previousState].correct;
    flow = previousArray[previousState].flow;
    //Array save
    conv.data.previous = previousArray;

    //conv data save.
    conv.data.number = number;
    conv.data.imageLink = imageLink;
    conv.data.question = question;
    conv.data.answer = answer;
    conv.data.title = title;
    conv.data.insertText = insertText;
    conv.data.suggestions = suggestions;
    conv.data.etc = etc;
    conv.data.flow = flow;
    console.log(flow)
    if (conv.data.flow == 'gameend' || conv.data.flow == 'start') {
      conv.contexts.set("DefaultWelcomeIntent-followup", 1);
      console.log("gameend or start DefaultWelcomeIntent-followup")
    } else if (conv.data.flow == 'gaming' || conv.data.flow == 'yes') {
      conv.contexts.set("gameflow", 1)
    } else {

    }
    //현재 array와 번호를 저장
    conv.data.arrayNumber = arrayNumber;
    //Correct 정답여부
    conv.data.correct = correct;

  }


  if (conv.data.flow == 'gameend' || conv.data.flow == 'start') {
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);
    console.log("gameend or start DefaultWelcomeIntent-followup")
  } else if (conv.data.flow == 'gaming' || conv.data.flow == 'yes') {
    conv.contexts.set("gameflow", 1)
  } else {

  }

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: insertText,
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));



});

// REPEAT
app.intent(REPEAT, (conv) => {
  console.log("REPEAT");
  conv.data.fallbackCount = 0;

  let displayText = conv.data.displayText;
  let speechText = conv.data.speechText;

  // let text
  let number = conv.data.number;
  let imageLink = conv.data.imageLink;
  let question = conv.data.question;
  let answer = conv.data.answer;
  let title = conv.data.title;
  let insertText = conv.data.insertText;
  let suggestions = conv.data.suggestions;
  let etc = conv.data.etc;
  let flow = conv.data.flow;

  console.log("gameflow" + conv.contexts.get("gameflow"));
  console.log("DefaultWelcomeIntent" + conv.contexts.get("DefaultWelcomeIntent-followup"));
  console.log("flow " + flow);
  // if (conv.contexts.get("gameflow") !== undefined) {
  //   conv.contexts.set("gameflow", 1);
  // } else if (conv.contexts.get("DefaultWelcomeIntent-followup") !== undefined) {
  //
  // }

  if (conv.data.flow == 'gameend' || conv.data.flow == 'start') {
    conv.contexts.set("DefaultWelcomeIntent-followup", 1);
  } else if (conv.data.flow == 'gaming' || conv.data.flow == 'yes') {
    conv.contexts.set("gameflow", 1)
  } else {

  }

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: insertText,
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));

});

//EXIT
app.intent(EXIT, (conv) => {
  console.log("EXIT");
  conv.data.fallbackCount = 0;
  let displayText = '앱을 종료합니다. 이용해 주셔서 감사합니다.';
  let speechText = '';

  // let text
  let name = '끝내기';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png';
  let insertText = '앱을 종료합니다.';
  let title = "끝내기";

  speechText = displayText;

  //ask
  conv.close(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }), new BasicCard({
    text: insertText,
    subtitle: '',
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
exports.bts_quiz = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
