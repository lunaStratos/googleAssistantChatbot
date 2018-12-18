'use strict';

//기본적인 템플레이트
//콤마찍기, 랜덤 chip, 텍스트코드를 텍스트로 변경 function있음
//json xml 동시지원

//template이름 수정할 것

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
const request = require('request')
const iconv = require('iconv-lite');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

// app
const app = dialogflow({
  debug: true
});


//intent name
const WELCOME_INTENT = 'Default Welcome Intent';

const BUSBY_ID_INTENT = 'BusById';
const BUSBY_ID_1_INTENT = 'BusById1';
const BUSBY_ID_1_NEXT_INTENT = 'BusById1 - next';
const BUSBY_NOWLOCATION_INTENT = 'BusByNowLocation';
const BUSBY_NOWLOCATION_YES_INTENT = 'BusByNowLocation - yes';
const BUSBY_NOWLOCATION_NO_INTENT = 'BusByNowLocation - no';

//List선택
const OPTION_SELECT = 'actions.intent.OPTION' // List선택 (리스트 response 공통)

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent'; //Fallback, 3번 하면 종료
const HELP = 'help'; // 도움말
const SUPPPORT_COMMAND = 'supportCommand'; //지원되는 메뉴
const EXIT = 'exit'; // 종료
//앱 타이 (전역으로 사용)
const appTitle = '모두의 버스'; //앱 타이틀을 설정

//for chip
let suggestions = ["도움말", "끝내기", '현재위치 버스정류소 검색', '정류장 아이디로 검색','25190 정류장']; //칩은 8개까지 생성가능

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

//지도 변환 proj4 사용시

// var from = 'TM128'
// var to = 'WGS84'
// proj4.defs('WGS84', "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
// proj4.defs('TM128', '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43');
// var xy = [gis_X, gis_Y];
// var katecToWGS84 = proj4(from, to, xy); // WGS84 => TM128
// //지도링크 생성 18줌으로 고정
// console.log(katecToWGS84[0]) // 큰값
// console.log(katecToWGS84[1]) // 작은값
//
// let naverMapLink = 'http://maps.naver.com/?menu=location&mapMode=0&lat=' + katecToWGS84[1] + '&lng=' + katecToWGS84[0] + '&dlevel=13&enc=b64mapMode'
// let daumMapLink = 'https://map.daum.net/link/map/' + katecToWGS84[1] + ',' + katecToWGS84[0]
// let googleMapLink = 'https://www.google.com/maps/@' + katecToWGS84[1] + ',' + katecToWGS84[0] + ',18z';

//정류소도착여부 (0:운행중, 1:도착)
function switchCodeToStopFlag(text) {
  let returnText = '';
  switch (text) {
    case '0':
      returnText = '운행중'
      break;
    case '1':
      returnText = '도착'
      break;
  }
  return returnText;
}

//막차여부
function switchCodeToNextBus(text) {
  let returnText = '';
  switch (text) {
    case 'Y':
      returnText = '막차인'
      break;
    case 'N':
      returnText = '' //빈칸반환
      break;
  }
  return returnText;
}

// 해당차량 운행여부 (0: 운행종료, 1: 운행)
function switchCodeToIsrunyn(text) {
  let returnText = '';
  switch (text) {
    case '0':
      returnText = '운행종료'
      break;
    case '1':
      returnText = '운행'
      break;
  }
  return returnText;
}

// 막차여부(0 : 막차아님, 1: 막차)
function switchCodeToIslastyn(text) {
  let returnText = '';
  switch (text) {
    case '0':
      returnText = '막차아님'
      break;
    case '1':
      returnText = '막차'
      break;
  }
  return returnText;
}

// 만차여부(0 : 만차아님, 1: 만차)
function switchCodeToIsFullFlag(text) {
  let returnText = '';
  switch (text) {
    case '0':
      returnText = '만차아님'
      break;
    case '1':
      returnText = '만차'
      break;
  }
  return returnText;
}


// 혼잡도 (3 : 여유, 4 : 보통, 5 : 혼잡, 6 : 매우혼잡)
function switchCodeToCongetion(text) {
  let returnText = '';
  switch (text) {
    case '3':
      returnText = '여유'
      break;
    case '4':
      returnText = '보통'
      break;
    case '5':
      returnText = '혼잡'
      break;
    case '6':
      returnText = '매우혼잡'
      break;

  }
  return returnText;
}



