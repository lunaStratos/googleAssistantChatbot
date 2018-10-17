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
  Button
} = require('actions-on-google');
const functions = require('firebase-functions');
const requests = require('request'); // request
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
const Promise = require('promise');

// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const STATIONINFO = 'stationInfo';

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const HELP = 'help';
const EXIT = 'exit';

//entity name
const STATION = 'station';


//for chip
let suggestions = ['메뉴얼', '시청역', '을지로입구', '끝내기'];
let endText = " 다음 질문을 해 주세요.";
//http://data.seoul.go.kr/dataList/datasetView.do?infId=OA-118&srvType=S&serviceKind=1
//2-1-3-4-5-6-7-8->
let arrays = [{
  code: "201",
  name: "시청 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0201.jpg",
  infoText: "시청 역은 개찰구 밖 9번출구 쪽, 4번출구 부근, 그리고 개찰구 안 1-2호선 환승통로에 있습니다.",
  title: "시청 역",
  etc: ''
}, {
  code: "202",
  name: "을지로입구 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0202.jpg",
  infoText: "을지로입구 역은 개찰구 밖 을지로 지하보도 쪽에 있습니다.",
  title: "을지로입구 역",
  etc: ''
}, {
  code: "203",
  name: "을지로3가 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0203.jpg",
  infoText: "을지로3가 역은 개찰구 밖 2호선 고객안내센터 오른편 쪽과 3호선으로 가는 쪽에 있습니다.",
  title: "을지로3가 역",
  etc: ''
}, {
  code: "204",
  name: "을지로4가 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0204.jpg",
  infoText: "을지로4가 역은 개찰구 밖 5,6번출구 쪽과 2호선 고객안내센터 맞은편에 있습니다.",
  title: "을지로4가 역",
  etc: ''
}, {
  code: "205",
  name: "동대문역사문화공원 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0205.jpg",
  infoText: "동대문역사문화공원 역은 개찰구 밖 6,7번 출구 쪽, 4호선과 승강장(개찰구 안)과 역무실(개찰구 밖) 그리고 2호선 역무실(개찰구 안) 쪽에 있습니다.",
  title: "동대문역사문화공원 역",
  etc: ''
}, {
  code: "207",
  name: "상왕십리 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0207.jpg",
  infoText: "상왕십리 역은 고객안내센터 부근에 있습니다.",
  title: "상왕십리 역",
  etc: ''
}, {
  code: "209",
  name: "한양대 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0209.jpg",
  infoText: "한양대 역은 개찰구 밖 고객안내센터 맞은편에 있습니다.",
  title: "한양대 역",
  etc: ''
}, {
  code: "210",
  name: "뚝섬 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0210.jpg",
  infoText: "뚝섬 역은 개찰구 밖 고객안내센터 부근에 있습니다.",
  title: "뚝섬 역",
  etc: ''
}, {
  code: "212",
  name: "건대입구 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0212.jpg",
  infoText: "건대입구 역은 개찰구 밖 고객안내센터 부근에 있습니다.",
  title: "건대입구 역",
  etc: ''
}, {
  code: "213",
  name: "구의 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0213.jpg",
  infoText: "구의 역은 4번출구 쪽에 있습니다.",
  title: "구의 역",
  etc: ''
}, {
  code: "214",
  name: "강변 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0214.jpg",
  infoText: "강변 역은 개찰구 밖 고객안내센터 맞은편 쪽에 있습니다.",
  title: "강변 역",
  etc: ''
}, {
  code: "215",
  name: "잠실나루 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0215.jpg",
  infoText: "잠실나루 역은 개찰구 밖 고객안내센터 맞은편 쪽에 있습니다.",
  title: "잠실나루 역",
  etc: ''
}, {
  code: "217",
  name: "잠실새내 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0217.jpg",
  infoText: "잠실새내 역은 개찰구 밖 2번과 7번출구 사이에 있습니다.",
  title: "잠실새내 역",
  etc: ''
}, {
  code: "219",
  name: "삼성 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0219.jpg",
  infoText: "삼성 역은 개찰구 밖 고객안내센터 오른편 쪽에 있습니다.",
  title: "삼성 역",
  etc: ''
}, {
  code: "220",
  name: "선릉 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0220.jpg",
  infoText: "선릉 역은 개찰구 밖 분당선 고객안내센터 쪽과 1번출구 쪽에 있습니다.",
  title: "선릉 역",
  etc: ''
}, {
  code: "222",
  name: "강남 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0222.jpg",
  infoText: "강남 역은 많이 있으니 안심하세요.",
  title: "강남 역",
  etc: ''
}, {
  code: "223",
  name: "교대 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0223.jpg",
  infoText: "교대 역은 개찰구 밖 1,2,7,8 출구 쪽에 있습니다.",
  title: "교대 역",
  etc: ''
}, {
  code: "224",
  name: "서초 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0224.jpg",
  infoText: "서초 역은 4번출구 쪽에 있습니다.",
  title: "서초 역",
  etc: ''
}, {
  code: "225",
  name: "방배 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0225.jpg",
  infoText: "방배 역은 개찰구 밖 2호선 고객안내센터 부근에 있습니다.",
  title: "방배 역",
  etc: ''
}, {
  code: "226",
  name: "사당 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0226.jpg",
  infoText: "사당 역은 개찰구 밖 3,4번출구 쪽과 9번출구 1,2와 7,8 출구 쪽에 있습니다.",
  title: "사당 역",
  etc: ''
}, {
  code: "228",
  name: "서울대입구 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0228.jpg",
  infoText: "서울대입구 역은 개찰구 안 1,2,8,7번 출구 쪽에 있습니다.",
  title: "서울대입구 역",
  etc: ''
}, {
  code: "229",
  name: "봉천 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0229.jpg",
  infoText: "봉천 역은 개찰구 밖 고객안내센터 맞은편 왼쪽에 있습니다.",
  title: "봉천 역",
  etc: ''
}, {
  code: "230",
  name: "신림 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0230.jpg",
  infoText: "신림 역은 개찰구 밖 4번출구 쪽의 오른편에 있습니다.",
  title: "신림 역",
  etc: ''
}, {
  code: "231",
  name: "신대방 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0231.jpg",
  infoText: "신대방 역은 개찰구 안 1,4번출구 쪽의 역무실 맞은 편에 있습니다.",
  title: "신대방 역",
  etc: ''
}, {
  code: "232",
  name: "구로디지털단지 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0232.jpg",
  infoText: "구로디지털단지 역은 개찰구 안 고객안내센터 맞은 편에 있습니다.",
  title: "구로디지털단지 역",
  etc: ''
}, {
  code: "234",
  name: "신도림 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0234.jpg",
  infoText: "신도림 역은 1번출구 쪽에 있습니다.",
  title: "신도림 역",
  etc: ''
}, {
  code: "235",
  name: "문래 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0235.jpg",
  infoText: "문래 역은 개찰구 밖 4번출구 쪽에 있습니다.",
  title: "문래 역",
  etc: ''
}, {
  code: "236",
  name: "영등포구청 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0236.jpg",
  infoText: "영등포구청 역은 개찰구 밖 7번출구 쪽과, 2호선 고객안내센터 맞은편에 있습니다.",
  title: "영등포구청 역",
  etc: ''
}, {
  code: "237",
  name: "당산 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0237.jpg",
  infoText: "당산 역은 개찰구 안 2호선 고객안내센터 반대편과, 9호선 개찰구 쪽에 있습니다.",
  title: "당산 역",
  etc: ''
}, {
  code: "239",
  name: "홍대입구 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0239.jpg",
  infoText: "홍대입구 역은 개찰구 밖 2호선 대합실로 가는 쪽에 있습니다.",
  title: "홍대입구 역",
  etc: ''
}, {
  code: "240",
  name: "신촌 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0240.jpg",
  infoText: "신촌 역은 2호선 고객안내센터 쪽에 반대편에 있습니다.",
  title: "신촌 역",
  etc: ''
}, {
  code: "241",
  name: "이대 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0241.jpg",
  infoText: "이대 역은 개찰구 밖 5번출구 쪽에 있습니다.",
  title: "이대 역",
  etc: ''
}, {
  code: "242",
  name: "아현 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0242.jpg",
  infoText: "아현 역은 개찰구 밖 나가는 곳 반대편 쪽에 있습니다.",
  title: "아현 역",
  etc: ''
}, {
  code: "243",
  name: "충정로 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0243.jpg",
  infoText: "충정로 개찰구 밖8,9번 출구쪽과 5호선 환승으로 가는 안쪽에",
  title: "충정로 역",
  etc: ''
}, {
  code: "211-2",
  name: "신답 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0245.jpg",
  infoText: "신답 역은 개찰구 안 개찰구 쪽에 있습니다. 개찰구가 하나밖에 없으니 쉽게 찾을 수 있습니다.",
  title: "신답 역",
  etc: ''
}, {
  code: "211-4",
  name: "신설동 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0246.jpg",
  infoText: "신설동 역은 7,8,9출구 개찰구 안 쪽, 개찰구 밖 1호선 고객안내센터 쪽에 있습니다.",
  title: "신설동 역",
  etc: ''
}, {
  code: "234-1",
  name: "도림천 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0247.jpg",
  infoText: "도림천역은 개찰구 밖 앞 쪽에 있습니다. 개찰구가 하나밖에 없으니 쉽게 찾을 수 있습니다.",
  title: "도림천 역",
  etc: ''
}, {
  code: "234-2",
  name: "양천구청 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0248.jpg",
  infoText: "양천구청 역은 도림천 행 계단 쪽에 있습니다.",
  title: "양천구청 역",
  etc: ''
}, {
  code: "234-3",
  name: "신정네거리 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0249.jpg",
  infoText: "신정네거리 역은 개찰구 밖 2번과 3번 출구 쪽에 있습니다.",
  title: "신정네거리 역",
  etc: ''
}, {
  code: "211-3",
  name: "용두 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0250.jpg",
  infoText: "용두 역은 신설동 방향과 신답방향 둘다 개찰구 쪽에 있습니다.",
  title: "용두 역",
  etc: ''
}, {
  code: "234-4",
  name: "까치산 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/in_2519.jpg",
  infoText: "까치산 역은 4번출구 쪽에 있습니다.",
  title: "까치산 역",
  etc: ''
}, {
  code: "206",
  name: "신당 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0206.jpg",
  infoText: "신당 역은 개찰구밖 2호선 고객안내센터 맞은편과 9번출구 쪽에 있습니다.",
  title: "신당 역",
  etc: ''
}, {
  code: "211",
  name: "성수 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0211.jpg",
  infoText: "성수 역은 개찰구 안 고객센터 쪽에 있습니다.",
  title: "성수 역",
  etc: ''
}, {
  code: "216",
  name: "잠실 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0216.jpg",
  infoText: "잠실 역은 개찰구 밖 11번출구, 2번출구 쪽에 있습니다.",
  title: "잠실 역",
  etc: ''
}, {
  code: "221",
  name: "역삼 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0221.jpg",
  infoText: "역삼 역은 개찰구 안 2호선 고객센터 쪽에 있습니다.",
  title: "역삼 역",
  etc: ''
}, {
  code: "227",
  name: "낙성대 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0227.jpg",
  infoText: "낙성대 역은 개찰구 밖 5호선 쪽에 있습니다.",
  title: "낙성대 역",
  etc: ''
}, {
  code: "233",
  name: "대림 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0233.jpg",
  infoText: "대림 개찰구 밖 9번출구쪽, 개찰구 안 2호선 고객센터 앞에 있습니다. ",
  title: "대림 역",
  etc: ''
}, {
  code: "208",
  name: "왕십리 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0208.jpg",
  infoText: "왕십리 역은 화장실이 개찰구 안에도 있고 밖에도 많습니다. 정말로요.",
  title: "왕십리 역",
  etc: ''
}, {
  code: "218",
  name: "종합운동장 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0218.jpg",
  infoText: "종합운동장 역은 개찰구 밖 1,2번 출구와 5번출구 쪽에 있습니다.",
  title: "종합운동장 역",
  etc: ''
}, {
  code: "238",
  name: "합정 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0238.jpg",
  infoText: "합정 역은 개찰구 밖8번출구 앞과 당산역 방향의 1234번 출구 쪽 개찰구 안에 있습니다.",
  title: "합정 역",
  etc: ''
}, {
  code: '211-1',
  name: "용답 역",
  imageLink: "http://www.seoulmetro.co.kr/web_upload/cyberstation/in/station_0244.jpg",
  infoText: "용답 역엔 1,2 번 출구가 있고 그 사이에 있습니다.",
  title: "용답 역",
  etc: ''
}];
//서울시 역외부코드로 지하철역 정보 검색
//http://data.seoul.go.kr/dataList/datasetView.do?infId=OA-120&srvType=A&serviceKind=1&currentPageNo=1
// getStationXmlConnect
function getStationXmlConnect(code, callback) {
  var url = "http://openapi.seoul.go.kr:8088/sample/xml/SearchSTNInfoByFRCodeService/1/5/" + code;
  console.log("station name: " + code);
  console.log("url: " + url);

  // Get xml data
  requests({
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    }
  }, function(err, resp, body) {
    if (err) {
      callback(err, {
        code: 400,
        name: '',
        status: 'fail'
      });
      return;
    }
    // xml parsing section
    let xml = body.toString();
    console.log("body: " + body.toString());
    parser.parseString(xml, function(err, result) {
      console.log(result);
      var original = result.SearchSTNInfoByFRCodeService.row;;
      var status = result.SearchSTNInfoByFRCodeService.RESULT[0].CODE[0];
      console.log("original: " + original[0].TOILET[0]);
      console.log("status: " + status);

      if (status === 'INFO-000') {

        //search arrays
        let getValue = arrays.find(item => {
          return item.code == code;
        });

        callback(null, {
          code: 200,
          data: original[0].TOILET[0],
          status: 'success',
          imageLink: getValue.imageLink,
          title: getValue.title,
          name: getValue.name,
          infoText: getValue.infoText,
          staionCode: getValue.code
        });
      } else {
        callback(err, {
          code: 400,
          name: '',
          status: 'fail'
        });
      }

    });


  });

} //getStationXmlConnect
const asyncTask = (stationName) => new Promise(function(resolved, rejected) {
  getStationXmlConnect(stationName, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});


//promiseXmlConnect
function promiseXmlConnect(stationName) {
  return new Promise(function(resolved, rejected) {
    getStationXmlConnect(stationName, function(err, result) {
      if (err) {
        rejected(err);
      } else {
        resolved(result);
      }
    });
  });
} //promiseXmlConnect


// Welcome intent.
// V2, It use intent name, not action name.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;
  // for debug. If you want debug, copy and paste.
  // conv is json data.
  console.log("conv: " + JSON.stringify(conv));
  // if you want use to action name, use below code. : conv.action
  console.log("action: " + JSON.stringify(conv.action));

  // let text
  let displayText = '';
  let speechText = '';
  let name = '엘 프사이 콩그루 입니다.';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/stationImage/welcome.png';
  let infoText = '엘 프사이 콩그루에 오신것을 환영합니다.';
  let code = "";
  let title = "";
  let etc = '';

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";

  if (conv.user.last.seen) {
    displayText = "다시 엘 프사이 콩그루에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠? 바로 시작하죠. 역 이름을 말하면 그곳의 위치를 알려줍니다. 자 말하세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "9s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  } else {
    displayText = "엘 프사이 콩그루에 오신것을 환영합니다. 이 앱은 서울 지하철 2호선의 화장실 위치를 알려주는 앱입니다. 급하니 바로 시작하죠. 역 이름을 말하면 그곳의 위치를 알려줍니다. 자 말하세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "11s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }


  

  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;
  conv.data.imageLink = imageLink;
  conv.data.name = name;
  conv.data.infoText = infoText;
  conv.data.title = title;
  conv.data.etc = etc;
  conv.data.flow = 'none';

  let previousArray = [];
  //이전 재생을 위한 arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'imageLink': imageLink,
    'name': name,
    'infoText': infoText,
    'title': title,
    'etc': etc
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
    text: infoText,
    subtitle: '',
    title: name,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));

});


