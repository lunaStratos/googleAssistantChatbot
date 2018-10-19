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
const request = require('request')
const iconv = require('iconv-lite');

// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const MOVIES_INTENT = 'MovieDays';

//basic intent : for quality
const HELP = 'help';
const FALLBACK = 'Default Fallback Intent';
const EXIT = 'exit';
//앱 타이 (전역으로 사용)
const appTitle = '영화관 정보';

// 날짜로 칩 하나 만들어 줌 (1주일 전)
const d = new Date(new Date().getTime() - new Date(1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 9));
const makenowDate = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 영화정보';
//for chip
let suggestions = ["도움말", "끝내기", "저번주 일요일의 영화정보", makenowDate, "저번주 일요일의 한국 영화정보", "저번주 일요일의 독립 영화정보", "저번주 일요일의 외국 상업 영화정보"];

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
}

function requesetParsing(insertData, dayType, callback) {
  //insertData는 json으로 들어온다. insertData.movieName, insertData.date
  let url = ''; //URL
  let forms = {
    key: '서비스키 입력', // 서비스키
    targetDt: insertData.date
  }

  switch (dayType) {
    //사이트 자체 파싱
    //http://www.kobis.or.kr/kobisopenapi/homepg/apiservice/searchServiceInfo.do

    //주간은 전주 일요일까지를 기준으로 조회가 가능 (최종 일요일로 해주는 로직 짜야 함)
    case 'Day': //일별 조회
      url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json";
      forms = {}
      request({
        method: 'GET',
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        },
        timeout: 1000 * 30,
        qs: forms
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        let response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        let jsonData = iconv.decode(responseBody, response_encoding);

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });

      });

      break;

      //주간별 조회
    case 'Days':
      console.log('insertData.movieType ', insertData.movieType);
      console.log('insertData.movieNation ', insertData.nationType);
      url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json";
      forms.weekGb = 0; //기본값 월요일 부터 일요일까지로 고정
      if (insertData.movieType != undefined || insertData.movieType != null || insertData.movieType != '') {
        forms.multiMovieYn = insertData.movieType; // 영화타입 (보통은 상업으로) Y or N 기본은 default
      }
      if (insertData.nationType != undefined || insertData.nationType != null || insertData.nationType != '') {
        forms.repNationCd = insertData.nationType; //제조국가 K or F 기본은 default
      }
      console.log('forms: ', forms);

      request({
        method: 'GET',
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        },
        qs: forms
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        const html = responseBody.toString();
        //json받기
        const result = JSON.parse(html);
        console.log(result);
        const showRange = result.boxOfficeResult.showRange; //조회범위

        if (showRange == undefined) {
          //callback
          callback(null, {
            code: 200,
            result: 'fail'
          });

        } else {
          const tableRow = result.boxOfficeResult.weeklyBoxOfficeList; //영화 리스트 정보
          //callback
          callback(null, {
            code: 200,
            showRange: showRange,
            list: tableRow,
            result: 'success'
          });
        }




      });
      break;

  } // switch

} //function

//Promise
const asyncTask = (insertData, requestCase) => new Promise(function(resolved, rejected) {
  requesetParsing(insertData, requestCase, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});

// Welcome intent.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;

  //console.log("conv: " + JSON.stringify(conv));
  //console.log("action: " + JSON.stringify(conv.action));

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/movieApp/moiveSell.jpg';
  let text = appTitle + '에 오신걸 환영합니다.';
  let title = appTitle + ' 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let flow = 'welcome';
  let suggestionList = suggestions;

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";
  if (conv.user.last.seen) {

    displayText = "다시 " + appTitle + "에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠?";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "7s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';

  } else {
    let insertAppInfo = '현재 극장에 상영하고 있는 저번 주의 영화 순위와 판매지수 혹은 영화 리스트를 조회할 수 있습니다. 최종 저번주의 영화정보 까지만 집계되기 때문에 이번주의 월요일부터 일요일까지는 조회가 안될 수 있습니다. "메뉴얼"를 말하면 안내와 함께 지원가능한 회사를 안내합니다. 만약 종료하고 싶다면 "끝내기" 라고 말하시면 됩니다."';
    displayText = appTitle + " 에 오신 걸 환영합니다. " + appTitle + " 는 " + insertAppInfo;
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "13s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }

  let convArray = [];
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
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);

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


});

