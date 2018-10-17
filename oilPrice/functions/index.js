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
  LinkOutSuggestion
} = require('actions-on-google');
const functions = require('firebase-functions');
const request = require('request')
const iconv = require('iconv-lite');
const proj4 = require('proj4'); //지도용

var xml2js = require('xml2js');
var parser = new xml2js.Parser();

// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const ALLROUND_INTENT = 'aroundAll'; // 내 주변 최저가
const AVGALLPRICE_INTENT = 'avgAllPrice'; // 전국 평균 가격
const LOWTOPTEN_INTENT = 'lowTop10'; //특정 지역의 최저가
const DETAILBYID_INTENT = 'detailById' // 아이디로 주유소 자세한 정보
const ALLROUND_INTENT_YES = "aroundAllYes" // 내 주변 최저가: 예스
const ALLROUND_INTENT_NO = "aroundAllNo" // 내 주변 최저가: 권한 포기 => followup으로 처음으로 이동

const AVG_SIDO_INTENT = "AvgSidoPrice" //시도별 평균가
const SEARCH_AVG_SIDO_INTENT = "SearchAvgSidoPrice" //시도별 평균가 시작
const SEARCH_AVG_SIDO2_INTENT = "SearchAvgSidoPrice2" // 시도별 평균가 검색

const SEARCHID_GASSTATION_INTENT = 'SearchIdGasStation' //아이디로 주유소 검색
const SEARCHID_GASSTATION2_INTENT = 'SearchIdGasStation2' //아이디로 주유소 검색

const LOCATION_CONFIRM = 'location confirm'; //위치확인

const OPTION_SELECT = 'actions.intent.OPTION' // List선택 (리스트 response 공통)

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent'; //Fallback, 3번 하면 종료
const HELP = 'help'; // 도움말
const SUPPPORT_COMMAND = 'supportCommand'; //지원되는 메뉴
const EXIT = 'exit'; // 종료
//앱 타이 (전역으로 사용)
const appTitle = '다함께 차차차';

//for chip
let suggestions = ["도움말", "끝내기", "내 위치의 최저가 주유소", "오늘의 전국 평균가격", "종로구의 휘발유 최저가", "시도별 평균가 검색", "서울의 평균가 검색"];

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

// 콤마 찍기 => 화폐나 사람 수
//숫자가 들어오면 String
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//코드 => 상품 브랜드
function switchCodeToProduct(text) {
  let returnText = '';
  switch (text) {
    case 'B027':
      returnText = '휘발유'
      break;
    case 'D047':
      returnText = '디젤'
      break;
    case 'B034':
      returnText = '고급휘발유'
      break;
    case 'C004':
      returnText = '실내등유'
      break;
    case 'K015':
      returnText = '자동차용 부탄'
      break;

  }
  return returnText;
}

//있고 없는것 Text변환
function yesOrNo(text) {
  let returnText = '';
  if (text == 'Y') {
    returnText = '있음'
  } else {
    returnText = '없음'
  }
  return returnText

}

//브랜드 코드 받아서 이름, 브랜드로고, 주유소 전경 반환
function switchCodeToBrand(text) {
  let returnText = '';
  let imageLogo = '';
  let stationImage = '';

  switch (text) {

    case 'SKE':
      returnText = 'SK에너지'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/sk_logo.png'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_sk.jpg'
      break;
    case 'GSC':
      returnText = 'GS칼텍스'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gs_logo.png'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_gs.jpg'
      break;
    case 'HDO':
      returnText = '현대오일뱅크'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/hyundai_logo.jpg'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_hyundai.jpg'
      break;
    case 'SOL':
      returnText = 'S-OIL'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/s-oil_logo.jpg'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_soil.jpg'
      break;
    case 'RTO':
      returnText = '자영업 알뜰주유소'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/altul_logo.jpg'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_etc.jpg'
      break;
    case 'RTX':
      returnText = '고속도로 알뜰주유소'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/what.jpg'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_ex.jpg'
      break;
    case 'NHO':
      returnText = '농협 알뜰주유소'
      imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/nh_logo.jpg'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_nh.jpg'
      break;
    case 'ETC':
      returnText = '기타 브랜드'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/what.png'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/what.png'
      break;
    case 'E1G':
      returnText = 'E1'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/e1_logo.jpg'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_e1.jpg'
      break;
    case 'SKG':
      returnText = 'SK가스'
      imageLogo = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/what.png'
      stationImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/oilStation/gasstation_e1.jpg'
      break;
  }
  const arrayreturn = [returnText, imageLogo, stationImage] // 실제브랜드, 로고주소, 브랜드주유소사진
  return arrayreturn;
}

