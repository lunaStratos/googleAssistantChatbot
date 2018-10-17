'use strict';

process.env.DEBUG = 'actions-on-google:*';

const DialogFlow = require('actions-on-google').DialogflowApp; // dialogflowapp
const requests = require('request'); // request
const Promise = require('promise');

exports.hangangRiverTemp = (request, response) => {
  //dialogflowFirebaseFulfillment cryptocurrency

  //switch : policy가 없으면 deny되기 때문에 policy페이지 만들어야 함.
  // 구글 문서로도 만들수는 있다.
  //console.log('Request body: ' + JSON.stringify(request.body));
  let jsonLang = request.body.lang;
  console.log(jsonLang);
  let actions = request.body.result.action; //input.welcome

  switch (request.method) {
    case 'GET': // policy를 위한 페이지임
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      
      var title = '전자화폐 가격  Private Policy';
      var body = '<p>전자화폐 가격  Private Policy</p>\n \
  <p>아무것도 저장하지 않습니다.</p>\n \
  <p>그냥 즐기세요</p>\n \
  <p> - Stratos Heavy Industy</p>';

      var code = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<meta charset="utf-8" />',
        '<title>' + title + '</title>',
        '</head>',
        '<body>',
        body,
        '</body>',
        '</html>'
      ].join('\n');

      response.write(code, "utf8");
      response.end();
      break;

    default: // post
      const app = new DialogFlow({
        request,
        response
      });
      // 여기서부터 시작

      // 퐁당 서버에서 온도 가져오기
      function getHangangTemp(code, callback) {
        var url = 'http://hangang.dkserver.wo.tc';

        // Get data
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
            });
            return;
          }
          var original = JSON.parse(body.toString());
          callback(null, {
            code: 200,
            result: original.result,
            temp: original.temp,
            time: original.time,
          });
        });

      }

      function promTemp(code) {
        return new Promise(function(resolved, rejected) {
          getHangangTemp(code, function(err, result) {
            if (err) {
              rejected(err);
            } else {
              resolved(result);
            }
          });
        });
      }


      // 코인수를 계산해주는 메소드
      function welcome_intent(app) {
        console.log("Start");
        Promise.all([promTemp("a")]).then(results => {

          let displayText = '';
          let speechText = '';
          console.log(results[0].code);

          if (results[0].code != 200) {
            //문제있음
            var errorText = "";

            if (jsonLang == "ja") {
              errorText = "現在のサーバーに問題が発生し接続することができません。次の再試行してください。";
            } else if (jsonLang == "ko") {
              errorText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. ";
            } else {
              errorText = "We can not connect because there is a problem with the current server. Please try again later. ";
            }

            app.tell(app.buildRichResponse()
              .addSimpleResponse({
                speech: errorText,
                displayText: errorText
              })
            );

          } else {

            let result = results[0].result;
            let temp = results[0].temp;
            let time = parseFloat(results[0].time);
            console.log(results);

            let lastseen = app.getLastSeen();


            if (jsonLang == "ja") {
              if (lastseen) {
                displayText = "再びソウルのハン江の今水温かいアプリにようこそ。現在ハン江の温度は、" + temp + "℃ です。";
              } else {
                displayText = "ソウルのハン江の今水温かいアプリです。現在漢江の温度は、" + temp + "℃ です。";

              }
              displayText += "それじゃ終了しますよ！";

            } else if (jsonLang == "ko") {
              if (lastseen) {
                displayText = '다시 한강물 따뜻하냐 앱에 오신것을 환영합니다. 현재 한강의 온도는 ' + temp + "도 입니다. ";
              } else {
                displayText = '오늘 한강물 따뜻하냐 앱입니다. 현재 한강의 온도는 ' + temp + "도 입니다. ";
              }

              if (temp < 9) {
                displayText += " 한강 엄청 춥습니다. 아직 서핑 가즈아를 할 때가 아닙니다. ";
              } else if (temp >= 9 && temp < 12) {
                displayText += " 서핑하기에는 아직 이른 온도입니다. 경치를 보는 것에 만족하세요. ";
              } else if (temp >= 12 && temp < 16) {
                displayText += " 서핑하기 좋은 날씨입니다. ";
              } else if (temp >= 16) {
                displayText += " 지금이 적기! 한강가기 좋은날입니다. ";
              }
              displayText += "그럼 종료할께요!";
            } else { // En
              if (lastseen) {
                displayText = "Welcome back Seoul's Han River temp app. Currently, the temperature of the Han River is " + temp + " degree. ";

              } else {
                displayText = "This is Seoul's Han River temp app. Currently, the temperature of the Han River is " + temp + " degree. ";

              }
              displayText += "I will quit!";

            }

            speechText = displayText;

            app.tell(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              })
            );
          }
        });

      }

      // intend get
      const actionMap = new Map();
      // intent name
      const WELCOME = 'input.welcome';
      //exit
      actionMap.set(WELCOME, welcome_intent);
      // go!
      app.handleRequest(actionMap);

      break; // default end
  }

}
