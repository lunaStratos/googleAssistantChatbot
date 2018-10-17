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
const requests = require('request')
const cheerio = require('cheerio');
const iconvlite = require('iconv-lite');
// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const SEIYU_INTENT = 'Seiyu Intent'; //회사


//basic intent : for quality
const HELP = 'help';
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const EXIT = 'exit';

//entity name
const SEIYU = 'seiyu';

//Arr
let SeiyuArray = [{
  name: 'CJ대한통운',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
}, {
  name: '',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
}, {
  name: '',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
}, {
  name: '',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
}, {
  name: '',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
}, {
  name: '',
  image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
}]

//for chip
let suggestions = ["도움말", "타무라 유카리", "스즈키 아이나", '쿠스다 아이나', '코토부키 미나코'];

function JsonParse(name, callback) {

  var encodeStr = '';
  var strUtf8Query = decodeURIComponent(name);
  var buf = iconvlite.encode(strUtf8Query, "UTF-8");
  for (var i = 0; i < buf.length; i++) {
    encodeStr += '%' + buf[i].toString('16');
  }
  encodeStr = encodeStr.toUpperCase();
  console.log(encodeStr)

  var url = "https://chocomintapi.dulcetsehr.net/1.1/list?status=0&field=name&keyword=" + encodeStr + "&sort=datetime&direction=desc&page=1";

  requests({
    method: 'GET',
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    },
    timeout: 1000 * 30
  }, function(err, res, responseBody) {
    if (err) {
      callback(err, {
        code: 400,
        status: '조회에 실패하였습니다'
      });
      return;
    }

    var currentStatus = "알수없음";
    var result = JSON.parse(responseBody.toString())
    console.log(result)
    let list0 = result.list[0];

    let status = list0.status; //1좋아함, 2싫어함 3무관심,4보;

    let name_ko = list0.name_ko;
    let office_ko = list0.office_ko;

    let name_ja = list0.name_ja;
    let office = list0.office;

    let jsonfield = {
      name: name_ko,
      name_ja: name_ja,
      status: status,
      office_ko: office_ko,
      office: office

    }


    if (result == undefined) {
      callback(null, {
        code: 200,
        status: currentStatus
      });
      return;
    }

    callback(null, {
      code: 200,
      status: "OK",
      jsonresult: jsonfield
    });
  });


} //JsonParse

//Promise
const asyncTask = (name) => new Promise(function(resolved, rejected) {
  JsonParse(name, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});

var isEmpty = function(value) {
  if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
    return true
  } else {
    return false
  }
};