//Request
function requesetParsing(insertData, apiType, callback) {
  let url = ''; //URL

  //기본 요청 코드
  let forms = {
    code: 'F367181010',
    out: 'json'
  }

  //apiType으로 분리
  switch (apiType) {
    case 'avgAllPrice': //전국 평균가격 조회 (처음 실행시)
      //http://www.opinet.co.kr/api/avgAllPrice.do?out=json&code=F367181010
      url = "http://www.opinet.co.kr/api/avgAllPrice.do";
      break;

    case 'aroundAll': //일정 반경 최저가 조회
      //http://www.opinet.co.kr/api/aroundAll.do?code=F367181010&out=json&x=314681.8&y=544837&radius=1000&sort=1
      url = "http://www.opinet.co.kr/api/aroundAll.do";
      forms.x = insertData.x;
      forms.y = insertData.y;
      forms.radius = '1000'; // 1000m
      forms.sort = '1'; //가격으로 정리

      break;

    case 'detailById': //주유소 자세한 정보 =>  xml로 처리
      //http://www.opinet.co.kr/api/detailById.do?code=F367181010&id=A0009974&out=xml
      url = "http://www.opinet.co.kr/api/detailById.do";
      forms.out = 'xml'; //xml로 변경 (json은 에러때문에 사용불가)
      forms.id = insertData.id; //주유소 아이디

      break;

      //사용안함
    case 'searchByName': //주유소 이름으로 검색
      //http://www.opinet.co.kr/api/searchByName.do?code=F367181010&out=json&osnm=보라매&area=01
      url = "http://www.opinet.co.kr/api/searchByName.do";
      forms.osnm = insertData.osnm; // 주유소 이름
      //지역은 있을수도 없을수도 있음
      if (insertData.area != null || insertData.area != undefined || insertData.area != '') {
        forms.area = insertData.area;
      }
      break;


    case 'lowTop10': // 지역별 최저가
      //http://www.opinet.co.kr/api/lowTop10.do?out=json&code=F367181010&prodcd=B027&area=0101
      url = "http://www.opinet.co.kr/api/lowTop10.do";
      forms.prodcd = insertData.prodcd;
      forms.area = insertData.area;

      break;

    case 'avgSidoPrice': // 시도별 평균가격
      // http: //www.opinet.co.kr/api/avgSidoPrice.do?out=json&code=XXXXX
      url = "http://www.opinet.co.kr/api/avgSidoPrice.do";
      forms.sido = insertData.sido;
      if (insertData.prodcd != null || insertData.prodcd != undefined || insertData.prodcd != '') {
        forms.prodcd = insertData.prodcd;
      }

      break;

  } // switch

  console.log('forms: ', forms);

  //공통
  request({
    method: 'GET',
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    },
    timeout: 1000 * 30,
    qs: forms //form 입력 Get시 qs사용, post시 form사용
  }, function(err, res, responseBody) {
    //json받기
    console.log(res.headers['content-type'])
    const html = responseBody.toString()
    console.log('html ', html);

    let result = ''
    let OilArray = '';

    //DetailById는 XML api로 처리를 한다.
    //기타 일반 json인 경우
    if (forms.out == 'json') {
      result = JSON.parse(html);
      console.log('result', result);
      OilArray = result.RESULT.OIL;
      if (OilArray[0] == undefined) {
        //callback
        callback(null, {
          code: 300,
          result: 'fail'
        });

      } else {
        //callback

        callback(null, {
          code: 200,
          list: OilArray,
          result: 'success'
        });

      }

    } else { //DetailById 인 경우
      parser.parseString(html, function(err, XmlJson) {
        console.log(XmlJson);
        console.log(JSON.stringify(XmlJson));

        const originalList = XmlJson.RESULT

        if (originalList != '\r\n \r\n') { // 에러없음
          const xmlList = originalList.OIL[0]

          callback(null, {
            code: 200,
            list: xmlList,
            status: 'success'
          });
        } else {
          callback(null, {
            code: 400,
            list: '',
            status: 'fail'
          });
        }

      }); //xml parser

    } // detailById　구분




  });

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
  let suggestionList = suggestions;

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";
  if (conv.user.last.seen) {
    //json 형태로 보내기
    let insertData = {
      'none': '보낼 데이터 없음',
    }

    let requestType = 'avgAllPrice';
    //request
    return asyncTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));

        avgAllPrice_return(conv, result);

      });

  } else {

    displayText = appTitle + "에 오신것을 환영합니다. 전국 주유소의 가격과 현재 위치 혹은 설정한 위치로 가격비교를 할 수 있습니다.";
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

//전국 시도별 평균가 검색 시도, 휘발유 종류
function avgSido_return(conv, result) {
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;
  if (result.code != 200) { //300과 400 에러시
    //문제있음
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
    title = "서버연결 에러";
    displayText = "찾으시는 시도의 이름이 없습니다. 다른 시도 이름을 해 주세요.";
    speechText = displayText;

  } else { // no problem -> List

    //PRICE가격, DIFF등락률 (%)
    const OilArray = result.list;

    let sidoName = ''; //시도 이름은 같다
    let makeTextForDisplay = '';
    let makeTextForSpeech = '';

    for (let i = 0; i < OilArray.length; i++) {
      sidoName = OilArray[i].SIDONM // 시도명
      const oilName = switchCodeToProduct(OilArray[i].PRODCD)
      const price = numberWithCommas(OilArray[i].PRICE)
      const diff = OilArray[i].DIFF
      makeTextForDisplay += oilName + '는 ' + price + '원(' + diff + '%) \n'
      makeTextForSpeech += oilName + '는 ' + price + '원 \n'
    }

    const date = new Date()
    const korDate = new Date(date.getTime() + 1000 * 60 * 60 * 9);
    const year = korDate.getFullYear() + ''; //String
    const month = ('0' + (korDate.getMonth() + 1)).slice(-2) //0추가
    const day = ('0' + korDate.getDate()).slice(-2) //0추가

    const todayText = year + '년 ' + month + '월 ' + day + '일';

    speechText = todayText + ' ' + sidoName + '의 ' + makeTextForSpeech + '입니다. '
    displayText = todayText + ' ' + sidoName + '의 ' + makeTextForDisplay + '입니다. '

    title = sidoName + '의 평균가격'

    imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg';
    text = makeTextForDisplay

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

//전국 평균가 검색
function avgAllPrice_return(conv, result) {
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;
  if (result.code != 200) { //300과 400 에러시
    //문제있음
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
    title = "서버연결 에러";
    displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요.";
    speechText = displayText;

  } else { // no problem -> List
    //PRICE가격, DIFF등락률 (%)
    const OilArray = result.list;

    let insertText = ''
    let insertSound = ''

    //for로 돌리기
    for (let i = 0; i < OilArray.length; i++) {
      const price = OilArray[i].PRICE
      const diff = OilArray[i].DIFF
      const productName = switchCodeToProduct(OilArray[i].PRODCD)
      insertText += productName + '의 가격은 ' + numberWithCommas(price) + '원 (어제보다' + diff + '%) \n';
      insertSound += productName + '의 가격은 ' + numberWithCommas(price) + '원 ';
    }

    //날짜 이미지 파일 이름은 날짜 + M2.png
    const date = new Date()
    const korDate = new Date(date.getTime() + 1000 * 60 * 60 * 9);
    const year = korDate.getFullYear() + ''; //String
    const month = ('0' + (korDate.getMonth() + 1)).slice(-2) //0추가
    const day = ('0' + korDate.getDate()).slice(-2) //0추가
    //날짜 텍스트
    const todayText = year + '년 ' + month + '월 ' + day + '일';

    speechText = todayText + '의 ' + insertSound + '입니다. '
    displayText = todayText + '의 ' + insertText + '입니다. '

    title = todayText + ' 그래프 '

    const fullDateString = korDate.getFullYear() + '' + month + '' + day;
    imageLink = 'https://www.petronet.co.kr/v3/chart/img/' + fullDateString + 'M2.png';
    subtitle = '빨간색 줄은 휘발유, 파란색 줄은 자동차용 경유입니다.'
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

//리스트 형태로 Return 하는 것 => 내 주변 주유소 리스트, 전국 시도별 최저가 리스트, 주유소 이름으로 검색
function list_return(conv, result, requestType) {
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;

  if (result.code != 200) { //300과 400 에러시
    //문제있음
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
    title = "서버연결 에러";
    displayText = "죄송합니다. 찾은 결과 주유소 정보가 없습니다. 다른 명령을 시도해 주세요.";
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

    //ArrayList
    const OilArray = result.list;

    let selectGasStation = [];
    let itemMake = {};

    for (let i = 0; i < OilArray.length; i++) {
      const price = OilArray[i].PRICE //가격
      const brand = switchCodeToBrand(OilArray[i].POLL_DIV_CD)[0]; // 브랜드(코드변환 필요)
      const IMG_URL = switchCodeToBrand(OilArray[i].POLL_DIV_CD)[1]; // 브랜드로고
      const brandImage = switchCodeToBrand(OilArray[i].POLL_DIV_CD)[2]; // 브랜드 주유소 사진

      // 거리(M) (최저가 검색시에는 없음)
      // 최저가 검색시에는 주소로 한다.
      let distance = "";
      let descriptionDistanceOrAddress = ""
      if (requestType == "aroundAll") {
        distance = OilArray[i].DISTANCE
        descriptionDistanceOrAddress = "거리: " + distance + 'm(미터)'
      } else if (requestType == "lowTop10") {
        distance = OilArray[i].NEW_ADR
        descriptionDistanceOrAddress = "주소: " + distance + ''
      }

      //GIS좌표 (구글지도시 경위도로 변환)
      const gis_X = OilArray[i].GIS_X_COOR
      const gis_Y = OilArray[i].GIS_Y_COOR

      const codeNum = OilArray[i].UNI_ID

      const gasStationName = OilArray[i].OS_NM; //주유소 이름

      let SELECTION_KEY = i; // 선택키
      let optionInfoInsert = {
        "key": SELECTION_KEY
      }

      let alt_text = gasStationName;

      selectGasStation[i + 2] = {
        gasStationName: gasStationName,
        price: price,
        gis_X: gis_X,
        gis_Y: gis_Y,
        distance: distance,
        brandImage: brandImage,
        gasStationCode: codeNum
      }

      //make items
      itemMake[i + 2] = {
        optionInfo: optionInfoInsert,
        title: gasStationName + " / 가격 : " + numberWithCommas(price) + '원',
        description: descriptionDistanceOrAddress,
        image: new Image({
          url: IMG_URL,
          alt: alt_text,
        })
      } // itemMake

    } //for

    console.log(itemMake);
    let length3 = 3 - OilArray.length;

    //3개 이하의 리스트 생성기
    for (let i = 0; i < length3; i++) {
      let SELECTION_KEY = '';
      let IMG_URL = '';
      let alt_text = '';
      IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
      alt_text = '-';

      selectGasStation[OilArray.length + 2] = " "; // 외부 모듈
      //make items
      itemMake[OilArray.length + 2] = {
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
    conv.data.selectGasStation = selectGasStation;

    //사용자편의를 위한 텍스트 생성 = 한눈에 보기
    displayText = '현재 가장 최저가 주유소는 ' + OilArray[0].OS_NM + ' 입니다.'
    speechText = displayText;

    //response부분.
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText
    }));
    conv.ask(new List({
      title: '검색결과',
      items: itemMake
    }));
    conv.ask(new Suggestions(suggestions));

  } // if 200 or 300 400

}

//전국 주유소 평균 가격 조회
app.intent(AVGALLPRICE_INTENT, (conv) => {
  conv.data.fallbackCount = 0;

  //json 형태로 보내기
  let insertData = {
    'none': '보낼 데이터 없음',

  }

  let requestType = 'avgAllPrice';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));

      avgAllPrice_return(conv, result); //시작에서도 사용하기 때문에 이렇게 처리

    });

});

