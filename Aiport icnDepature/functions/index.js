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
const TERMINALALLINFO = 'terminalAllInfo';
const TERMINALGATEINFO = 'terminalGateInfo';


//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const HELP = 'help';
const EXIT = 'exit';

//entity name
const TERMINAL = 'terminal';
const GATE = 'gate';


//for chip
let suggestions = ['메뉴얼', '터미널1', '터미널2'];
let endText = " 다음 질문을 해 주세요.";
//http://data.seoul.go.kr/dataList/datasetView.do?infId=OA-118&srvType=S&serviceKind=1

let arrays = [{
  code: "터미널1게이트1", // 건드리지 말것
  name: "터미널1 게이트1",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-1.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널1의 게이트1 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널1게이트2",
  name: "터미널1 게이트2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-2.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널1의 게이트2 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널1게이트3",
  name: "터미널1 게이트3",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-3.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널1의 게이트3 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널1게이트4",
  name: "터미널1 게이트4",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-4.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널1의 게이트4 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널1게이트5",
  name: "터미널1 게이트5",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-5.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널1의 게이트5 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널1게이트6",
  name: "터미널1 게이트5",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1-6.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널1의 게이트6 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널2게이트1",
  name: "터미널2 게이트1",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2-1.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널2의 게이트1 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널2게이트2",
  name: "터미널2 게이트2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2-2.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널2의 게이트2 대기인원과 혼잡도",
  etc: ''
}, {
  code: "터미널2게이트3",
  name: "터미널2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널2",
  etc: '더미'
}, {
  code: "터미널2게이트4",
  name: "터미널2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널2",
  etc: '더미'
}, {
  code: "터미널2게이트5",
  name: "터미널2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널2",
  etc: '더미'
}, {
  code: "터미널2게이트6",
  name: "터미널2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
  infoText: "게이트의 위치는 사진과 같습니다.",
  title: "터미널2",
  etc: '더미'
}, {
  code: "터미널1",
  name: "터미널1",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal1.jpg",
  infoText: "터미널의 위치는 사진과 같습니다.",
  title: "터미널1",
  etc: ''
}, {
  code: "터미널2",
  name: "터미널2",
  imageLink: "https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/terminal2.jpg",
  infoText: "터미널의 위치는 사진과 같습니다.",
  title: "터미널2",
  etc: ''
}];

//api 설명 http://openapi.airport.kr/pubc/pubr/cmm/CMPubrHome/viewRQDevGuideList.do