///정류소타입 (0:공용, 1:일반형 시내/농어촌버스, 2:좌석형 시내/농어촌버스, 3:직행좌석형 시내/농어촌버스, 4:일반형 시외버스, 5:좌석형 시외버스, 6:고속형 시외버스, 7:마을버스)
function switchCodeToStationTp(text) {

  let returnText = '';
  let image = '';

  switch (text) {
    case '0':
      returnText = '공용'
      break;
    case '1':
      returnText = '일반형 시내/농어촌'
      break;
    case '2':
      returnText = '좌석형 시내/농어촌'
      break;
    case '3':
      returnText = '직행 좌석형 시내'
      break;
    case '4':
      returnText = '일반형 시외'
      break;
    case '5':
      returnText = '좌석형 시외버스'
      break;
    case '6':
      returnText = '고속형 시외버스'
      break;
    case '7':
      returnText = '마을버스'
      break;

  }
  return returnText;
} // switchCodeToBrand



//노선유형 (1:공항, 2:마을, 3:간선, 4:지선, 5:순환, 6:광역, 7:인천, 8:경기, 9:폐지, 0:공용)
function switchCodeToRouteType(text) {

  let returnText = '';
  let image = '';

  switch (text) {
    case '1':
      returnText = '공항'
      break;
    case '2':
      returnText = '마을'
      break;
    case '3':
      returnText = '간선'
      break;
    case '4':
      returnText = '지선'
      break;
    case '5':
      returnText = '순환'
      break;
    case '6':
      returnText = '광역'
      break;
    case '7':
      returnText = '인천'
      break;
    case '8':
      returnText = '경기'
      break;
    case '9':
      returnText = '폐지'
      break;
    case '0':
      returnText = '공용'
      break;

  }
  return returnText;
} // switchCodeToBrand


///차량유형 (0:일반버스, 1:저상버스, 2:굴절버스)
function switchCodeToBusType(text) {

  let returnText = '';
  let image = '';

  switch (text) {
    case '0':
      returnText = '일반버스'
      break;
    case '1':
      returnText = '저상버스'
      break;
    case '2':
      returnText = '굴절버스'
      break;
  }
  return returnText;
} // switchCodeToBrand

//현재 날짜
function date_return() {

  const date = new Date()
  const korDate = new Date(date.getTime() + 1000 * 60 * 60 * 9);
  const year = korDate.getFullYear() + ''; //String
  const month = ('0' + (korDate.getMonth() + 1)).slice(-2) //0추가
  const day = ('0' + korDate.getDate()).slice(-2) //0추가
  const hour = korDate.getHours()
  const minute = korDate.getMinutes()

  const todayText = year + '년 ' + month + '월 ' + day + '일' + hour + ':' + minute;
  return todayText;
} //date_return