//지역별 최저가 주유소
app.intent(LOWTOPTEN_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  let city = conv.parameters['city'];
  let oilType = conv.parameters['oilType'];

  //json 형태로 보내기
  let insertData = {
    'prodcd': oilType,
    'area': city
  }

  let requestType = 'lowTop10';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      list_return(conv, result, requestType)

    });

}); //lowTop10

//주유소 코드로 주유소 정보 보기
//[중요!] => 리스트에서 선택하면 이걸로 간다.
function detailById_return(conv, result, gasStationCode) {

  let displayText = '';
  let speechText = '';
  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;

  console.log("result.list ", result.list);
  const oilJson = result.list //result.list[0]; //0번만 존재

  const oilPrices = oilJson.OIL_PRICE //오일가격
  const gasStationName = oilJson.OS_NM //상호

  //BrandCode to Real Brand name and ImageLink
  const gasStationCodeToBrand = switchCodeToBrand(oilJson.POLL_DIV_CO[0])
  const gasStationBrand = gasStationCodeToBrand[0] //브랜드 String이름
  imageLink = gasStationCodeToBrand[2] // 주유소 전경

  const oldAddress = oilJson.VAN_ADR //지번주소
  const address = oilJson.NEW_ADR //도로명주소
  const tel = oilJson.TEL //전화번호
  const addressCode = oilJson.SIGUNCD //소재지역 시군코드

  const gis_X = Number(oilJson.GIS_X_COOR[0])
  const gis_Y = Number(oilJson.GIS_Y_COOR[0])

  let stationType = '';

  switch (oilJson.LPG_YN) {
    case 'N':
      stationType = '주유소'
      break;
    case 'Y':
      stationType = '자동차충전소'
      break;
    case 'C':
      stationType = '주유소/충전소 겸업'
      break;
  }

  const repeir = yesOrNo(oilJson.MAINT_YN) //경정비 시설 존재 여부
  const wash = yesOrNo(oilJson.CAR_WASH_YN) //세차장 존재 여부
  const goodOil = yesOrNo(oilJson.KPETRO_YN) //품질인증주유소 여부 (한국석유관리원의 품질인증프로그램 협약 업체 여부)
  const cvs = yesOrNo(oilJson.CVS_YN) //편의점 존재 여부

  //지도 변환
  var from = 'TM128'
  var to = 'WGS84'
  proj4.defs('WGS84', "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
  proj4.defs('TM128', '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43');
  var xy = [gis_X, gis_Y];
  var katecToWGS84 = proj4(from, to, xy); // WGS84 => TM128
  //지도링크 생성 18줌으로 고정
  console.log(katecToWGS84[0]) // 큰값
  console.log(katecToWGS84[1]) // 작은값

  let naverMapLink = 'http://maps.naver.com/?menu=location&mapMode=0&lat=' + katecToWGS84[1] + '&lng=' + katecToWGS84[0] + '&dlevel=13&enc=b64mapMode'
  let daumMapLink = 'https://map.daum.net/link/map/' + katecToWGS84[1] + ',' + katecToWGS84[0]
  let googleMapLink = 'https://www.google.com/maps/@' + katecToWGS84[1] + ',' + katecToWGS84[0] + ',18z';

  let insertText = '* 상호 : ' + gasStationName + ' \n'
  insertText += '\n* 주유소 고유코드 : ' + gasStationCode + ' '
  insertText += '\n* 도로명 주소 : ' + address + ' '
  insertText += '\n* 전화번호 : ' + tel + ' '
  insertText += '\n* 주유소 타입 : ' + stationType + ' '
  insertText += '\n* 경정비 : ' + repeir + ' '
  insertText += '\n* 세차장 : ' + wash + ' '
  insertText += '\n* 품질인증 주유소 여부 : ' + goodOil + ' '
  insertText += '\n* 편의점 : ' + cvs + ' '

  //
  let goodsAndPrice = '';
  for (let i = 0; i < oilPrices.length; i++) {
    const sellGoodsName = switchCodeToProduct(oilPrices[i].PRODCD[0])
    const sellPrice = numberWithCommas(oilPrices[i].PRICE)
    goodsAndPrice += sellGoodsName + '는 ' + sellPrice + '원 \n'
    text += switchCodeToProduct(oilPrices[i].PRODCD[0]) + '는 ' + numberWithCommas(oilPrices[0].PRICE) + '원 \n'
  }

  displayText = gasStationName + '의 ' + goodsAndPrice + ' 입니다. ' + '구글 맵 버튼을 누르시면 지도로 확인하실 수 있습니다. \n';
  title = gasStationName + ': ' + goodsAndPrice + '원' + ' \n'
  speechText = displayText;

  displayText += insertText //Display에서는 그냥 텍스트로 넣어준다


  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText
  }));

  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    buttons: new Button({
      title: '구글 맵',
      url: googleMapLink,
    }),
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new Suggestions(["내 위치의 최저가 주유소", "오늘의 전국 평균가격", "종로구의 휘발유 최저가", "시도별 평균가 검색", "서울의 평균가 검색"]));
  conv.ask(new LinkOutSuggestion({
    name: '네이버 지도',
    url: naverMapLink,
  }));
}