// 콤마 찍기 => 화폐나 사람 수
//숫자가 들어오면 String
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 영화 정보 처리 구역
app.intent(MOVIES_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  let dayType = conv.parameters['dayordays']; //주간 오늘 => 이걸로 api주소가 갈린다.
  let dateRaw = conv.parameters['date']; // 조회할 날짜 https://dialogflow.com/docs/reference/system-entities#date-ko-v2
  let nationType = conv.parameters['nation']; // 외국영화 한국영화 여부 (없으면 null ''  )
  let movieType = conv.parameters['movieType']; // 상업성여부 (없으면 null이나 '')

  //현재시간 받기
  let nowDate = new Date();

  var dayLabel = nowDate.getDay() //0 = 일요일
  if (dayLabel != 0) { //일요일이 아니라면
    nowDate = new Date(nowDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel + 9 * 60 * 60 * 1000);
  }

  // 0을 앞에 붙이면 3자리가 된다. 그리고 나서 1~2의 자리를 뽑는다.
  var dd = ('0' + nowDate.getDate()).slice(-2);
  var mm = ('0' + (nowDate.getMonth() + 1)).slice(-2); //January is 0!
  var yyyy = nowDate.getFullYear() + '';

  //검증 구역 나중에 주석처리
  console.log('nowDate: ', nowDate.toString());
  console.log('dateRaw: ', dateRaw);

  //빈 값이라면 현재 날짜로 처리하고 종료
  if (dateRaw == null || dateRaw == undefined || dateRaw == '') {
    dateRaw = yyyy + '-' + mm + '-' + dd;

  } else { // 날짜가 들어온다면 처리 시작
    const dateSplit = dateRaw.split('-'); //날자가 들어오면 Day의 경우 0~2미만 만 이용

    //들어온 데이터가 현재 날짜보다 작으면 그대로 이용
    let dateRawDate = new Date(dateRaw);

    dayLabel = dateRawDate.getDay(); //0 일요일
    if (dayLabel > 0) { //일요일이 아니라면
      dateRawDate = new Date(dateRawDate.getTime() - 1000 * 60 * 60 * 24 * dayLabel);
      dd = ('0' + dateRawDate.getDate()).slice(-2);
    }

    yyyy = dateSplit[0];
    mm = dateSplit[1];
    dd = dateSplit[2].substring(0, 2);

    //설정된 시간이 현재시간보다 큰 경우
    if (dateRawDate.getTime() > nowDate.getTime()) {
      console.log('들어온 데이터가 더 큼 ');
      console.log(parseInt(dateSplit[0]));
      console.log(nowDate.getFullYear());

      //들어온 년도가 지금 년도보다 크거나 같은 경우 교체
      if (parseInt(dateSplit[0]) >= nowDate.getFullYear()) {
        console.log('년도 교체 ');
        yyyy = nowDate.getFullYear();

        // 들어온 년도가 지금년도보다 크고, 들어온 달이 지금 달보다 크면 지금 달로 교체
        if (parseInt(dateSplit[1]) > parseInt(mm)) {
          console.log('달 교체 ');
          mm = mm
        }
      }
    }

  }

  //최종 날짜 조립
  const complateDate = yyyy + '' + mm + '' + dd //yyyyMMdd형태로 만든다.

  //검증 구역 나중에 주석처리
  console.log('dayType: ', dayType)
  console.log('dateRaw: ', dateRaw)
  console.log('nationType: ', nationType)
  console.log('movieType: ', movieType)
  console.log('complateDate: ', complateDate)

  // 1. 주간 일간 2. 국가타입 과 영화 종류 : null undefined 이면 전체
  if (dayType === undefined || dayType === null) {
    dayType = 'Days';
  }
  if (nationType === undefined || nationType === null || nationType === '') {
    nationType = undefined;
  }
  if (movieType === undefined || movieType === null || movieType === '') {
    movieType = undefined;
  }

  // let text
  let displayText = '';
  let speechText = '다음과 같이 검색되었습니다.';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let lastConv = ' 명령어를 말해주세요.';
  let flow = 'num';
  let suggestionList = suggestions;

  //json 형태로 보내기
  let insertData = {
    'date': complateDate,
    'movieType': movieType,
    'nationType': nationType
  }

  //request
  return asyncTask(insertData, dayType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));

      if (result.code != 200 && result.code != 300) { //300과 200 피하
        //문제있음
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
        title = "서버연결 에러";
        displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요.";
        speechText = displayText;

      } else { // no problem -> List
        //showRange : 기간 나옴
        //list > List로 정보 아래

        //영화 정보, 최대 10개 조회 = 9가 마지막
        // rnum "1"
        // movieList.rank "1"
        // rankInten "0"
        // movieList.rankOldAndNew "OLD"
        // movieCd "20153446"
        // movieList.movieNm "너의 결혼식"
        // movieList.openDt "2018-08-22"
        // salesAmt "5018864832"
        // movieList.salesShare "30.7"
        // salesInten "-1144166568"
        // movieList.salesChange "-18.6"
        // salesAcc "16429676432"
        // movieList.audiCnt "568273"
        // audiInten "-125892"
        // movieList.audiChange "-18.1"
        // movieList.audiAcc "1948597"
        // scrnCnt "969"
        // showCnt "13387"

        if (result.result == 'fail') {
          //ask
          conv.ask(new SimpleResponse({
            speech: '그 주엔 영화 검색 데이터가 없습니다. 아직 집계가 안된 주일 가능성이 높습니다.',
            text: '그 주엔 영화 검색 데이터가 없습니다. 아직 집계가 안된 주일 가능성이 높습니다.',
          }));
          conv.ask(new Suggestions(suggestions));

        } else if (result.result == 'success') {
          const showRange = result.showRange;
          const movieList = result.list;
          let textnoScreen = '';
          for (let i = 0; i < 5; i++) {
            textnoScreen += "영화제목 : " + movieList[i].movieNm + " 현재순위 : " + movieList[i].rank + '위 \n';
          }

          //스크린이 없다면 음성으로 안내
          if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            textnoScreen = '스크린이 없는 기기인 관계로 5위 까지의 순위만 말해 드립니다. \n' + textnoScreen;

            conv.ask(textnoScreen);
            return;
          }

          let selectMovie = [];
          //List형 response를 위한 []
          let itemMake = {};
          //1개의 아이템 만드는 부분

          //0부터 9까지의 response List를 만드는 부분.
          for (let i = 0; i < movieList.length; i++) {
            let SELECTION_KEY = movieList[i].movieCd; //영화코드
            let IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/movieApp/moiveSell.jpg';
            let alt_text = '영화제목';
            selectMovie[i + 2] = {
              movieNm: movieList[i].movieNm,
              openDt: movieList[i].openDt,
              rank: movieList[i].rank,
              rankOldAndNew: movieList[i].rankOldAndNew,
              salesShare: movieList[i].salesShare,
              audiAcc: movieList[i].audiAcc,
              audiCnt: movieList[i].audiCnt,
              audiChange: movieList[i].audiChange,
              salesAcc: movieList[i].salesAcc
            }
            //make items
            itemMake[i + 2] = {
              title: "영화제목 : " + movieList[i].movieNm + " / 현재순위 : " + movieList[i].rank + '위',
              description: "총 관객수 : " + numberWithCommas(movieList[i].audiAcc) + "명 / 점유율 : " + movieList[i].salesShare + '%',
              image: new Image({
                url: IMG_URL,
                alt: alt_text,
              })
            } // itemMake
          } //for
          let length3 = 3 - movieList.length;

          //3개 이하의 리스트 생성기
          for (let i = 0; i < length3; i++) {
            let SELECTION_KEY = '';
            let IMG_URL = '';
            let alt_text = '';
            IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
            alt_text = '-';

            selectMovie[resultData.length + 2] = " "; // 외부 모듈
            //make items
            itemMake[resultData.length + 2] = {
              title: " ",
              description: " ",
              image: new Image({
                url: IMG_URL,
                alt: alt_text,
              })
            } // itemMake
          } //for

          //List
          //이벤트에  actions_intent_OPTION 이거 안넣으면 아래의 title에러 남
          //MalformedResponse expected_inputs[0].input_prompt.rich_initial_prompt: 'title' must not be empty.
          conv.data.selectMovie = selectMovie;

          //사용자편의를 위한 텍스트 생성 = 한눈에 보기
          displayText = speechText + ' \n * 영화순위\n' + textnoScreen;

          //response부분.
          conv.ask(new SimpleResponse({
            speech: speechText,
            text: displayText
          }));
          conv.ask(new List({
            title: showRange + '기간 검색결과',
            items: itemMake
          }));
          conv.ask(new Suggestions(suggestions));
        }


      }

    });


});

