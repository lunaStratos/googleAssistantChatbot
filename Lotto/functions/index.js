'use strict';

const {
  dialogflow,
  Suggestions,
  SimpleResponse,
  BasicCard,
  Image,
  Button,
  List,
  Confirmation,
  Permission,
  LinkOutSuggestion,
  MediaObject
} = require('actions-on-google');
const functions = require('firebase-functions');
const request = require('request');
const cheerio = require('cheerio');
const Promise = require('promise');
const iconvlite = require('iconv-lite');
// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const LOTTOGENERATOR_INTENT = 'intent.lottogenerator';
const NOWLOTTO_INTENT = 'intent.nowlotto';
const BEFORELOTTO_INTENT = 'intent.beforelotto';

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const SUPPPORT_COMMAND = 'intent.support';
const HELP = 'intent.help'; // 도움말
const EXIT = 'intent.exit'; // 종료
const NOINPUT = 'intent.noinput'; // 구글 홈 말 없음

//앱 타이 (전역으로 사용)
const appTitle = '로또마스터'; //앱 타이틀을 설정

//for chip
let suggestionList = ["도움말", "끝내기", '이번주 로또번호', '283회 로또번호']; //칩은 8개까지 생성가능

function shuffle(array) {
  var i = 0,
    j = 0,
    temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array;
}


// 랜덤 칩 메이커 (array[] 가 들어가면 8개의 칩이 생성 )
function chipMaker_shuffle(arrays) {
  var i = 0,
    j = 0,
    temp = null

  for (i = arrays.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = arrays[i]
    arrays[i] = arrays[j]
    arrays[j] = temp
  }
  //Array 만들기
  let newArray = ['도움말', '끝내기'];
  for (let k = 2; k < 7; k++) {
    newArray[k] = arrays[k];
  }
  return newArray;
} // chipMaker_shuffle

// 콤마 찍기 => 화폐나 사람 수
// 숫자가 들어오면 String
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} //numberWithCommas

//로또 서버, 회차와 현재회차는 0으로 , 다른회차는 0이 아닌 숫자로 구분한다
function getLottoJson(num, callback) {
  let url = '';

  if (num != 0) { //num의 숫자를 이용해서 현재회차인지, 이전회차인지 구별합니다.
    url = "http://www.nlotto.co.kr/common.do?method=getLottoNumber&drwNo=" + num;
  } else { // 최신 회차는 크롤링을 통해서 구현
    url = 'https://www.nlotto.co.kr/gameResult.do?method=byWin'
  } // if

  //request를 이용하여 api요청, 혹은 웹 페이지를 요청합니다
  request({
    url: url,
    encoding: null,
    rejectUnauthorized: false, //Error: Hostname/IP doesn't match certificate's altnames:
    requestCert: false, //add when working with https sites
    agent: false, //add when working with https sites
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    }
  }, function(err, resp, body) {
    if (err) {
      callback(err, {
        'returnValue': 'fail'
      });
      return;
    }

    if (num != 0) {
      const original = JSON.parse(body.toString());
      callback(null, original);
    } else {
      const original = iconvlite.decode(body, 'EUC-KR'); // json으로 변환
      const $ = cheerio.load(iconvlite.decode(body, 'EUC-KR'));
      let tempJson = {};

      //로또 회차
      tempJson.drwNo = $(".win_result h4 strong").text();
      //로또 날짜
      let dateCall = $(".win_result p.desc ").text().replace('추첨', '').replace('(', '').replace(')', '')
      let convertDate = dateCall.replace('년 ', '-').replace('월 ', '-').replace('일 ', '')
      tempJson.drwNoDate = convertDate;

      //로또 당첨 액수와 수
      $(".tbl_data.tbl_data_col tbody tr").each(function(index) {
        if (index == 0) {
          $(this).find('td').each(function(index2) {
            if (index2 == 1) { // 등위별 총 당첨금액
              tempJson.firstAccumamnt = $(this).text().replace('원', '').replace(/,/g, '');
            } else if (index2 == 2) { // 당첨게임 수
              tempJson.firstPrzwnerCo = $(this).text()
            } else if (index2 == 3) { // 1게임당 당첨금액
              tempJson.firstWinamnt = $(this).text().replace('원', '').replace(/,/g, '');
            } else if (index2 == 5) { // 1게임당 당첨금액
              tempJson.firstHowTo = $(this).text().replace('1등', '').replace('원', '').replace(/\n/g, '').trim().replace(/\t/g, '');
            }
          });
        }
      });
      //로또번호와 보너스 번호 추출
      $(".win_result div.nums div.num p span").each(function(index) {
        if (index == 6) { //보너스 번호 추출
          tempJson.bnusNo = $(this).text()
        } else { // 보너스 번호 아닌거 추출
          //로또번호 api와 동일하게 이름을 만듭니다. drwtNo + 번호 식
          tempJson['drwtNo' + (index + 1)] = $(this).text();
        }
      })

      //성공여부
      tempJson.returnValue = "success";
      callback(null, tempJson);
    }

  });

} // getLottoJson