//아이디별 주유소 자세한 정보 검색
app.intent(DETAILBYID_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  let gasStationCode = conv.parameters['any'];

  //json 형태로 보내기
  let insertData = {
    id: gasStationCode
  }

  let requestType = 'detailById';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      detailById_return(conv, result, gasStationCode)

    });

});



//전국 주유소 평균 가격 조회
app.intent(ALLROUND_INTENT, (conv, params, confirmationGranted) => {
  conv.data.fallbackCount = 0;
  console.log("ALLROUND_INTENT")
  console.log("confirmationGranted: ", confirmationGranted)
  console.log(params)
  if (params) { //권한 없으면 Object.keys(confirmationGranted).length === 0

    //https://developers.google.com/actions/assistant/helpers
    //위치 퍼미션 받는 intent

    // Choose one or more supported permissions to request:
    // NAME, DEVICE_PRECISE_LOCATION, DEVICE_COARSE_LOCATION
    const options = {
      context: ' ',
      // Ask for more than one permission. User can authorize all or none.
      permissions: ['DEVICE_PRECISE_LOCATION'],
    };
    conv.ask(new Permission(options));

  } else { // 없으면 권한 얻기
    const latitude = conv.device.location.coordinates.latitude
    const longitude = conv.device.location.coordinates.longitude
    console.log(latitude);
    console.log(longitude);

    var from = 'WGS84'
    var to = 'TM128'

    proj4.defs('WGS84', "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
    proj4.defs('TM128', '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43');

    var xy = [longitude, latitude];
    var wgs84ToKATEC = proj4(from, to, xy); // WGS84 => TM128

    //json 형태로 보내기
    let insertData = {
      'x': wgs84ToKATEC[0],
      'y': wgs84ToKATEC[1]
    }

    let requestType = 'aroundAll';

    let displayText = '';
    let speechText = '';

    let imageLink = '';
    let text = '';
    let title = '';
    let subtitle = ''
    let suggestionList = suggestions;

    //request
    return asyncTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));
        list_return(conv, result, requestType)

      }); //async
  }

});