// getTerminalGateXmlConnect
function getTerminalGateXmlConnect(code, gateNum, callback) {

  console.log("code: " + code);
  console.log("gateNum: " + gateNum);

  let insertTerminal = '';

  //터미널에 따른 링크 생성시 터미널 번호 붙임
  if (code == "터미널1" || code == '') {
    insertTerminal = 1;
  } else {
    insertTerminal = 2;
  }
  var url = "http://openapi.airport.kr/openapi/service/StatusOfDepartures/getDeparturesCongestion?ServiceKey=서비스&terno=" + insertTerminal; //서비스키 입력
  console.log("terminal 1,2 : " + insertTerminal); //터미널
  console.log("url: " + url);

  let names = code + gateNum;
  if (names == '') {
    names = "터미널1"
  }

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
      console.log(JSON.stringify(result));
      //       < SearchSTNInfoByFRCodeService >
      // <list_total_count>1</list_total_count>
      // <RESULT>
      // <CODE>INFO-000</CODE>
      // <MESSAGE>정상 처리되었습니다</MESSAGE>
      // </RESULT>
      var original = result.response.body[0].items[0].item[0];
      var status = result.response.header[0].resultCode[0];
      console.log("status: " + status);

      if (status === '00') { //00 에러없음

        //search arrays
        let getValue = arrays.find(item => {
          console.log(names);
          return item.code == names;
        });

        console.log(JSON.stringify(getValue));

        if (insertTerminal == '1') {
          callback(null, {
            code: 200,
            gateinfo1: original.gateinfo1[0],
            gateinfo2: original.gateinfo2[0],
            gateinfo3: original.gateinfo3[0],
            gateinfo4: original.gateinfo4[0],
            status: 'success',
            cgtdt: original.cgtdt[0],
            cgthm: original.cgthm[0],
            imageLink: getValue.imageLink,
            title: getValue.title,
            name: getValue.name,
            infoText: getValue.infoText,
            staionCode: getValue.code
          });
        } else { //terminal2
          callback(null, {
            code: 200,
            gateinfo1: original.gateinfo1[0],
            gateinfo2: original.gateinfo2[0],
            status: 'success',
            cgtdt: original.cgtdt[0],
            cgthm: original.cgthm[0],
            imageLink: getValue.imageLink,
            title: getValue.title,
            name: getValue.name,
            infoText: getValue.infoText,
            staionCode: getValue.code
          });
        }
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
const asyncTask = (stationName, gateNum) => new Promise(function(resolved, rejected) {
  getTerminalGateXmlConnect(stationName, gateNum, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});


//promiseXmlConnect
function promiseXmlConnect(stationName, gateNum) {
  return new Promise(function(resolved, rejected) {
    getTerminalGateXmlConnect(stationName, gateNum, function(err, result) {
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
  console.log(conv.user.locale);
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
  let name = '인천공항 출국장 입니다.';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/incheonAirWait/airportImage.jpg';
  let infoText = '인천공항 출국장에 오신것을 환영합니다.';
  let code = "";
  let title = "";
  let etc = '';

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";

  if (conv.user.last.seen) {
    displayText = "다시 인천공항 출국장에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠? 공항터미널 이름을 말하면 혼잡도를 알려줍니다. 자 말하세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "9s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  } else {
    displayText = "인천공항 출국장에 오신것을 환영합니다. 이 앱은 인천국제공항의 출국장 혼잡도를 알려주는 앱입니다. '터미널1' 혹은 '터미널2'를 말하면 터미널 출국장의 전체 상황을 알 수 있습니다. 자 말하세요.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "16s"><audio src="' + welcomeSound + '"/></media>' +
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


//터미널 전체 정보 Intent
app.intent(TERMINALALLINFO, (conv) => {
  console.log("TERMINALALLINFO");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]
  const terminalName = conv.parameters[TERMINAL];
  let gateNum = "";


  console.log("terminalName data: " + terminalName);
  //v1: app.data.name -> v2: conv.data.pref

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


  return asyncTask(terminalName, gateNum)
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

        //gate terminal 1: 1~4 terminal2: 1~2
        let gateinfo1 = result.gateinfo1;
        let gateinfo2 = result.gateinfo2;
        let gateinfo3 = '';
        let gateinfo4 = '';


        let cgtdt = result.cgtdt; //date
        let cgthm = result.cgthm; // time: ex 2305

        //another data save
        imageLink = result.imageLink;
        name = result.name;
        code = result.stationCode; // noen
        infoText = result.infoText;

        console.log("let result : " + result);
        console.log("let result stringify : " + JSON.stringify(result));

        //text make
        if (terminalName == '터미널1' || terminalName == '') {
          gateinfo3 = result.gateinfo3;
          gateinfo4 = result.gateinfo4;
          displayText = name + '의 전체 대기인원은 \n게이트2 : ' + gateinfo1 + '명 \n게이트3 : ' + gateinfo2 + '명 \n게이트4 : ' + gateinfo3 + '명 \n게이트5 : ' + gateinfo4 + '명 입니다. ' + endText;

        } else {
          displayText = name + '의 전체 대기인원은 \n게이트1 : ' + gateinfo1 + '명 \n게이트2 : ' + gateinfo2 + '명 입니다. ' + endText;

        }



        speechText = displayText;
        title = '현재 ' + name + '의 지도 보기';

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


//터미널에 게이트 추가 정보 Intent
app.intent(TERMINALGATEINFO, (conv) => {
  console.log("TERMINALGATEINFO");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]
  const terminalName = conv.parameters[TERMINAL]; //터미널1
  const gateNum = conv.parameters[GATE]; //게이트1

  console.log("terminalName data: " + terminalName);
  console.log("gateNum data: " + gateNum);
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

  // 터미널과 게이트 넣기
  return asyncTask(terminalName, gateNum)
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

        //gate terminal 1: 1~4 terminal2: 1~2
        let gateinfo1 = result.gateinfo1;
        let gateinfo2 = result.gateinfo2;
        let gateinfo3 = '';
        let gateinfo4 = '';


        let cgtdt = result.cgtdt; //date
        let cgthm = result.cgthm; // time: ex 2305

        //another data save
        imageLink = result.imageLink;
        name = result.name;
        code = result.stationCode; // noen
        infoText = result.infoText;

        console.log("let result : " + result);
        console.log("let result stringify : " + JSON.stringify(result));


        if (terminalName === '터미널1') {
          gateinfo3 = result.gateinfo3;
          gateinfo4 = result.gateinfo4;
        }

        if (terminalName === '터미널1' && gateNum === '게이트2') {
          displayText = name + '의 대기인원은 \n' + gateinfo1 + '명 입니다. ' + endText;
        } else if (terminalName === '터미널1' && gateNum === '게이트3') {
          displayText = name + '의 대기인원은 \n' + gateinfo2 + '명 입니다. ' + endText;
        } else if (terminalName === '터미널1' && gateNum === '게이트4') {
          displayText = name + '의 대기인원은 \n' + gateinfo3 + '명 입니다. ' + endText;
        } else if (terminalName === '터미널1' && gateNum === '게이트5') {
          displayText = name + '의 대기인원은 \n' + gateinfo4 + '명 입니다. ' + endText;
        } else if (terminalName === '터미널2' && gateNum === '게이트1') {
          displayText = name + '의 대기인원은 \n' + gateinfo1 + '명 입니다. ' + endText;
        } else if (terminalName === '터미널2' && gateNum === '게이트2') {
          displayText = name + '의 대기인원은 \n' + gateinfo2 + '명 입니다. ' + endText;
        }

        if (terminalName == '터미널1' && (gateNum == '게이트1' || gateNum == '게이트6')) {
          displayText = '죄송합니다. 터미널1의 경우 ' + gateNum + '은 지원하지 않습니다. 현재 \n게이트2 : ' + gateinfo1 + '명 \n게이트3 : ' + gateinfo2 + '명 \n게이트4 : ' + gateinfo3 + '명 \n게이트5 : ' + gateinfo4 + '명 입니다. ' + endText;
        } else if (terminalName == '터미널2' && (gateNum == '게이트3' || gateNum == '게이트4' || gateNum == '게이트5' || gateNum == '게이트6')) {
          displayText = '죄송합니다. 터미널2의 경우 ' + gateNum + '은 지원하지 않습니다. 현재 \n게이트1 : ' + gateinfo1 + '명 \n게이트2 : ' + gateinfo2 + '명 입니다. ' + endText;
        }


        speechText = displayText;
        title = '현재 ' + name + '의 지도 보기';

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
    displayText = '제가 잘 모르는 말 입니다. 터미널1 처럼 말해보시거나, "도움말"을 참조해 보세요. 다시 말해주세요.';
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
    displayText = '죄송합니다. 혹시 앱 설명을 보셨나요? 현재 공항터미널은 1과 2까지만 있습니다. 자 다시 말해주세요.';
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
    displayText = '정말로 죄송합니다. 게이트를 잘못 말했거나 인식이 실패했습니다. 앱을 종료하겠습니다. ';
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
  let displayText = '인천공항 출국장 앱은 출국장의 대기인원과 위치를 알려주는 기능을 가지고 있습니다. 게이트는 터미널1은 2부터 5까지 알려드리며 터미널2는 게이트가 1과 2 전체를 알려드립니다. 앱에서 자세히 보기를 누르면 그림을 확대하여 볼 수도 있습니다. 다음 질문을 해 주세요.';
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
exports.incheonAirWait = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