//Promise
const asyncTask = (insertData) => new Promise(function(resolved, rejected) {
  getLottoJson(insertData, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});

//로또번호 생성
function lottoNumberGenerator(conv, jsonLang) {
  conv.data.fallbackCount = 0;
  console.log('jsonLang: ', jsonLang)

  let displayText = '';
  let speechText = '';
  let sayImage;
  let chip;
  let sayTitle;

  if (jsonLang == "ko-KR") {

    var myArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

    // 6개만 가져올 것
    var getArrays = [1, 2, 3, 4, 5, 6];
    var resultArray = shuffle(myArray);

    for (var i = 0; i < 6; i++) {
      getArrays[i] = resultArray[i];
    }

    getArrays.sort(function(a, b) {
      return a - b
    }); // 사용자 경험을 위한 정렬

    // 텍스트 출력 (SSML 위해서 별도 분리)
    displayText = "안녕하세요. 로또번호 생성기 앱입니다. 우선 나눔로또번호를 생성하겠습니다. " +
      getArrays[0] +
      " " +
      getArrays[1] +
      " " +
      getArrays[2] +
      " " +
      getArrays[3] +
      " " +
      getArrays[4] +
      " " +
      getArrays[5] +
      " 입니다. 다음 질문을 해 주세요.";

    // SSML 출력 (SSML 위해서 별도 분리)
    speechText = "<speak>안녕하세요. 로또번호 생성기 앱입니다. 우선 나눔로또번호를 생성하겠습니다. " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays[0] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays[1] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays[2] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays[3] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays[4] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays[5] +
      "</say-as></speak> " +
      " 입니다. 다음 질문을 해 주세요.</speak>";

    sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/lotto.jpg';
    sayTitle = '로또번호 생성하기';



  } else if (jsonLang == "ja-JP") {

    // Lotto7: 1~37 번호 저장
    var myArray7 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];
    // Lotto7: 1~43 번호 저장
    var myArray6 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43];

    // Lotto7 : 7개만 가져올 것
    // Lotto6 : 6개만 가져올 것
    var getArrays7 = [1, 2, 3, 4, 5, 6, 7];
    var getArrays6 = [1, 2, 3, 4, 5, 6];
    var resultArray6 = shuffle(myArray6);
    var resultArray7 = shuffle(myArray7);

    // lotto7
    for (var i = 0; i < 7; i++) {
      getArrays7[i] = resultArray7[i];
    }

    //lotto6
    for (var j = 0; j < 6; j++) {
      getArrays6[j] = resultArray6[j];
    }

    getArrays7.sort(function(a, b) {
      return a - b
    }); // 사용자 경험을 위한 정렬
    getArrays6.sort(function(a, b) {
      return a - b
    }); // 사용자 경험을 위한 정렬

    // 텍스트 출력 (SSML 위해서 별도 분리)
    displayText = "ロト7番号が生成されました。" +
      getArrays7[0] +
      " " +
      getArrays7[1] +
      " " +
      getArrays7[2] +
      " " +
      getArrays7[3] +
      " " +
      getArrays7[4] +
      " " +
      getArrays7[5] +
      " " +
      getArrays7[6] +
      " です。ロト6の番号は " +
      getArrays6[0] +
      " " +
      getArrays6[1] +
      " " +
      getArrays6[2] +
      " " +
      getArrays6[3] +
      " " +
      getArrays6[4] +
      " " +
      getArrays6[5] +
      " です。" +
      "それじゃ、また使ってください。バイバイ~";

    // SSML 출력 (SSML 위해서 별도 분리)
    speechText = "<speak>ロト7番号が生成されました。 " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[0] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[1] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[2] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[3] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[4] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[5] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays7[6] +
      "</say-as></speak> " +
      " です。ロト6の番号は " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays6[0] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays6[1] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays6[2] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays6[3] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays6[4] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays6[5] +
      "</say-as></speak> " +

      " です。それじゃ、また使ってください。バイバイ~</speak>";

  } else if (jsonLang.indexOf("en") == 0) { //en
    // powerball: 1~69 번호 저장
    var powerArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69];
    // powerball: 1~26 번호 저장
    var powerArray26 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

    // powerball: 5
    // powerball: 1
    var getArrays5 = [1, 2, 3, 4, 5];
    powerArray = shuffle(powerArray);
    powerArray26 = shuffle(powerArray26);

    // lotto7
    for (var i = 0; i < getArrays5.length; i++) {
      getArrays5[i] = powerArray[i];
    }

    getArrays5.sort(function(a, b) {
      return a - b
    }); // 사용자 경험을 위한 정렬

    // 텍스트 출력 (SSML 위해서 별도 분리)
    displayText = "Now, I have created powerball lotto numbers. Numbers are " +
      getArrays5[0] +
      " " +
      getArrays5[1] +
      " " +
      getArrays5[2] +
      " " +
      getArrays5[3] +
      " " +
      getArrays5[4] +
      ". And powerball number is " +
      powerArray26[0] +
      ". I wish you good luck. bye bye ";

    // SSML 출력 (SSML 위해서 별도 분리)
    speechText = "<speak>Now, I have created powerball lotto numbers. Numbers are " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays5[0] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays5[1] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays5[2] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays5[3] +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + getArrays5[4] +
      "</say-as></speak> " +
      ". And powerball number is " +
      '<speak> <say-as interpret-as="cardinal">' + powerArray26[0] +
      "</say-as></speak>. I wish you good luck. bye bye </speak>";


  } // lang end

  if (jsonLang == "ko-KR") {
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestionList));
    conv.ask(new BasicCard({
      text: '',
      subtitle: '',
      title: sayTitle,
      image: new Image({
        url: sayImage,
        alt: '이미지',
      }),
    }));

  } else {
    //ask
    conv.close(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
  }


} //function