//Request
function requesetParsing(insertData, apiType, callback) {
  let url = ''; //URL

  let forms = {}
  const serviceKey = 'aAfuvIitnAf6ckcIREyJXGfFEDWy7dah3nWnhgcGoL0%2BqCpEgu4MWRBmY89qcQvJreZBb%2F7Npm0MGsBjv6Es3Q%3D%3D'

  let requestJson = {
    method: 'GET',
    url: url,
    encoding: 'utf8',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7 ',
      'Content-Type': 'application/json; charset=utf-8'
    },
    timeout: 1000 * 30,
    qs: forms //form 입력 Get시 qs사용, post시 form사용
  }

  //apiType으로 분리
  switch (apiType) {
    case 'BusByNowLocation': //
      //http: //api.bus.go.kr/contents/sub02/getStationByPos.html
      //http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos?serviceKey=MIxIzH0KXlS%2FHHCBd8Lh2%2BNo77h5PPqzVPAwLXSbtcfcShibI6jj6Gm8V2I6A5DW%2Fef0HlHn4c%2BL6lFvJS5mcQ%3D%3D&tmX=127.08322&tmY=37.31455&radius=200
      url = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos?serviceKey=" + decodeURI(serviceKey);
      forms.radius = '200';
      forms.tmX = insertData.tmX; //127.08322
      forms.tmY = insertData.tmY; //37.31455
      break;

    case 'stationId': //

      //http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=MIxIzH0KXlS%2FHHCBd8Lh2%2BNo77h5PPqzVPAwLXSbtcfcShibI6jj6Gm8V2I6A5DW%2Fef0HlHn4c%2BL6lFvJS5mcQ%3D%3D&arsId=25190
      //http://api.bus.go.kr/contents/sub02/getStationByUid.html
      url = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=" + decodeURI(serviceKey);
      forms.arsId = insertData.arsId; //25190

      break;
    case 'kakaoLocation': //

      //https://dapi.kakao.com/v2/local/geo/coord2address.json?x=127.423084873712&y=37.0789561558879&input_coord=WGS84
      //http://api.bus.go.kr/contents/sub02/getStationByUid.html
      url = "https://dapi.kakao.com/v2/local/geo/coord2address.json";
      forms.x = insertData.x; //38
      forms.y = insertData.y; //126
      forms.input_coord = 'WGS84'

      //Authorization형식으로 인증받는다
      requestJson.headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7 ',
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'KakaoAK 13afdc6580c502c053f5d4e943bfcbe4'
      }

      break;

  } // switch

  //재입력
  requestJson.url = url
  requestJson.qs = forms

  console.log('forms: ', forms);

  //공통
  request(requestJson, function(err, res, responseBody) {
    //json받기
    const html = responseBody.toString()
    console.log(html)

    if (apiType == "kakaoLocation") { //json
      const jsonArray = JSON.parse(html)
      let documents = jsonArray.documents[0]
      console.log(documents)

      if (documents == undefined) {
        callback(null, {
          code: 400,
          list: null,
          result: 'fail'
        });
      } else { // 데이터 있음 처리
        documents = documents.address.region_1depth_name //서울 경기
        callback(null, {
          code: 200,
          list: documents,
          result: 'success'
        });

      }

    } else { //xml
      parser.parseString(html, function(err, XmlJson) {

        // 0: 서울, 1: 경기 ,2:부산
        // if(insertData.location == 0){ //서울
        // }else if(insertData.location == 1){ //경기
        // }

        const originalList = XmlJson.ServiceResult

        const headerMsg = originalList.headerMsg //정상적으로 처리되었습니다.
        const xmlList = originalList.msgBody[0].itemList //리스트 처리

        console.log(headerMsg)
        console.log(originalList)
        console.log(xmlList)
        //데이터 없음 400 처리
        if (xmlList == undefined || headerMsg == 'INVALID REQUEST PARAMETER ERROR.') {
          callback(null, {
            code: 400,
            list: null,
            result: 'fail'
          });
        } else { // 데이터 있음 처리
          //  stationId(정류소 아이디), stationNm(정류소 이름), gpsX(127), gpsY(36), arsId, dist(거리)
          callback(null, {
            code: 200,
            list: xmlList,
            result: 'success'
          });

        }

      }); //xml parser
    }



  });

} //request function

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

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/BusInfo/busWelcome.jpg';
  let text = appTitle + '에 오신걸 환영합니다.';
  let title = appTitle + ' 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let suggestionList = suggestions;

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";
  if (conv.user.last.seen) {
    //json 형태로 보내기
    displayText = appTitle + "에 오신것을 환영합니다. 하실 명령을 말해주세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "12s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';

  } else { //초기

    displayText = appTitle + "에 오신것을 환영합니다. 서울시 주요 정류소와 현재 위치의 정류소를 검색하실 수 있습니다. 아이디로 검색시 키보드를 이용하여 고유번호를 입력해 주세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "12s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';

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


});

//
function test_return(conv, result) {
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;
  if (result.code != 200) { //300과 400 에러시
    //문제있음
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
    title = "에러";
    displayText = "찾으시는 버스 정류소 id 정보가 없습니다. 다른 id를 입력 해 주세요.";
    speechText = displayText;

  } else { // no problem -> List

    //
    const list = result.list;

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

  } // if 200 or 300 400
}