//이벤트에 actions_intent_PERMISSION넣기
//위치정보 권한 수락 YES
app.intent(ALLROUND_INTENT_YES, (conv, params, confirmationGranted) => {
  console.log("ALLROUND_INTENT_YES")
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
    console.log(params)
    console.log(confirmationGranted)
    const latitude = conv.device.location.coordinates.latitude
    const longitude = conv.device.location.coordinates.longitude
    console.log(latitude);
    console.log(longitude);

    var from = 'WGS84'
    var to = 'TM128'

    proj4.defs('WGS84', "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
    proj4.defs('TM128', '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43');

    var xy = [longitude, latitude];
    var wgs84ToKATEC = proj4(from, to, xy); // WGS84 => TM128

    //json 형태로 보내기
    let insertData = {
      'x': wgs84ToKATEC[0],
      'y': wgs84ToKATEC[1]
    }


    let requestType = 'aroundAll';

    let displayText = '';
    let speechText = '';

    let imageLink = '';
    let text = '';
    let title = '';
    let subtitle = ''
    let suggestionList = suggestions;

    //request
    return asyncTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));
        list_return(conv, result, requestType)

      }); //async


  } //if


}); // ALLROUND_INTENT_YES

//actions_intent_PERMISSION
//ALLROUND_INTENT_NO
app.intent(ALLROUND_INTENT_NO, (conv, params, confirmationGranted) => {
  conv.data.fallbackCount = 0;
  console.log("ALLROUND_INTENT_NO")
  console.log("confirmationGranted: ", confirmationGranted)
  conv.followup("start");

  //    //ask
  //    conv.ask(new SimpleResponse({
  //        speech: '권한이 없습니다.',
  //        text:  '권한이 없습니다.',
  //    }));
  //    conv.ask(new Suggestions(suggestionChipNew));
  //    conv.ask(new BasicCard({
  //        text: text,
  //        subtitle: subtitle,
  //        title: title,
  //        image: new Image({
  //            url: imageLink,
  //            alt: '이미지',
  //        }),
  //    }));

}); // ALLROUND_INTENT_NO