// Welcome intent.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;
  lottoNumberGenerator(conv, conv.user.locale);

}); //welcome

app.intent(LOTTOGENERATOR_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;
  lottoNumberGenerator(conv, conv.user.locale);

}); //


//로또 분기 처리
function lottoResultData(conv, item) {
  
  let displayText ='';
  let speechText = '';

  if (item.returnValue == "fail") { // 서버접속 실패 혹은 200에러 등
    displayText = "아직 진행되지 않은 로또회차이거나 서버에러 등으로 서비스를 제공할 수 없었습니다. 다른 회차를 말해주세요.  ";
    speechText = displayText;
  } else { // 서버가 움직인다면
    let firstWinAmount = item.firstWinamnt; // 1등상 액수
    let firstPrizeHuman = item.firstPrzwnerCo; // 총 인원

    let rawDate = item.drwNoDate; // 당첨날짜

    //날짜 구하는 부분
    var dt = new Date(rawDate);
    let month = dt.getMonth() + 1;
    let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';
    let kai = item.drwNo; // 회차

    // 번호들, 보너스번호
    let number1 = item.drwtNo1;
    let number2 = item.drwtNo2;
    let number3 = item.drwtNo3;
    let number4 = item.drwtNo4;
    let number5 = item.drwtNo5;
    let number6 = item.drwtNo6;
    let bnusNo = item.bnusNo;
    let firstHowTo = '';

    let resultFirstPrize = numberWithCommas(firstWinAmount);

    if (item.firstHowTo != undefined) {
      firstHowTo = item.firstHowTo
      firstPrizeHuman = firstHowTo
    }

    displayText = dateText + "의 " + kai + " 회차 로또번호는 " +
      number1 +
      " " +
      number2 +
      " " +
      number3 +
      " " +
      number4 +
      " " +
      number5 +
      " " +
      number6 +
      " 보너스 번호는 " +
      bnusNo +
      " " +
      "입니다. 1등상은 " + firstPrizeHuman + "명이 당첨되었으며 액수는 1인당 " + resultFirstPrize + "원 입니다.";

    speechText = "<speak>" + dateText + "의 " + kai + "회차 로또번호는 " +
      '<speak> <say-as interpret-as="cardinal">' + number1 +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + number2 +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + number3 +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + number4 +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + number5 +
      "</say-as></speak> " +
      '<speak> <say-as interpret-as="cardinal">' + number6 +
      "</say-as></speak> " +
      " 보너스 번호는 " +
      bnusNo + "입니다. 1등상은 " + firstPrizeHuman + "명이 당첨되었으며 액수는 1인당 " + firstWinAmount + "원 입니다. </speak>";

  }

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: '',
    subtitle: '',
    title: '',
    image: new Image({
      url: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/lottoNow.jpg',
      alt: '이미지',
    }),
  }));
}