//리스트 형태로 Return 하는 것 =>
function list_return(conv, result, requestType) {
  // let text
  let displayText = '현재 ';
  let speechText = '현재 ';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/BusInfo/busWelcome.jpg';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;
  let IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg';


  if (result.code != 200) { //300과 400 에러시
    //문제있음
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
    title = "에러";
    displayText = "찾으시는 정보가 없습니다. 다른 id를 입력 해 주세요.";
    speechText = displayText;

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

  } else { // no problem -> List

    //alist
    const alist = result.list;

    let selectArray = []; //건드리지 말것
    let itemMake = {}; // 건드리지 말것

    if (requestType == 'BusByNowLocation') {

      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/BusInfo/busWelcome.jpg';
      conv.data.listAction = requestType

      for (let i = 0; i < alist.length; i++) {

        const stationId = alist[i].stationId // (정류소 아이디),
        const stationNm = alist[i].stationNm // (정류소 이름),
        const gpsX = alist[i].gpsX // (127),
        const gpsY = alist[i].gpsY // (36),
        const arsId = alist[i].arsId //
        const dist = alist[i].dist // (거리)

        displayText += stationNm + '(고유번호: ' + arsId + ')는' + dist + 'M \n'
        speechText += stationNm + '는' + dist + 'M, '

        let SELECTION_KEY = i; // 선택키
        let optionInfoInsert = {
          "key": SELECTION_KEY
        }

        selectArray[i] = {
          stationId: stationId,
          stationNm: stationNm,
          gpsX: gpsX,
          gpsY: gpsY,
          arsId: arsId, // 정류장 아이디
          dist: dist // 거리 (M)
        }

        // make items
        // title은 내용이 모두 달라야 한다.
        itemMake[i] = {
          optionInfo: optionInfoInsert,
          title: stationNm + '정류장 / 정류장ID: ' + arsId,
          description: ' / 거리: ' + dist + 'M',
          image: new Image({
            url: IMG_URL,
            alt: 'alt_text',
          })
        } // itemMake

      } //for

    } else if (requestType == 'stationId') {
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/BusInfo/stationId.jpg';
      conv.data.listAction = requestType

      for (let i = 0; i < alist.length; i++) {


        const busRouteId = alist[i].busRouteId //string	노선ID
        const gpsX = alist[i].gpsX //string	정류소 좌표X (WGS84)
        const gpsY = alist[i].gpsY //string	정류소 좌표Y (WGS84)

        const staOrd = alist[i].staOrd //string	요청정류소순번
        const vehId1 = alist[i].vehId1 //string	첫번째도착예정버스ID
        const plainNo1 = alist[i].plainNo1 //string	첫번째도착예정차량번호
        const sectOrd1 = alist[i].sectOrd1 //	string	첫번째도착예정버스의 현재구간 순번
        const stationNm1 = alist[i].stationNm1 //	string	첫번째도착예정버스의 최종 정류소명
        const traTime1 = alist[i].traTime1 //string	첫번째도착예정버스의 여행시간
        const traSpd1 = alist[i].traSpd1 //string	첫번째도착예정버스의 여행속도 (Km/h)
        const isArrive1 = switchCodeToStopFlag(alist[i].isArrive1) //	string	첫번째도착예정버스의 최종 정류소 도착출발여부 (0:운행중, 1:도착)
        const isLast1 = switchCodeToIslastyn(alist[i].isLast1) //string	첫번째도착예정버스의 막차여부 (0:막차아님, 1:막차)
        const busType1 = switchCodeToBusType(alist[i].busType1) //string	첫번째도착예정버스의 차량유형 (0:일반버스, 1:저상버스, 2:굴절버스)
        const vehId2 = alist[i].vehId2 //string	두번째도착예정버스ID
        const plainNo2 = alist[i].plainNo2 //string	두번째도착예정차량번호
        const sectOrd2 = alist[i].sectOrd2 //	string	두번째도착예정버스의 현재구간 순번
        const stationNm2 = alist[i].stationNm2 //	string	두번째도착예정버스의 최종 정류소명
        const traTime2 = alist[i].traTime2 //	string	두번째도착예정버스의 여행시간
        const traSpd2 = alist[i].traSpd2 //string	두번째도착예정버스의 여행속도
        const isArrive2 = switchCodeToStopFlag(alist[i].isArrive2) //	string	두번째도착예정버스의 최종 정류소 도착출발여부 (0:운행중, 1:도착)
        const isLast2 = switchCodeToIslastyn(alist[i].isLast2) //	string	두번째도착예정버스의 막차여부 (0:막차아님, 1:막차)
        const busType2 = switchCodeToBusType(alist[i].busType2) //string	두번째도착예정버스의 차량유형 (0:일반버스, 1:저상버스, 2:굴절버스)

        //쓸모있는 정보
        const arsId = alist[i].arsId //	string	정류소 고유번호
        const stId = alist[i].stId // string	정류소 ID
        const stNm = alist[i].stNm //string	정류소명

        const rtNm = alist[i].rtNm //string	노선명
        const adirection = alist[i].adirection //string	방향
        const arrmsg1 = alist[i].arrmsg1 //	string	첫번째도착예정버스의 도착정보메시지
        const arrmsg2 = alist[i].arrmsg2 //	string	두번째도착예정버스의 도착정보메시지

        const arrmsgSec1 = alist[i].arrmsgSec1 //string	첫번째도착예정버스의 도착정보메시지
        const arrmsgSec2 = alist[i].arrmsgSec2 //string	두번째도착예정버스의 도착정보메시지

        const isFullFlag1 = switchCodeToIsFullFlag(alist[i].isFullFlag1) //	string	첫번째도착예정버스의 만차여부 (0 : 만차아님. 1 : 만차)
        const isFullFlag2 = switchCodeToIsFullFlag(alist[i].isFullFlag2) //string	두번째도착예정버스의 만차여부 (0 : 만차아님. 1 : 만차)

        const nxtStn = alist[i].nxtStn //	string	다음정류장순번
        const posX = alist[i].posX //string	정류소 좌표X (GRS80)
        const posY = alist[i].posY //	string	정류소 좌표Y (GRS80)
        const rerdieDiv1 = alist[i].rerdieDiv1 //	string	첫번째도착예정버스의 재차구분
        const rerdieDiv2 = alist[i].rerdieDiv2 //	string	두번째도착예정버스의 재차구분
        const rerideNum1 = alist[i].rerideNum1 //	string	첫번째도착예정버스의 재차인원
        const rerideNum2 = alist[i].rerideNum2 //string	두번째도착예정버스의 재차인원
        const sectNm = alist[i].sectNm //string	구간명

        const stationTp = switchCodeToStationTp(alist[i].stationTp) //	string	정류소타입 (0:공용, 1:일반형 시내/농어촌버스, 2:좌석형 시내/농어촌버스, 3:직행좌석형 시내/농어촌버스, 4:일반형 시외버스, 5:좌석형 시외버스, 6:고속형 시외버스, 7:마을버스)

        const firstTm = alist[i].firstTm //	string	첫차시간
        const lastTm = alist[i].lastTm //string	막차시간
        const nextBus = switchCodeToNextBus(alist[i].nextBus) //	string	막차운행여부 (N:막차아님, Y:막차)
        const term = alist[i].term //string	배차간격 (분)
        const routeType = switchCodeToRouteType(alist[i].routeType) //	string	노선유형 (1:공항, 2:마을, 3:간선, 4:지선, 5:순환, 6:광역, 7:인천, 8:경기, 9:폐지, 0:공용)

        //const congetion1 = switchCodeToCongetion(alist.congetion1) //	string	첫번째차량 혼잡도 (3 : 여유, 4 : 보통, 5 : 혼잡, 6 : 매우혼잡)
        //const congetion2 = switchCodeToCongetion(alist.congetion2) // string	두번째차량 혼잡도 (3 : 여유, 4 : 보통, 5 : 혼잡, 6 : 매우혼잡)

        displayText += adirection + '방향(다음역: ' + nxtStn + ') ' + rtNm + '버스는 ' + arrmsg1 + ' \ｎ'
        speechText += adirection + '방향 ' + rtNm + '버스는 ' + arrmsg1 + ' '

        let SELECTION_KEY = i; // 선택키
        let optionInfoInsert = {
          "key": SELECTION_KEY
        }

        selectArray[i] = {
          arsId: arsId,
          stId: stId,
          stNm: stNm,
          rtNm: rtNm, // 버스이름
          adirection: adirection, //방향
          arrmsg1: arrmsg1, // 1번째 차
          arrmsg2: arrmsg2, // 2번째 차
          nxtStn: nxtStn, //다음
          sectNm: sectNm, // 구간명
          stationTp: stationTp, //정류소타입
          firstTm: firstTm, //첫차시간
          lastTm: lastTm, //막차시간
          nextBus: nextBus, //막차여부
          term: term, //배차간격
          routeType: routeType //노선유형
        }

        //make items
        itemMake[i] = {
          optionInfo: optionInfoInsert,
          title: rtNm + '/' + arrmsg1,
          description: adirection + '방향 / 다음: ' + nxtStn,
          image: new Image({
            url: IMG_URL,
            alt: 'alt_text',
          })
        } // itemMake

      } //for


      const wgs84X = alist[0].gpsX //string	정류소 좌표X (WGS84)
      const wgs84Y = alist[0].gpsY //string	정류소 좌표Y (WGS84)
      let googleMapLink = 'https://www.google.com/maps/@' + wgs84X + ',' + wgs84Y + ',18z';
      conv.ask(new LinkOutSuggestion({
        name: '정류소 위치',
        url: googleMapLink,
      }));
    }

    let length3 = 3 - alist.length; //2개 1

    //3개 이하의 리스트 생성기
    for (let i = 0; i < length3; i++) {
      let SELECTION_KEY = '';
      let IMG_URL = '';
      let alt_text = '';
      IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
      alt_text = '-';

      selectArray[alist.length + i] = " "; // 외부 모듈
      //make items
      itemMake[alist.length + i] = {
        title: " ",
        description: " ",
        image: new Image({
          url: IMG_URL,
          alt: alt_text,
        })
      } // itemMake
    } //for

    //List
    //이벤트에 actions_intent_OPTION 이거 안넣으면 아래의 title에러 남
    //MalformedResponse expected_inputs[0].input_prompt.rich_initial_prompt: 'title' must not be empty.
    conv.data.selectArray = alist

    //사용자편의를 위한 텍스트 생성 = 한눈에 보기
    displayText += '입니다. \n리스트를 선택하시면 자세한 버스의 정보도 아실수 있습니다.'
    speechText += '입니다. 리스트를 선택하시면 자세한 버스의 정보도 아실수 있습니다.'

    //response부분.
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText
    }));
    conv.ask(new List({
      title: '검색결과',
      items: itemMake
    }));


  } // if 200 or 300 400

}