// SEARCHID_GASSTATION_INTENT
app.intent(SEARCHID_GASSTATION_INTENT, (conv) => {
  console.log("SEARCHID_GASSTATION_INTENT");

  // let text
  let displayText = '아이디로 검색하는 메뉴입니다. 아래의 칩처럼 주유소 고유 아이디를 자판기로 입력해주세요.';
  let speechText = displayText;
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionChipNew = ['A0000069를 검색']

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionChipNew));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));

}); //SEARCHID_GASSTATION_INTENT

//아이디 별 주유소 자세한 정보 검색
app.intent(SEARCHID_GASSTATION2_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  let gasStationCode = conv.parameters['any'];

  //json 형태로 보내기
  let insertData = {
    id: gasStationCode
  }

  let requestType = 'detailById';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      detailById_return(conv, result, gasStationCode)

    });

});


// SEARCH_AVG_SIDO_INTENT
app.intent(SEARCH_AVG_SIDO_INTENT, (conv) => {
  console.log("SEARCH_AVG_SIDO_INTENT");

  // let text
  let displayText = '시도별 이름으로 평균 가격을 알려주는 메뉴입니다. "서울의 휘발유 평균가 검색" 혹은 "부산의 평균가 검색"  처럼 시도와 연료 종류 이름을 같이 알려주세요. 또한 입력하는 방법은 아래의 칩을 참조해주세요.';
  let speechText = displayText;
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionChipNew = ['서울의 휘발유 평균가', '부산의 디젤 평균가', '전라북도의 부탄 가격']

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionChipNew));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));

}); //SEARCH_AVG_SIDO_INTENT


