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
  Button,
  List
} = require('actions-on-google');
const functions = require('firebase-functions');
const request = require('request'); // request
const Promise = require('promise');
const urlencode = require('urlencode');
const cheerio = require('cheerio');
const iconvlite = require('iconv-lite');

// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';

const DEVICEANDSONG = 'deviceAndSong'; //기기와 음악
const DEVICEANDSINGER = 'deviceAndSinger'; //기기와 가수
const SONG = 'Song'; // 노래제목
const SINGER = 'Singer'; // 가수

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const HELP = 'help';
const EXIT = 'exit';

//entity name
const DEVICE = 'device';
const ANY = 'any';

//for chip
let suggestions = ['금영 삼태기', '태진 마지막사랑 ', '태진 링딩동', '태진 U R MAN', '끝내기'];
let endText = " 다음 질문을 해 주세요.";
//https://api.manana.kr/karaoke/song/wonderful/kumyoung.json
// http://pureani.tistory.com/4997
function getMusicJsonConnect(deviceName, songTitle, singerName, flag, callback) {
  var url = '';
  var device = '';
  let resultInsertData = '';
  var selectValue = 0;

  if (deviceName == '금영') {
    device = 'kumyoung';


    // 값.
    switch (flag) {
      case 'DEVICESINGER': // 기계 + 가수
        selectValue = 9
        resultInsertData = singerName
        break;
      case 'DEVICESONG': // 기계 + 노래제목
        selectValue = 2
        resultInsertData = songTitle
        break;
      case 'ONLYSONG': // 노래제목만

        break;
      default: // 일반모드 ,
        selectValue = 2
        resultInsertData = songTitle
        break;
    }

    var encodeStr = '';
    var strUtf8Query = decodeURIComponent(resultInsertData);
    var buf = iconvlite.encode(strUtf8Query, "euc-kr");
    for (var i = 0; i < buf.length; i++) {
      encodeStr += '%' + buf[i].toString('16');
    }
    encodeStr = encodeStr.toUpperCase();
    console.log(encodeStr)

    // 노래제목 1 가수 9
    //주소에서는 %BE%C6%BD%C3%B3%AA%BF%E4 : 아시나요
    //%EC%95%84%EC%8B%9C%EB%82%98%EC%9A%94
    url = 'http://www.ikaraoke.kr/isong/search_musictitle.asp?sch_sel=' + selectValue + '&sch_txt=' + encodeStr + '&c_ctry=';
    //var url = 'http://www.ikaraoke.kr/isong/search_musictitle.asp';
    console.log(url)
    //584 : 데이터 없음, 아시나요: 데이터 있음
    request({
      method: 'GET',
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, function(err, resp, body) {
      if (err) {
        callback(err, {
          code: 400,
        });
        return;
      }

      const $ = cheerio.load(iconvlite.decode(body, 'EUC-KR'));
      //console.log("JSON.stringify: ", body.toString());

      let array = [];

      $(".tbl_board table tbody tr").each(function(index) {
        let tempJson = {};
        let noData = '검색결과를 찾을수 없습니다.';
        if (index != 0) { // td의 0번은 무시
          $(this).find('td').each(function(index2) {
            console.log('index2: ', index2)
            let no = $(this).find('.ac em').text();
            let song = $(this).find('.pl8 a').attr('title');
            let song2 = $(this).find('.pl8 span').attr('title');
            let singer = $(this).find('.tit.pl8 a').text();
            let nodata = $(this).text();
            console.log(nodata)
            if ("* 검색된 데이터가 없습니다." == nodata) {
              callback(err, {
                code: 300,
              });
              return;
            } else {
              switch (index2) {
                case 0:
                  tempJson.brand = 'kumyoung'
                  tempJson.no = no
                  break;
                case 1: //
                  if (song == undefined) {
                    tempJson.song = song2
                  } else {
                    tempJson.song = song
                  }

                  break;
                case 2:
                  tempJson.singer = singer
                  break;
              }
            }

          });
          array.push(tempJson);
        }

      });
      console.log(array)
      // 리스트는 30개가 한계임, 30으로 잘라줌
      if (array.length > 27) {
        array.slice(0, 26)
      }

      //성공
      callback(null, {
        code: 200,
        data: array, // data에서 뽑는다
        dataLength: array.length //길이 미리 저장
      });

    });
    //=================================================
  } else if (deviceName == 'TJ') {
    device = 'tj';
    url = 'https://www.tjmedia.co.kr/tjsong/song_search_list.asp'

    // 노래제목 : 1, 가수: 2
    //584 : 데이터 없음, 아시나요: 데이터 있음

    // 값.
    switch (flag) {
      case 'DEVICESINGER': // 기계 + 가수
        selectValue = 2
        resultInsertData = singerName
        break;
      case 'DEVICESONG': // 기계 + 노래제목
        selectValue = 1
        resultInsertData = songTitle
        break;
      case 'ONLYSONG': // 노래제목만

        break;
      default: // 일반모드 ,
        selectValue = 1
        break;
    }

    var forms = {
      strType: selectValue,
      strText: resultInsertData

    }
    console.log(url);
    request({
      method: 'POST',
      url: url,
      encoding: null,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      form: forms
    }, function(err, resp, body) {
      if (err) {
        callback(err, {
          code: 400,
        });
        return;
      }
      var original = body.toString(); // json으로 변환
      //console.log("JSON.stringify: ", body.toString());
      const $ = cheerio.load(body.toString());

      let array = [];

      $(".board_type1 tbody tr").each(function(index) {
        let tempJson = {};
        let noData = '검색결과를 찾을수 없습니다.';
        if (index != 0) { // td의 0번은 무시
          $(this).find('td').each(function(index2) {
            if ($(this).text() == noData) {
              console.log('no Data')
              callback(err, {
                code: 300,
              });
              return;

            } else { // 0, 1, 2번 데이터만
              switch (index2) {
                case 0:
                  tempJson.brand = 'tj'
                  tempJson.no = $(this).text()
                  break;
                case 1: //
                  tempJson.song = $(this).text()
                  break;
                case 2:
                  tempJson.singer = $(this).text()
                  break;
              }

            }
          });
          array.push(tempJson);
        }

      }) //array 1


      // 리스트는 30개가 한계임, 30으로 잘라줌
      if (array.length > 30) {
        array.slice(0, 29)
      }

      //성공
      callback(null, {
        code: 200,
        data: array, // data에서 뽑는다
        dataLength: array.length //길이 미리 저장
      });
      console.log(array)

    });
  }



}


const asyncTask = (deviceName, songTitle, singerName, flag) => new Promise(function(resolved, rejected) {
  getMusicJsonConnect(deviceName, songTitle, singerName, flag, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});


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
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/noRea.jpeg';
  let lastConv = '기계와 노래제목, 혹은 노래제목을 말해주세요.';
  // App name
  let appTitle = '노래방 검색';
  let title = appTitle;
  //
  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";

  if (conv.user.last.seen) {
    displayText = "다시 " + appTitle + "에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠?";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "9s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  } else {
    displayText = appTitle + "에 오신것을 환영합니다. 이 앱은 태진과 금영의 제목으로 곡 번호를 찾아주는 앱입니다. 기계와 노래제목을 말하면 노래번호를 알려줍니다. '태진 링딩동'이나 '금영 삼태기 ' 처럼 말하면 됩니다.";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "11s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }




  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;
  conv.data.imageLink = imageLink;
  conv.data.appTitle = appTitle;
  conv.data.lastConv = lastConv;
  conv.data.flow = 'welcome';

  let previousArray = [];
  //이전 재생을 위한 arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'imageLink': imageLink,
    'lastConv': lastConv
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
    text: '',
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  //Mic open 방지를 위한 last conversation
  conv.ask(lastConv);

});






//DEVICE AND SONG Intent
app.intent(DEVICEANDSONG, (conv) => {
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.close('죄송합니다. 이 앱은 화면이 있는 장치에서만 사용이 가능합니다. 앱을 종료하겠습니다.');
    return;
  }


  //log
  console.log("DEVICEANDSONG");

  //fallback manual
  conv.data.fallbackCount = 0;

  //Entity Get
  const deviceName = conv.parameters[DEVICE]; // 기계이름, [tj or 금영]
  const songTitle = conv.parameters[ANY]; //any로 들어온다
  const singerName = ''; //conv.parameters[ANY]
  const flag = 'DEVICESONG'; // flag로 구분

  //log
  console.log("deviceName : " + deviceName);
  console.log("songTitle : " + songTitle);

  //speech area
  let displayText = '';
  let speechText = '';
  let lastConv = '';
  let imageLink = '';
  let title = '노래방 검색 결과';

  //빈칸 방지.
  imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
  displayText = "노래제목이 없거나 기계이름이 없습니다. 다시 말해주세요. 도움말에 도움이 되는 커멘드가 있습니다. ";
  speechText = displayText;
  lastConv = endText;
  if (deviceName == '' || songTitle == '') {
    //fail
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: '',
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
    return;
  }

  //Reqest body
  return asyncTask(deviceName, songTitle, singerName, flag) // 4가지를 모두 한다. 정형화
    .then(function(result) {
      console.log("result : " + JSON.stringify(result));

      if (result.code == 400) {
        //문제있음
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
        displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ";
        speechText = displayText;
        lastConv = endText;

        //fail
        conv.ask(new SimpleResponse({
          speech: speechText,
          text: displayText,
        }));
        conv.ask(new Suggestions(suggestions));
        conv.ask(new BasicCard({
          text: '',
          subtitle: '',
          title: title,
          image: new Image({
            url: imageLink,
            alt: '이미지',
          }),
        }));
        //Mic open 방지를 위한 last conversation
        conv.ask(lastConv);

      } else if (result.code == 300) {
        //검색결과가 없는 경우
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
        displayText = "죄송합니다. 검색 결과 데이터가 없습니다. ";
        speechText = displayText;
        lastConv = endText;

        //fail
        conv.ask(new SimpleResponse({
          speech: speechText,
          text: displayText,
        }));
        conv.ask(new Suggestions(suggestions));
        conv.ask(new BasicCard({
          text: '',
          subtitle: '',
          title: title,
          image: new Image({
            url: imageLink,
            alt: '이미지',
          }),
        }));
        //Mic open 방지를 위한 last conversation
        conv.ask(lastConv);

      } else { // no problem

        let resultData = result.data; // data만 뽑기

        //another data save
        console.log("let results stringify : " + JSON.stringify(result));

        //text make
        displayText = '다음의 곡들이 검색되었습니다.'
        speechText = displayText;
        lastConv = '찾으실 기계와 곡 혹은 찾으실 곡을 말해주세요.';
        //log
        console.log("displayText : " + displayText);

        //save data : for previous and repeat
        conv.data.displayText = displayText;
        conv.data.speechText = speechText;
        conv.data.imageLink = imageLink;
        conv.data.flow = 'deviceAndSong';

        let previousArray = conv.data.previous;
        if (previousArray === undefined) {
          previousArray = [];
        }
        //previous arrays
        let previousJson = {
          'displayText': displayText,
          'speechText': speechText,
          'imageLink': imageLink,
          'lastConv': lastConv
        }
        previousArray.push(previousJson);
        conv.data.previous = previousArray;

        let itemMake = {};
 		let deviceSongSelect = {}
        for (let i = 0; i < resultData.length; i++) {
          let SELECTION_KEY = resultData[i].no;
          let IMG_URL = '';
          let alt_text = '';
          if ('tj' == resultData[i].brand) {
            IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/tj.png';
            alt_text = 'Tj';
          } else if ('kumyoung' == resultData[i].brand) {
            IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/ky.png';
            alt_text = '금영';
          }
         
          deviceSongSelect[i + 2] = "번호 :" + resultData[i].no + " [" + resultData[i].brand + "] " + resultData[i].singer; // 외부 모듈
          
          //make items
          itemMake[i + 2] = {
            title: "번호 :" + resultData[i].no + " 가수 : " + resultData[i].singer + '',
            description: "노래제목: " + resultData[i].song + "",
            image: new Image({
              url: IMG_URL,
              alt: alt_text,
            })
          } // itemMake
        } //for
        let length3 = 3 - resultData.length;
		
        for (let i = 0; i < length3; i++) {
          let SELECTION_KEY = '';
          let IMG_URL = '';
          let alt_text = '';
          IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
          alt_text = '-';

          deviceSongSelect[resultData.length + 2] = " "; // 외부 모듈
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
        console.log('deviceSongSelect', JSON.stringify(deviceSongSelect));
        
		conv.data.deviceSongSelect = deviceSongSelect;
        
        conv.ask('다음과 같이 검색이 되었습니다.');
        conv.ask(new List({
          title: '기계와 음악 제목 검색',
          items: itemMake
        }));
        conv.ask(new Suggestions(suggestions));

      }

    }); //return res

});

//2~30까지 가능
app.intent('actions.intent.OPTION', (conv, params, option) => {
  conv.data.fallbackCount = 0;
  console.log('선택')
  let deviceSongSelect = conv.data.deviceSongSelect;
  let response = '죄송합니다. 화면을 출력할 수 있는기기가 아닙니다. 다른 명령을 말해주세요.';
  if (option && deviceSongSelect.hasOwnProperty(option)) {
    response = "선택하신 곡의 정보는 " + deviceSongSelect[option] + " 입니다. 이제 하실 말을 말해주세요.";
  }
  conv.ask(response);
  conv.ask(new Suggestions(suggestions));
});


app.intent(SINGER, (conv) => {
  conv.data.fallbackCount = 0;
  console.log('가수검색')
  //fail
  //speech area
  let displayText = '가수 검색을 선택하셨습니다. 기계와 가수이름을 말해주세요. ';
  let speechText = displayText;
  let lastConv = '';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
  let title = '가수 검색'
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestions));
  conv.ask(new BasicCard({
    text: '',
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  //Mic open 방지를 위한 last conversation

});

// DEVICEANDSINGER
app.intent(DEVICEANDSINGER, (conv) => {
  console.log('가수와 기계검색')
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.close('죄송합니다. 이 앱은 화면이 있는 장치에서만 사용이 가능합니다. 앱을 종료하겠습니다.');
    return;
  }

  //fallback manual
  conv.data.fallbackCount = 0;

  //Entity Get
  const deviceName = conv.parameters[DEVICE]; // 기계이름, [tj or 금영]
  const songTitle = '' //conv.parameters[ANY]; //any로 들어온다
  const singerName = conv.parameters[ANY]
  const flag = 'DEVICESINGER'; // flag로 구분

  //log
  console.log("deviceName : " + deviceName);
  console.log("singerName : " + singerName);

  //speech area
  let displayText = '';
  let speechText = '';
  let lastConv = '';
  let imageLink = '';
  let title = '가수와 기계 검색';

  //빈칸 방지.
  imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
  displayText = "가수이름이 없거나 기계이름이 없습니다. 다시 말해주세요. 도움말에 도움이 되는 커멘드가 있습니다. ";
  speechText = displayText;
  lastConv = endText;
  if (deviceName == '' || singerName == '') {
    //fail
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: '',
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
  }

  //Reqest body
  return asyncTask(deviceName, songTitle, singerName, flag) // 4가지를 모두 한다. 정형화
    .then(function(result) {
      console.log("result : " + JSON.stringify(result));

      if (result.code == 400) {
        //문제있음
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
        displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ";
        speechText = displayText;
        lastConv = endText;

        //fail
        conv.ask(new SimpleResponse({
          speech: speechText,
          text: displayText,
        }));
        conv.ask(new Suggestions(suggestions));
        conv.ask(new BasicCard({
          text: '',
          subtitle: '',
          title: title,
          image: new Image({
            url: imageLink,
            alt: '이미지',
          }),
        }));
        //Mic open 방지를 위한 last conversation
        conv.ask(lastConv);

      } else if (result.code == 300) {
        //검색결과가 없는 경우
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
        displayText = "죄송합니다. 검색 결과 데이터가 없습니다. ";
        speechText = displayText;
        lastConv = endText;

        //fail
        conv.ask(new SimpleResponse({
          speech: speechText,
          text: displayText,
        }));
        conv.ask(new Suggestions(suggestions));
        conv.ask(new BasicCard({
          text: '',
          subtitle: '',
          title: title,
          image: new Image({
            url: imageLink,
            alt: '이미지',
          }),
        }));
        //Mic open 방지를 위한 last conversation
        conv.ask(lastConv);

      } else { // no problem

        let resultData = result.data; // data만 뽑기

        //another data save
        console.log("let results stringify : " + JSON.stringify(result));

        //text make
        displayText = '다음의 곡들이 검색되었습니다.'
        speechText = displayText;
        lastConv = '찾으실 기계와 곡 혹은 찾으실 곡을 말해주세요.';
        //log
        console.log("displayText : " + displayText);

        //save data : for previous and repeat
        conv.data.displayText = displayText;
        conv.data.speechText = speechText;
        conv.data.imageLink = imageLink;
        conv.data.flow = 'deviceAndSong';

        let previousArray = conv.data.previous;
        if (previousArray === undefined) {
          previousArray = [];
        }
        //previous arrays
        let previousJson = {
          'displayText': displayText,
          'speechText': speechText,
          'imageLink': imageLink,
          'lastConv': lastConv
        }
        previousArray.push(previousJson);
        conv.data.previous = previousArray;

        let itemMake = {};

        for (let i = 0; i < resultData.length; i++) {
          let SELECTION_KEY = resultData[i].no;
          let IMG_URL = '';
          let alt_text = '';
          if ('tj' == resultData[i].brand) {
            IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/tj.png';
            alt_text = 'Tj';
          } else if ('kumyoung' == resultData[i].brand) {
            IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/ky.png';
            alt_text = '금영';
          }
          deviceSongSelect[i + 2] = "번호 :" + resultData[i].no + " [" + resultData[i].brand + "] " + resultData[i].singer; // 외부 모듈
          //make items
          itemMake[i + 2] = {
            title: "번호 :" + resultData[i].no + " 가수 : " + resultData[i].singer + '',
            description: "노래제목: " + resultData[i].song + "",
            image: new Image({
              url: IMG_URL,
              alt: alt_text,
            })
          } // itemMake
        } //for
        let length3 = 3 - resultData.length;

        for (let i = 0; i < length3; i++) {
          let SELECTION_KEY = '';
          let IMG_URL = '';
          let alt_text = '';
          IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
          alt_text = '-';

          deviceSongSelect[resultData.length + 2] = " "; // 외부 모듈
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
        console.log('deviceSongSelect', JSON.stringify(deviceSongSelect));

        conv.ask('다음과 같이 검색이 되었습니다.');
        conv.ask(new List({
          title: '기계와 음악 제목 검색',
          items: itemMake
        }));
        conv.ask(new Suggestions(suggestions));

      }

    }); //return res

});


// =======================================================================

// FALLBACK
app.intent(FALLBACK, (conv) => {
  console.log("FALLBACK");
  // let text
  let displayText = '';
  let speechText = '';
  let imageLink = '';
  let title = '죄송합니다.';
  //fallback
  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count === 1) {
    displayText = '제가 잘 모르는 명령어 입니다. "도움말"을 참조해 보세요. 다시 말해주세요.';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
    speechText = displayText;
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: '',
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
  } else if (count === 2) {
    displayText = '죄송합니다. 한번 "도움말" 혹은 "설명서"라고 말해보시겠어요? 자 다시 말해주세요.';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
    speechText = displayText;
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: '',
      subtitle: '',
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
  } else if (count > 2) {
    displayText = '정말로 죄송합니다. 말입니다. 앱을 종료하겠습니다. ';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png";
    speechText = displayText;
    //ask
    conv.close(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.close(new BasicCard({
      text: '',
      subtitle: '',
      title: title,
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
  let displayText = '노래방 검색은 금영과 태진의 노래 제목으로 번호를 검색하는 앱입니다. [기계이름 + 노래] 으로 말하시면 됩니다. 예를들어 "태진 링딩동"이나 "금영 삼태기" 처럼 말하면 됩니다. 이제 질문을 해 주세요.';
  let speechText = '';
  let title = ''
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let lastConv = ''
  speechText = displayText;

  //save data : for previous and repeat
  conv.data.displayText = displayText;
  conv.data.speechText = speechText;
  conv.data.imageLink = imageLink;
  conv.data.flow = 'help';

  let previousArray = conv.data.previous;
  //이전 재생을 위한 arrays
  let previousJson = {
    'displayText': displayText,
    'speechText': speechText,
    'imageLink': imageLink,
    'lastConv': lastConv
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
    text: '',
    subtitle: '',
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
}); // intent


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
    })


  );

});


// Action name is different to method name.
// my action name is dialogv2. So If you want another name, please rename it.
// action name: dialogv2 => change your action name.
exports.noreabang = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