//stationId 로 찾기
app.intent(BUSBY_ID_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  let arsId = conv.parameters['number']; //parameters
  //json 형태로 보내기
  let insertData = {
    'arsId': arsId
  }

  let requestType = 'stationId';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      list_return(conv, result, requestType);

    });

}); // sampleRequest_intent


//location_first 위치정보
app.intent(BUSBY_NOWLOCATION_INTENT, (conv, params, confirmationGranted) => {
  conv.data.fallbackCount = 0;
  console.log("BUSBY_NOWLOCATION_INTENT")
  console.log("confirmationGranted: ", confirmationGranted)
  console.log(params)
  if (params) { //권한 없으면 Object.keys(confirmationGranted).length === 0

    //https://developers.google.com/actions/assistant/helpers
    //위치 퍼미션 받는 intent

    // Choose one or more supported permissions to request:
    // DEVICE_PRECISE_LOCATION, DEVICE_COARSE_LOCATION
    const options = {
      context: ' ',
      // Ask for more than one permission. User can authorize all or none.
      permissions: ['DEVICE_PRECISE_LOCATION'],
    };
    conv.ask(new Permission(options));

  } else { // 권한 있음
    let requestType = 'BusByNowLocation';

    //새로받기
    const latitude = conv.device.location.coordinates.latitude
    const longitude = conv.device.location.coordinates.longitude

    //json 형태로 보내기
    let insertData = {
      tmX: longitude,
      tmY: latitude
    }
    //request
    return asyncTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));
        list_return(conv, result, requestType)

      }); //async

  }

}); // 'location_first'