//SEARCH_AVG_SIDO2_INTENT
app.intent(SEARCH_AVG_SIDO2_INTENT, (conv) => {
  console.log('SEARCH_AVG_SIDO2_INTENT')
  conv.data.fallbackCount = 0;

  const sido = conv.parameters['cityBig'];
  const prodcd = conv.parameters['oilType'];

  //json 형태로 보내기
  let insertData = {
    sido: sido,
    prodcd: prodcd
  }

  let requestType = 'avgSidoPrice';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      avgSido_return(conv, result)

    });

}); // SEARCH_AVG_SIDO2_INTENT

//AVG_SIDO_INTENT
app.intent(AVG_SIDO_INTENT, (conv) => {
  conv.data.fallbackCount = 0;
  const sido = conv.parameters['cityBig'];
  const prodcd = conv.parameters['oilType'];

  //json 형태로 보내기
  let insertData = {
    sido: sido,
    prodcd: prodcd
  }

  let requestType = 'avgSidoPrice';
  //request
  return asyncTask(insertData, requestType)
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));
      avgSido_return(conv, result)

    });

}); // AVG_SIDO_INTENT



//2~30까지 가능
//REF: https://developers.google.com/actions/assistant/responses#list
app.intent(OPTION_SELECT, (conv, params, option) => {
  conv.data.fallbackCount = 0;
  const selectGasStation = conv.data.selectGasStation;

  let displayText = '죄송합니다. 화면을 출력할 수 있는 기기가 아닙니다. 다른 명령을 말해주세요.';
  let speechText = '';
  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let suggestionList = suggestions;
  //위도 ,경도 ,Zoom 범위


  if (option && selectGasStation.hasOwnProperty(option)) {

    const name = selectGasStation[option].gasStationName;
    const gasStationCode = selectGasStation[option].gasStationCode;
    const price = selectGasStation[option].price;
    const gis_X = selectGasStation[option].gis_X;
    const gis_Y = selectGasStation[option].gis_Y;
    const distance = selectGasStation[option].distance;
    imageLink = selectGasStation[option].brandImage;

    let insertData = {
      id: gasStationCode
    }
    const requestType = 'detailById';
    return asyncTask(insertData, requestType)
      .then(function(result) {
        //로그 확인용
        console.log("result : " + JSON.stringify(result));
        detailById_return(conv, result, gasStationCode)

      });

  }




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

// SUPPPORT_COMMAND
app.intent(SUPPPORT_COMMAND, (conv) => {
  console.log("SUPPPORT_COMMAND");

  // let text
  let displayText = '지원되는 메뉴는 다음과 같습니다. \n* 내 위치의 최저가 주유소 \n* 전국 평균가격 조회 \n* 성남시(일반시,군,구)의 주유소 최저가격 \n* 서울특별시(광역시,도)의 주유소 평균가격 을 지원하고 있습니다.';
  let speechText = '지원되는 메뉴는 다음과 같습니다. 내 위치의 최저가 주유소, 전국 평균가격 조회 , 시군구의 주유소 최저가격 , 시도의 주유소 평균가격 을 지원하고 있습니다.';
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

  let displayText = appTitle + '는 전국의 주유소 정보와 현위치의 최저가를 알 수 있습니다.';
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
exports.oilprice = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