//RAMEN Intent
app.intent(STATIONINFO, (conv) => {
  console.log("STATIONINFO");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]
  const stationName = conv.parameters[STATION];

  console.log("stationName data: " + stationName);
  //v1: conv.data.name -> v2: conv.data.pref

  // for contexts make switch method.
  // ref: https://dialogflow.com/docs/contexts
  // conv.contexts.set("name", 1)
  // name = contexts's name
  // number = lifespan
  // conv.data.xxx == save area, for next flow conversation.

  //speech area
  let displayText = '';
  let speechText = '';
  //text area
  let name = '';
  let imageLink = '';
  let infoText = '';
  let code = "";
  let title = "";
  let etc = '';


  return asyncTask(stationName)
    .then(function(result) {

      console.log("result : " + JSON.stringify(result));

      if (result.code != 200) {
        //문제있음
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
        infoText = "서버연결 에러";
        name = "서버연결 에러";
        displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText;
        speechText = displayText;
        //ask

      } else { // no problem

        let results = result.data;
        //another data save
        imageLink = result.imageLink;
        name = result.name;
        code = result.stationCode; // noen
        infoText = result.infoText;

        console.log("let results : " + results);
        console.log("let results stringify : " + JSON.stringify(results));

        //text make
        displayText = name + '의 화장실은 ' + results + ' 입니다.' + endText;
        speechText = displayText;
        title = '현재 ' + name + '의 화장실 위치 자세히 보기';

        console.log("displayText : " + displayText);

        //save data : for previous and repeat
        conv.data.displayText = displayText;
        conv.data.speechText = speechText;
        conv.data.imageLink = imageLink;
        conv.data.name = name;
        conv.data.infoText = infoText;
        conv.data.title = title;
        conv.data.etc = etc;
        conv.data.flow = 'none';

        let previousArray = conv.data.previous;
        if (previousArray === undefined) {
          previousArray = [];
        }
        //previous arrays
        let previousJson = {
          'displayText': displayText,
          'speechText': speechText,
          'imageLink': imageLink,
          'name': name,
          'infoText': infoText,
          'title': title,
          'etc': etc
        }
        previousArray.push(previousJson);
        conv.data.previous = previousArray;

      }

      //ask
      conv.ask(displayText);
      conv.ask(new Suggestions(suggestions));
      conv.ask(new BasicCard({
        text: infoText,
        subtitle: '',
        title: name,
        image: new Image({
          url: imageLink,
          alt: '이미지',
        }),
        buttons: new Button({ // Wrapper for complex sub Objects
          title: title,
          url: imageLink,
        })
      })); //ask

    });



});