//이벤트에 actions_intent_PERMISSION넣기
//위치정보 권한 수락 YES
app.intent(BUSBY_NOWLOCATION_YES_INTENT, (conv, params, confirmationGranted) => {
  console.log("BUSBY_NOWLOCATION_YES_INTENT")
  console.log('params', params)
  console.log("confirmationGranted: ", confirmationGranted)

  if (confirmationGranted == false) { //권한 없으면

    conv.ask(new SimpleResponse({
      speech: '권한이 없는 관계로 위치정보를 통한 검색을 하지 않습니다. 다른 명령을 시도해 주세요.',
      text: '권한이 없는 관계로 위치정보를 통한 검색을 하지 않습니다. 다른 명령을 시도해 주세요.',
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: '위치정보를 불러오지 못했습니다.',
      subtitle: '',
      title: '위치정보 취소',
      image: new Image({
        url: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg',
        alt: '이미지',
      }),
    }));

  } else {
    const latitude = conv.device.location.coordinates.latitude
    const longitude = conv.device.location.coordinates.longitude
    const city = conv.device.location.city
    console.log(city)


    //json 형태로 보내기
    let insertData = {
      tmX: longitude,
      tmY: latitude
    }

    let requestType = 'BusByNowLocation';

    //request
    return asyncTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));
        list_return(conv, result, requestType)

      }); //async


  } //if


}); // ALLROUND_INTENT_YES

app.intent(BUSBY_NOWLOCATION_NO_INTENT, (conv, params, confirmationGranted) => {

  conv.ask(new SimpleResponse({
    speech: '권한이 없는 관계로 위치정보를 통한 검색을 하지 않습니다. 다른 명령을 시도해 주세요.',
    text: '권한이 없는 관계로 위치정보를 통한 검색을 하지 않습니다. 다른 명령을 시도해 주세요.',
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: '위치정보를 불러오지 못했습니다.',
    subtitle: '',
    title: '위치정보 취소',
    image: new Image({
      url: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg',
      alt: '이미지',
    }),
  }));



}); // location_get_permission

// BUSBY_ID_1_INTENT
app.intent(BUSBY_ID_1_INTENT, (conv) => {
  console.log("BUSBY_ID_1_INTENT");

  // let text
  let displayText = '버스 정류장 아이디로 검색하기를 말하셨습니다. 정류장의 고유 번호(숫자)를 말해주세요. \n*키보드로 입력하면 더 확실하게 입력하실수 있습니다. \n*말하는 방법은 칩을 참조해주세요.';
  let speechText = '버스 정류장 아이디로 검색하기를 말하셨습니다. 정류장의 고유 번호를 말해주세요.'
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg'
  let text = ''
  let title = ''
  let subtitle = ''
  let suggestionList = ['02246 검색', '25190 찾아줘', '정류장 23813 ', '아이디 23285']

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

}); //

//BUSBY_ID_1_NEXT_INTENT
app.intent(BUSBY_ID_1_NEXT_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  let arsId = conv.parameters['number']; //parameters
  //json 형태로 보내기
  let insertData = {
    'arsId': arsId
  }

  let requestType = 'stationId';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      list_return(conv, result, requestType);

    });

}); //BUSBY_ID_1_NEXT_INTENT