// Welcome intent.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/seiyu/chocomint.jpg';
  let text = '성우와 민트초코에 오신걸 환영합니다.';
  let title = '성우와 민트초코 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '성우와 민트초코!';
  let lastConv = '이름을 말해주세요!';
  let flow = 'welcome';
  let suggestionList = suggestions;

  // 넘어온 값이 빈값인지 체크합니다.
  // !value 하면 생기는 논리적 오류를 제거하기 위해
  // 명시적으로 value == 사용
  // [], {} 도 빈값으로 처리

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";
  if (conv.user.last.seen) {

    displayText = "다시 " + appTitle + "에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠?";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "6s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';

  } else {
    displayText = appTitle + " 에 오신걸 환영합니다. " + appTitle + " 는 성우의 이름을 말하면 민트초코를 좋아하는지 싫어하는지 알 수 있습니다. '메뉴얼'를 말하면 안내를 말합니다. 만약 종료하고 싶다면 '끝내기' 라고 말하시면 됩니다."
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "11s"><audio src="' + welcomeSound + '"/></media>' +
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
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;


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



app.intent(SEIYU_INTENT, (conv) => {
  console.log("SEIYU_INTENT");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]

  const seiyuEntity = conv.parameters[SEIYU];

  console.log("seiyuEntity data: ", seiyuEntity);
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '이제 알고싶은 성우 이름을 말해주세요.';
  let flow = 'seiyu';
  let suggestionList = suggestions

  // 디스플레이 용 텍스트
  displayText = '선택하신 성우는 ' + seiyuEntity + ' 이며 ';
  speechText = displayText;


  return asyncTask(seiyuEntity)
    .then(function(result) {

      console.log("result : " + JSON.stringify(result));

      if (result.code != 200) { //300과 200 피하
        //문제있음
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
        title = "서버연결 에러";
        displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요.";
        speechText = displayText;

      } else { // no problem -> List

        console.log("let results stringify : " + JSON.stringify(result.jsonresult));



        let name = result.jsonresult.name;
        let chocomint = result.jsonresult.status;
        let office_ko = result.jsonresult.office_ko;

        //1좋아함, 2싫어함 3무관심,4보통
        switch (chocomint) {
          case 1:
            chocomint = '좋아함'
            break;
          case 2:
            chocomint = '싫어함'
            break;

          case 3:
            chocomint = '무관심'
            break;

          case 4:
            chocomint = '보통 좋아함'
            break;

        }
        displayText += '민트초코를 '
        displayText += chocomint
        displayText += ' 입니다.'
        speechText = displayText;

        //search data
        // let SeiyuArrayJson = SeiyuArray.find(item => {
        //   return item.name == seiyuEntity;
        // });

        //이미지교체
        //imageLink = SeiyuArrayJson.image;
        imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/seiyu/chocomint.jpg'


        //이전 재생을 위한 arrays
        let convArray = conv.data.previous;
        if (convArray === undefined) {
          convArray = [];
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
        convArray.push(convJson);
        conv.data.previous = convArray;


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


    }); //async




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

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count < 3) {

    if (count === 1) {
      displayText = '제가 잘 모르는 성우입니다. "도움말"을 말하시면 사용방법을 알 수 있습니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 혹시 제가 모르는 성우인가요? 아직 지원하지 않는 성우이거나 정보가 없는 성우일 가능성이 높습니다.';
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

  let displayText = '성우와 민트초코는 말하신 성우가 민트초코를 좋아하는지 싫어하는지 조회하는 기능을 가지고 있습니다. 이름만 말해주세요.';
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
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

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


// SUPPORTRAMEN
app.intent('supportSeiyu', (conv) => {
  console.log("supportSeiyu");
  conv.data.fallbackCount = 0;

  let tempText = '';
  for (var i = 0; i < SeiyuArray.length; i++) {
    tempText += SeiyuArray[i].name
    if (SeiyuArray.slice(-1)[0] == i + 1) {

    } else {
      tempText += ", "
    }

  }
  let displayText = '지원되는 성우는 현재 다음과 같습니다.';
  let speechText = '';
  let convResponse = 'original'
  let lastConv = '다음 질문을 해 주세요.';
  let suggestionList = suggestions;
  // let text

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/info.png';
  // let text
  let text = '';
  let title = '지원되는 성우';
  let subtitle = tempText;
  let flow = 'support'

  speechText = displayText;

  //이전 재생과 다시 재생을 위한
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
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

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
  let suggestionList = convArray[convArraylength].data.suggestion;


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
    suggestionList = convArray[convArraylength].data.suggestion;

    flow = convArray[convArraylength].flow
    convResponse = convArray[convArraylength].convResponse;

    //last save
    conv.data.previous = convArray;

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


});

// REPEAT
app.intent(REPEAT, (conv) => {
  console.log("REPEAT");
  conv.data.fallbackCount = 0;

  let convArray = conv.data.previous;
  let convArraylength = convArray.length - 1;

  let displayText = convArray[convArraylength].data.displayText;
  let speechText = convArray[convArraylength].data.speechText;
  let imageLink = convArray[convArraylength].data.imageLink;

  let text = convArray[convArraylength].data.text;
  let title = convArray[convArraylength].data.title;
  let subtitle = convArray[convArraylength].data.subtitle;
  let lastConv = convArray[convArraylength].data.lastConv;
  let suggestionList = convArray[convArraylength].data.suggestion;

  let convResponse = convArray[convArraylength].convResponse;
  let flow = convArray[convArraylength].flow;

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
  let title = '성우와 민트초코 입니다';
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
exports.seiyuChocomint = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