//NOWLOTTO_INTENT
app.intent(NOWLOTTO_INTENT, (conv) => {

  return asyncTask(0)
    .then(function(item) {
      //로그 확인용
      console.log("result : " + JSON.stringify(item));
      lottoResultData(conv, item);

    });

}); //

//BEFORELOTTO_INTENT
app.intent(BEFORELOTTO_INTENT, (conv) => {
  console.log(BEFORELOTTO_INTENT)
  conv.data.fallbackCount = 0;

  let getNum = conv.parameters['number'];
  if (getNum == undefined) {
    getNum = 0
  }
  console.log(getNum)
  //request
  return asyncTask(getNum)
    .then(function(item) {
      //로그 확인용
      console.log("result : " + JSON.stringify(item));
      lottoResultData(conv, item);

    });

}); //


// NOINPUT
app.intent(NOINPUT, (conv) => {
  console.log("NOINPUT");
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount < 3) {
    if (count === 1) {
      displayText = '저런, 말을 못하셨군요. 뭔가 말해주세요. ';
    } else if (count === 2) {
      displayText = '말할 타이밍을 놓치셨나요? 지금 바로 말해주세요. ';
    }

    conv.ask(displayText);
  } else if (count > 2) { // 3번 이상은 종료시킴
    displayText = '3번 아무 말도 하지 않으셨네요. 어쩔수 없죠. ' + appTitle + '을 종료합니다. ';
    conv.close(displayText);
  } //if 1

});

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
  let flow = 'fallback';
  let convResponse = 'original'

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count < 3) {

    if (count === 1) {
      displayText = '죄송합니다. 이해하지 못했습니다. 메뉴얼에 따른 방식으로 말을 해 주세요. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 이번에도 이해를 하지 못했습니다. 혹시 사용방법이 어려우신가요? 메뉴얼을 말해보세요. 도움이 되는 커맨드를 알려줍니다.';
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

  } else if (count > 2) { // 3번 이상은 종료시킴
    displayText = '죄송합니다. 더욱 발전시켜서 다시 오겠습니다. 앱을 종료합니다. ';
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

// SUPPPORT_COMMAND
app.intent(SUPPPORT_COMMAND, (conv) => {
  console.log("SUPPPORT_COMMAND");
  conv.data.fallbackCount = 0;
  // let text
  let displayText = '지원되는 메뉴는 다음과 같습니다. \n* 이번주 로또번호 \n* 238회차 로또번호같이 특정회차 로또번호 \n* 로또번호 생성해줘를 지원하고 있습니다.';
  let speechText = '지원되는 메뉴는 다음과 같습니다. 이번주 로또번호, 238회차 로또번호같이 특정회차 로또번호, 로또번호 생성해줘를 지원하고 있습니다.';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '';
  let subtitle = ''

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

}); //SUPPPORT_COMMAND


// HELP
app.intent(HELP, (conv) => {
  console.log("HELP");
  conv.data.fallbackCount = 0;

  let displayText = appTitle + '는 로또번호 생성과 현재회차 그리고 이전회차의 로또 당첨번호를 알 수 있습니다. 지원되는 명령어 라 하시면 커멘드도 알려드립니다. ';
  let speechText = '';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '설명서';
  let subtitle = ''

  let lastConv = '다음 질문을 해 주세요.';
  let flow = 'help';
  let convResponse = 'original'


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
  let speechText = '';

  // let text
  let name = '끝내기';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/exit.jpg';

  let text = '';
  let title = appTitle + '을 종료 합니다';
  let subtitle = ''
  let convResponse = 'original'
  let lastConv = '';
  let flow = 'end';
  speechText = displayText;

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


exports.lottonumbergenerator = functions.https.onRequest(app);