//2~30까지 가능
//REF: https://developers.google.com/actions/assistant/responses#list
app.intent('actions.intent.OPTION', (conv, params, option) => {
  conv.data.fallbackCount = 0;
  let selectMovie = conv.data.selectMovie;


  //영화 정보, 최대 10개 조회 = 9가 마지막
  // rnum "1"
  // movieList.rank "1"
  // rankInten "0"
  // movieList.rankOldAndNew "OLD"
  // movieCd "20153446"
  // movieList.movieNm "너의 결혼식"
  // movieList.openDt "2018-08-22"
  // salesAmt "5018864832"
  // movieList.salesShare "30.7"
  // salesInten "-1144166568"
  // movieList.salesChange "-18.6"
  // movieList.salesAcc "16429676432"
  // movieList.audiCnt "568273"
  // audiInten "-125892"
  // movieList.audiChange "-18.1"
  // movieList.audiAcc "1948597"
  // scrnCnt "969"
  // showCnt "13387"
  // let text

  let displayText = '죄송합니다. 화면을 출력할 수 있는 기기가 아닙니다. 다른 명령을 말해주세요.';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/movieApp/moiveSell.jpg';
  let title = '선택하신 영화 정보';
  let subtitle = '';
  let text = '';

  if (option && selectMovie.hasOwnProperty(option)) {
    displayText = '선택하신 ' + selectMovie[option].movieNm + '의 정보는 ' + selectMovie[option].rank + '위 이며 ' + numberWithCommas(selectMovie[option].audiAcc) + '명이 봤습니다.';
    title = selectMovie[option].movieNm; //영화제목
    text += '전체 관객수 : ' + numberWithCommas(selectMovie[option].audiAcc) + '명' + ' \n'
    text += '점유율 : ' + selectMovie[option].salesShare + '%' + ' \n'
    text += '이번주 관객수 : ' + numberWithCommas(selectMovie[option].audiCnt) + '명' + ' \n'
    text += '관객수 변화 : ' + numberWithCommas(selectMovie[option].audiChange) + '명' + ' \n'
    text += '총 매출 : ' + numberWithCommas(selectMovie[option].salesAcc) + '원'

    subtitle += '개봉일자 : ' + selectMovie[option].openDt + ' \n'
    subtitle += '새롭게 등장한 영화 : ' + selectMovie[option].rankOldAndNew + ' \n'


  }
  //ask
  let speechText = displayText;

  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText
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
  let flow = 'fallback';
  let convResponse = 'original'

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count < 3) {

    if (count === 1) {
      displayText = '제가 잘 모르는 명령어 입니다. "도움말"을 말하시면 지원되는 회사를 아실 수 있습니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 주인님, 혹시 명령을 하는 방법을 모르신가요? 도움말 이라고 말하시면 어떤 명령이 되는지 알 수있습니다.';
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

  } else if (count > 2) {
    displayText = '정말로 죄송합니다. 제가 잘 모르는 명령이거나 인식이 실패했습니다. 앱을 종료하겠습니다. ';
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

  let displayText = appTitle + '은 영화관에 상영되는 주간 영화 순위를 조회해 드립니다. 아래의 칩을 보면 메뉴를 알 수 있습니다. 주간영화 조회시 마지막 전주의 일요일까지만 조회가 가능합니다.';
  let speechText = '';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '설명서';
  let subtitle = ''

  let lastConv = '다음 질문을 해 주세요.';
  let flow = 'help';
  let convResponse = 'original'
  let suggestionList = suggestions;

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
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/bye.jpg';

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

// Action name is different to method name.
// my action name is dialogv2. So If you want another name, please rename it.
// action name: dialogv2 => change your action name.
exports.startvideotour = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