//2~30까지 가능
//REF: https://developers.google.com/actions/assistant/responses#list
app.intent(OPTION_SELECT, (conv, params, option) => {
  console.log('OPTION_SELECT')

  conv.data.fallbackCount = 0;
  const selectArray = conv.data.selectArray;
  console.log('selectArray: ', selectArray)
  console.log('conv.data.listAction ', conv.data.listAction)
  console.log('option ', option)

  let displayText = '죄송합니다. 화면을 출력할 수 있는 기기가 아닙니다. 다른 명령을 말해주세요.';
  let speechText = '';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;

  //option
  if (option && selectArray.hasOwnProperty(option)) { //리스트 선택시
    const getArray = selectArray[option];
    console.log('conv.data.listAction: ', conv.data.listAction)

    if (conv.data.listAction == 'BusByNowLocation') {

      //json 형태로 보내기
      let insertData = {
        'arsId': getArray.arsId[0]
      }

      let requestType = 'stationId';
      //request
      return asyncTask(insertData, requestType)
        .then(function(result) {
          //로그 확인용
          console.log("result : " + JSON.stringify(result));
          list_return(conv, result, requestType);

        });

    } else if (conv.data.listAction == 'stationId') {

      const arsId = getArray.arsId // 정류소 아이디
      const stNm = getArray.stNm // 버스 정류장 이름
      const rtNm = getArray.rtNm // 버스이름
      const adirection = getArray.adirection //방향
      const arrmsg1 = getArray.arrmsg1
      const arrmsg2 = getArray.arrmsg2
      const nxtStn = getArray.nxtStn //다음
      const sectNm = getArray.sectNm // 구간명
      const stationTp = getArray.stationTp //정류소타입
      const firstTm = getArray.firstTm // 첫차시간
      const lastTm = getArray.lastTm //막차시간
      const nextBus = getArray.nextBus //막차여부
      const term = getArray.term //배차간격
      const routeType = getArray.routeType //노선유형

      //사용자편의를 위한 텍스트 생성 = 한눈에 보기
      const wgs84X = getArray.gpsX //string	정류소 좌표X (WGS84)
      const wgs84Y = getArray.gpsY //string	정류소 좌표Y (WGS84)
      let googleMapLink = 'https://www.google.com/maps/@' + wgs84X + ',' + wgs84Y + ',18z';
      let naverMapLink = 'http://maps.naver.com/?menu=location&mapMode=0&lat=' + wgs84X + '&lng=' + wgs84Y + '&dlevel=13&enc=b64mapMode'

      displayText = nextBus + adirection + '방향 ' + rtNm + '(다음: ' + nxtStn + ')' + arrmsg1 + '남았습니다.' + '\n '
      speechText = nextBus + adirection + '방향 ' + rtNm + arrmsg1 + '남았습니다.' + '\n '

      subtitle += '버스이름 : ' + rtNm + ' / 방향' + adirection + '(다음: ' + nxtStn + ')' + '\n'
      subtitle += '첫번째 버스 : ' + arrmsg1 + '\n'
      subtitle += '두번째 버스 : ' + arrmsg2 + '\n'

      text += '구간명 : ' + sectNm + '\n'
      text += '정류소타입 : ' + stationTp + '\n'
      text += '노선유형 : ' + routeType + '\n'
      text += '배차간격 : ' + term + '\n'
      text += '첫차 : ' + firstTm + ' / 막차: ' + lastTm + '\n'
      text += '' + nextBus

      title = stNm + '(' + arsId + ')'

      //ask
      conv.ask(new SimpleResponse({
        speech: speechText,
        text: displayText,
      }));
      conv.ask(new BasicCard({
        text: text,
        subtitle: subtitle,
        title: title,
        buttons: new Button({
          title: '구글 지도',
          url: googleMapLink,
        }),
        image: new Image({
          url: imageLink,
          alt: '이미지',
        }),
      }));
      conv.ask(new Suggestions(suggestions));
      conv.ask(new LinkOutSuggestion({
        name: '네이버 지도',
        url: naverMapLink,
      }));
    } // conv.data.listAction

  } // Option

});



// =======================================================================
// =======================================================================
// =======================================================================
// =======================================================================
// ============================퀄리티를 위한 영역=============================
// =======================================================================
// =======================================================================
// =======================================================================
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
      displayText = '제가 잘 모르는 명령어 입니다. "지원되는 메뉴"을 말하시면 지원되는 회사를 아실 수 있습니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 현재 위치에서 가장 싼 주유소를 알고 싶으신가요? "내 위치 최저가 주유소" 이라고 말하시면 됩니다.';
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

  } else if (count > 2) { // 3번 이상은 종료시킴
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

// SUPPPORT_COMMAND
app.intent(SUPPPORT_COMMAND, (conv) => {
  console.log("SUPPPORT_COMMAND");

  // let text
  let displayText = '지원되는 메뉴는 다음과 같습니다. \n* 주변 버스정류장 위치 \n* 각 버스의 도착시간 \n* 각 버스의 첫차 막차시간 을 지원하고 있습니다.';
  let speechText = '지원되는 메뉴는 다음과 같습니다. 주변 버스정류장 위치 각 버스의 도착시간 각 버스의 첫차 막차시간 을 지원하고 있습니다.';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '';
  let subtitle = ''

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

}); //SUPPPORT_COMMAND


// HELP
app.intent(HELP, (conv) => {
  console.log("HELP");
  conv.data.fallbackCount = 0;

  let displayText = appTitle + '는 현재위치의 버스정류장, 버스의 도착시간, 첫차와 막차 시간 등을 알 수 있습니다.';
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
exports.busInfo = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