// =======================================================================

// FALLBACK
app.intent(FALLBACK, (conv) => {
  console.log("FALLBACK");
  // let text
  let displayText = '';
  let speechText = '';

  let name = '죄송합니다';
  let imageLink = '';
  let infoText = '죄송합니다. 인식을 하지 못했습니다';
  let title = "";
  let etc = '';

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count === 1) {
    displayText = '제가 잘 모르는 역 입니다. "도움말"을 참조해 보세요. 다시 말해주세요.';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
    speechText = displayText;
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
  } else if (count === 2) {
    displayText = '죄송합니다. 혹시 앱 데스크립션을 보셨나요? 설명에 어떤 역이 가능한지 나와있습니다. 또 추가가 되었으면 하는 역이 있다면 메일로 알려주세요! 자 다시 말해주세요.';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
    speechText = displayText;
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
  } else if (count > 2) {
    displayText = '정말로 죄송합니다. 제가 잘 모르는 역이거나 인식이 실패했습니다. 앱을 종료하겠습니다. ';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png";
    speechText = displayText;
    //ask
    conv.close(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.close(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  }

});


// HELP
app.intent(HELP, (conv) => {
  console.log("HELP");
  conv.data.fallbackCount = 0;

  // let text
  let displayText = '엘 프사이 콩그루는 서울 지하철역의 화장실이 개찰구 안 혹은 밖인지, 그리고 위치와 약도까지 알려주는 기능을 가지고 있습니다. 자세히 보기를 누르면 그림을 확대하여 볼 수도 있습니다. 다음 질문을 해 주세요.';
  let speechText = '';

  let name = '설명서';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let infoText = '설명서';
  let title = "";
  let etc = '';

  speechText = displayText;

  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;
  conv.data.imageLink = imageLink;
  conv.data.name = name;
  conv.data.infoText = infoText;
  conv.data.title = title;
  conv.data.etc = etc;
  conv.data.flow = 'help';

  let previousArray = conv.data.previous;
  //이전 재생을 위한 arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'imageLink': imageLink,
    'name': name,
    'infoText': infoText,
    'title': title,
    'etc': etc
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
    text: infoText,
    subtitle: '',
    title: name,
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
  console.log(previousArray);
  console.log(previousState);

  let displayText = previousArray[previousState].displayText;
  let speechText = previousArray[previousState].speechText;

  // let text
  let name = previousArray[previousState].name;
  let imageLink = previousArray[previousState].imageLink;
  let infoText = previousArray[previousState].infoText;
  let title = previousArray[previousState].title;
  let etc = previousArray[previousState].etc;



  if (previousState == 0) { // 처음이라면
    //save data : for previous and repeat
    conv.data.displayText = displayText;
    conv.data.speechText = speechText;
    conv.data.imageLink = imageLink;
    conv.data.name = name;
    conv.data.infoText = infoText;
    conv.data.title = title;
    conv.data.etc = etc;
    conv.data.flow = 'help';

  } else { // 처음이 아니라면

    //마지막 array제거 후 저장하기
    previousArray.pop();
    //제거된 array의 -1인 길이를 가져와야 한다.
    //-1을 안하면 방금 말한 데이터를 가져오기 때문.
    previousState = previousArray.length - 1;

    displayText = previousArray[previousState].displayText;
    speechText = previousArray[previousState].speechText;

    // let text
    name = previousArray[previousState].name;
    imageLink = previousArray[previousState].imageLink;
    infoText = previousArray[previousState].infoText;
    title = previousArray[previousState].title;
    etc = previousArray[previousState].etc;

    //last save
    conv.data.previous = previousArray;

    //save data : for previous and repeat
    conv.data.displayText = displayText;
    conv.data.speechText = speechText;
    conv.data.imageLink = imageLink;
    conv.data.name = name;
    conv.data.infoText = infoText;
    conv.data.title = title;
    conv.data.etc = etc;
    conv.data.flow = 'help';

  }

  if (title == "") {

    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } else { //URL
    //ask
    conv.ask(displayText);
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
      buttons: new Button({ // Wrapper for complex sub Objects
        title: title,
        url: imageLink,
      })
    })); //ask

  }


});

// REPEAT
app.intent(REPEAT, (conv) => {
  console.log("REPEAT");
  conv.data.fallbackCount = 0;

  let displayText = conv.data.displayText;
  let speechText = conv.data.speechText;

  // let text
  let name = conv.data.name;
  let imageLink = conv.data.imageLink;
  let infoText = conv.data.infoText;
  let title = conv.data.title;
  let etc = conv.data.etc;


  if (title == "") {

    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } else { //URL
    //ask
    conv.ask(displayText);
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: infoText,
      subtitle: '',
      title: name,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
      buttons: new Button({ // Wrapper for complex sub Objects
        title: title,
        url: imageLink,
      })
    })); //ask

  }

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
  let infoText = '앱을 종료합니다.';
  let title = "";
  let etc = '';

  speechText = displayText;

  //ask
  conv.close(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }), new BasicCard({
    text: infoText,
    subtitle: '',
    title: name,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
});

// Action name is different to method name.
// my action name is dialogv2. So If you want another name, please rename it.
// action name: dialogv2 => change your action name.
exports.elpsycongroo = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment