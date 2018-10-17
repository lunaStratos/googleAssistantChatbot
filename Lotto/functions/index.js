// Title
// 로또번호 생성기
//
// display name and invocation name (동일하게 해야 함)
//
// 로또번호 생성기
//
// Short Description
// 한국의 나눔 로또의 6개 번호를 생성해 줍니다.
//
// Full Description
// 매일 찾아오는 8시의 기쁨! 로또번호를 만들어야 하는데 애매하다면?
// 로또번호 생성기에 연결하기 를 말하세요. 바로 만들어 드립니다.
//
// Company
// Stratos Heavy Industries
//
// sample invocations
//  로또번호 생성기에 연결하기 (invocation name +에 연결하기)
//
//
// Policy
// 아무것도 기록하지 않습니다. 즐기세요.
//
// Test method
//  로또번호 생성기에 연결하기만 말하세요. ask.tell로 끝납니다. 아무런 에러도 없어요.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const ApiAiAction = require('actions-on-google').DialogflowApp; // apiai
const requests = require('request');
const cheerio = require('cheerio');
const Promise = require('promise');
const iconvlite = require('iconv-lite');
// cloud function name : lottogenerator
// cloud region asia-northeast1-a
// 아직 cloud function은 us 지역만 존재
// https://stackoverflow.com/questions/46902502/use-region-other-than-us-central1-for-google-cloud-functions

exports.lottonumbergenerator = (request, response) => {

  //switch : policy가 없으면 deny되기 때문에 policy페이지 만들어야 함.
  // 구글 문서로도 만들수는 있다.
  console.log('Request body: ' + JSON.stringify(request.body));
  let jsonLang = request.body.lang;

  switch (request.method) {
    case 'GET': // policy를 위한 페이지임
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      var title = 'Lotto number generator Private Policy';
      var body = '<p> > Lotto number generator Private Policy</p>\n \
  <p> </p>\n \
  <p> * 로또번호 생성기 개인정보 정책</p>\n \
  <p>아무것도 저장하지 않습니다.</p>\n \
  <p>그냥 즐기세요</p>\n \
  <p> </p>\n \
  <p> * ロト ロト プライバシーポリシー</p>\n \
  <p>何もセーブしないです。</p>\n \
  <p>お楽しみください。</p>\n \
  <p> </p>\n \
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
      const app = new ApiAiAction({
        request,
        response
      });
      // 여기서부터 시작



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



      // 처음 구동 메소드, tell로 바로 종료
      function welcome_func(app) {

        let textDisplay = '';
        let textSSML = '';

        let sayImage;
        let chip;
        let sayTitle;

        if (jsonLang == "ko") {

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
          textDisplay = "안녕하세요. 로또번호 생성기 앱입니다. 우선 나눔로또번호를 생성하겠습니다. " +
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
          textSSML = "<speak>안녕하세요. 로또번호 생성기 앱입니다. 우선 나눔로또번호를 생성하겠습니다. " +
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
          chip = ['사용방법', '이번주 로또번호', '283회 로또번호'];
          sayTitle = '로또번호 생성하기';

          app.data.fallbackCount = 0;
          app.data.repeatText = textDisplay;
          app.data.repeatSound = textSSML;
          app.data.repeatChip = chip;
          app.data.repeatImage = sayImage;
          app.data.repeatTitle = sayTitle;

        } else if (jsonLang == "ja") {

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
          textDisplay = "ロト7番号が生成されました。" +
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
          textSSML = "<speak>ロト7番号が生成されました。 " +
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

        } else if (jsonLang == "en-us") { //en
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
          textDisplay = "Now, I have created powerball lotto numbers. Numbers are " +
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
          textSSML = "<speak>Now, I have created powerball lotto numbers. Numbers are " +
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

        if (jsonLang == "ko") {
          // ask
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: textSSML,
              displayText: textDisplay
            }).addSuggestions(chip)
            .addBasicCard(app.buildBasicCard('')
              .setImage(sayImage, sayTitle)
            )
          );

        } else {
          // tell 바로 종료시키기
          app.tell(app.buildRichResponse()
            .addSimpleResponse({
              speech: textSSML,
              displayText: textDisplay
            })
          );
        }


      } //  welcome_func end


      //                {
      //  "bnusNo": 40,
      //  "firstAccumamnt": 17319736128,
      //  "firstWinamnt": 2886622688,
      //  "returnValue": "success",
      //  "totSellamnt": 72974563000,
      //  "drwtNo3": 15,
      //  "drwtNo2": 6,
      //  "drwtNo1": 4,
      //  "drwtNo6": 33,
      //  "drwtNo5": 26,
      //  "drwtNo4": 25,
      //  "drwNoDate": "2017-12-16",
      //  "drwNo": 785,
      //  "firstPrzwnerCo": 6
      // }

      //로또 서버, 회차와 현재회차 동시사용, 0으로 구분한다
      function getLottoJson(num, callback) {
        let url = "http://www.nlotto.co.kr/common.do?method=getLottoNumber";
        console.log('num ', num)
        if (num != "0") {
          // 규칙 : 0이면 현재회차 0이 아니면 그 회차 불러옴 0회차는 존재하지 않으니까 가능.
          url += "&drwNo=";
          url += num;

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
                'returnValue': 'fail'
              });
              return;
            }
            console.log("1");
            var original = JSON.parse(body.toString());
            console.log("2");
            console.log(original);
            callback(null, original);
          });
        } else { // 0 = 오늘회차
          //                {
          //  "bnusNo": 40,
          //  "firstAccumamnt": 17319736128,
          //  "firstWinamnt": 2886622688,
          //  "returnValue": "success",
          //  "totSellamnt": 72974563000,
          //  "drwtNo3": 15,
          //  "drwtNo2": 6,
          //  "drwtNo1": 4,
          //  "drwtNo6": 33,
          //  "drwtNo5": 26,
          //  "drwtNo4": 25,
          //  "drwNoDate": "2017-12-16",
          //  "drwNo": 785,
          //  "firstPrzwnerCo": 6
          // }

          url = 'http://www.nlotto.co.kr/gameResult.do?method=byWin'
          console.log(url);

          requests({
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
                returnValue: "fail"
              });
              return;
            }
            var original = iconvlite.decode(body, 'EUC-KR'); // json으로 변환
            //console.log("JSON.stringify: ", body.toString());
            const $ = cheerio.load(iconvlite.decode(body, 'EUC-KR'));
            console.log(original);

            let tempJson = {};
            //  "bnusNo": 40,
            //  "firstAccumamnt": 17319736128,
            //  "firstWinamnt": 2886622688,
            //  "returnValue": "success",
            //  "totSellamnt": 72974563000,
            //  "drwtNo3": 15,
            //  "drwtNo2": 6,
            //  "drwtNo1": 4,
            //  "drwtNo6": 33,
            //  "drwtNo5": 26,
            //  "drwtNo4": 25,
            //  "drwNoDate": "2017-12-16",
            //  "drwNo": 785,
            //  "firstPrzwnerCo": 6
            //
            tempJson.drwNo = $(".lotto_win_number.mt12 h3 strong").text();
            let dateCall = $(".lotto_win_number.mt12 h3 span").text().replace('추첨', '').replace('(', '').replace(')', '')
            let convertDate = dateCall.replace('년 ', '-').replace('월 ', '-').replace('일 ', '')
            tempJson.drwNoDate = convertDate;

            $(".tblType1.f12.mt40 tbody tr").each(function(index) {
              if (index == 1) {
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
                  console.log($(this).text().replace(' ', ''));
                });
              }

            });
            //
            $(".lotto_win_number.mt12 p.number").each(function(index) {

              $(this).find('img').each(function(index2) {
                console.log($(this).attr('alt'))
                
                if (index2 == 6) {
                  let bonus = $(this).attr('alt');
                  tempJson.bnusNo = bonus;
                } else {
                   var index3 = index2+1;
                   tempJson['drwtNo' + index3] = $(this).attr('alt');
                  }
              });


            }) //array 1
            tempJson.returnValue = "success";
            console.log(tempJson);
            callback(null, tempJson);

          });

        } // if

      } // getLottoJson

      function lottoServerRequests(num) {
        return new Promise(function(resolved, rejected) {
          getLottoJson(num, function(err, result) {
            if (err) {
              rejected(err);
            } else {
              resolved(result);
            }
          });
        });
      }


      // lotto_now_information 로또회차 확인용 메소드
      function lotto_now_information(app) {

        let numberValues = app.getArgument('number');
        console.log("numberValues: " + numberValues);
        let textSSML = '';
        let textDisplay = '';

        let flag;

        if (parseInt(numberValues) <= 0) {
          flag = false;
        } else if (numberValues == null) {
          flag = true;
        }


        let sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/lottoNow.jpg';
        let chip = ['사용방법', '이번주 로또번호', '283회 로또번호'];
        let sayTitle = '로또번호 확인하기';

        app.data.fallbackCount = 0;

        app.data.repeatChip = chip;
        app.data.repeatImage = sayImage;
        app.data.repeatTitle = sayTitle;


        // 로또번호 정보 불러오기 0으로 넘긴다. 0회차는 존재하지 않기 때문에.
        // 로또회차 검색때 0회차 피할것.
        if (flag == false) {
          textDisplay = "잘못된 번호입니다. 올바른 회차를 말해주세요. ";
          textSSML = textDisplay;
          app.data.repeatText = textDisplay;
          app.data.repeatSound = textSSML;

          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: textSSML,
              displayText: textDisplay
            }).addSuggestions(chip)
            .addBasicCard(app.buildBasicCard('')
              .setImage(sayImage, sayTitle)
            )
          );

        } else { //  마이너스가 아니면

          if (numberValues == null) { // 널값이면 0으로 정리, 현재회차 가져옴
            numberValues = 0;
          }
          Promise.all([lottoServerRequests(numberValues)]).then(function(item) {
            //여기서 서버연결후 데이터 출력 item으로 가져옴
            let returnValue = item[0].returnValue; // success or fail
            console.log("결과: " + returnValue);

            if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등
              textDisplay = "아직 진행되지 않은 로또회차이거나 서버에러 등으로 서비스를 제공할 수 없었습니다. 다른 회차를 말해주세요.  ";
              textSSML = textDisplay;
            } else { // 서버가 움직인다면
              let firstWinAmount = item[0].firstWinamnt; // 1등상 액수
              let firstPrizeHuman = item[0].firstPrzwnerCo; // 총 인원

              let rawDate = item[0].drwNoDate; // 당첨날짜
              console.log(rawDate);

              //날짜 구하는 부분
              var dt = new Date(rawDate);
              let month = dt.getMonth() + 1;
              let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';
              console.log(dateText);
              let kai = item[0].drwNo; // 회차

              // 번호들, 보너스번호
              let number1 = item[0].drwtNo1;
              let number2 = item[0].drwtNo2;
              let number3 = item[0].drwtNo3;
              let number4 = item[0].drwtNo4;
              let number5 = item[0].drwtNo5;
              let number6 = item[0].drwtNo6;
              let bnusNo = item[0].bnusNo;
              let firstHowTo = '';

              console.log(number1);
              console.log(number2);
              console.log(number3);
              console.log(number4);
              console.log(number5);
              console.log(number6);
              console.log(bnusNo);


              let resultFirstPrize = numberWithCommas(firstWinAmount);

              if (item[0].firstHowTo != undefined) {
                firstHowTo = item[0].firstHowTo
                firstPrizeHuman = firstHowTo
              }

              textDisplay = dateText + "의 " + kai + "회차 로또번호는 " +
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

              textSSML = "<speak>" + dateText + "의 " + kai + "회차 로또번호는 " +
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
            app.data.repeatText = textDisplay;
            app.data.repeatSound = textSSML;

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: textSSML,
                displayText: textDisplay
              }).addSuggestions(chip)
              .addBasicCard(app.buildBasicCard('')
                .setImage(sayImage, sayTitle)
              )
            );


          });
        }



      } // end lotto_now_information

      // 로또 번호 확인
      function lotto_number_look(app) {
        let getUserNumber = app.getArgument('number'); // 로또 회차,이번회차는 null이 된다.

        let getUserNumber1 = app.getArgument('number1'); // 1
        let getUserNumber2 = app.getArgument('number2'); // 2
        let getUserNumber3 = app.getArgument('number3'); // 3
        let getUserNumber4 = app.getArgument('number4'); // 4
        let getUserNumber5 = app.getArgument('number5'); // 5
        let getUserNumber6 = app.getArgument('number6'); // 6

        console.log(getUserNumber)
        console.log(getUserNumber1)
        console.log(getUserNumber2)
        console.log(getUserNumber3)
        console.log(getUserNumber4)
        console.log(getUserNumber5)
        console.log(getUserNumber6)

        let flag;

        let sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/lottoConfirm.jpg';
        let chip = ['사용방법', '이번주 로또번호', '283회 로또번호'];
        let sayTitle = '로또번호 확인하기';

        app.data.fallbackCount = 0;

        app.data.repeatChip = chip;
        app.data.repeatImage = sayImage;
        app.data.repeatTitle = sayTitle;

        let textSSML = '';
        let textDisplay = '';

        var confirmArray = [];

        confirmArray.push(getUserNumber1, getUserNumber2, getUserNumber3, getUserNumber4, getUserNumber5, getUserNumber6);
        console.log(confirmArray);

        let confirmError = true;

        for (var i = 0; i < confirmArray.length; i++) {
          if (confirmArray[i] < 1 || confirmArray[i] > 45 || confirmArray[i] == null) {
            confirmError = false;
          }

        }
        console.log(confirmError);

        if (getUserNumber <= 0 || confirmError == false) {
          flag = false;
        } else if (getUserNumber == null) {
          flag = true;
        }
        console.log("flag: " + flag);

        if (flag == false) { //0 이하 제거
          textDisplay = "없는 회차거나 로또번호를 잘못 불렀습니다. 다음 질문을 해 주세요.";
          textSSML = textDisplay;
          app.data.repeatText = textDisplay;
          app.data.repeatSound = textSSML;

          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: textSSML,
              displayText: textDisplay
            }).addSuggestions(chip)
            .addBasicCard(app.buildBasicCard('')
              .setImage(sayImage, sayTitle)
            )
          );

        } else {
          // 0회차는 현재회차로 한다.
          if (getUserNumber == null) {
            getUserNumber = 0;
          }

          Promise.all([lottoServerRequests(getUserNumber)]).then(function(item) {
            //여기서 서버연결후 데이터 출력 item으로 가져옴
            let returnValue = item[0].returnValue; // success or fail
            console.log("결과: " + returnValue);

            if (returnValue == "fail") { // 서버접속 실패 혹은 200에러 등
              textDisplay = "현재 나눔로또 서버의 문제로 인해서 연결할 수 없었습니다. 서비스를 제공하지 못하여 죄송합니다. ";
            } else { // 서버가 움직인다면

              let firstWinAmount = item[0].firstWinamnt; // 1등상 액수
              let firstPrizeHuman = item[0].firstPrzwnerCo; // 총 인원

              let rawDate = item[0].drwNoDate; // 당첨날짜

              //날짜 구하는 부분
              var dt = new Date(rawDate);
              let month = dt.getMonth() + 1;
              let dateText = dt.getFullYear() + '년 ' + month + '월 ' + dt.getDate() + '일';

              let kai = item[0].drwNo; // 회차

              var arrays = [];

              arrays.push(item[0].drwtNo1);
              arrays.push(item[0].drwtNo2);
              arrays.push(item[0].drwtNo3);
              arrays.push(item[0].drwtNo4);
              arrays.push(item[0].drwtNo5);
              arrays.push(item[0].drwtNo6);
              console.log(arrays);

              // 이전 array와 비교를 해서 몇개가 겹치는제 확인
              let count = 0;

              for (var i = 0; i < arrays.length; i++) {
                for (var j = 0; j < confirmArray.length; j++) {
                  if (arrays[i] == confirmArray[j]) {
                    count++;
                  }
                }
              }
              console.log(count);

              //2등상을 위한 확인절차
              var secondLotto = false;
              var getUserLottoBonus = false;
              for (var j = 0; j < confirmArray.length; j++) {
                if (confirmArray[j] == item[0].bnusNo) {
                  secondLotto = true;
                }
              }
              let resultFirstPrize = numberWithCommas(firstWinAmount);

              textDisplay = "불러주신 " +
                confirmArray[0] + " " +
                confirmArray[1] + " " +
                confirmArray[2] + " " +
                confirmArray[3] + " " +
                confirmArray[4] + " " +
                confirmArray[5] + " ";
              //로또번호는 3개부터 5등상이다.
              if (count < 3) {
                textDisplay += "번호는 당첨되지 않았습니다. " + ' 참고로 당첨번호는 ' + arrays[0] + ' ' + arrays[1] + ' ' + arrays[2] + ' ' + arrays[3] + ' ' + arrays[4] + ' ' + arrays[5] + ' 입니다.';
              } else if (count == 3) {
                sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/5.png';
                textDisplay += "는 5등상 입니다. 5000원을 근처 판매처에서 교환하시면 됩니다. " + '참고로 당첨번호는 ' + arrays[0] + ' ' + arrays[1] + ' ' + arrays[2] + ' ' + arrays[3] + ' ' + arrays[4] + ' ' + arrays[5] + ' 입니다.';
              } else if (count == 4) {
                sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/4.png';
                textDisplay += "는 4등상 입니다. 당첨금 50000원을 판매점과 농협은행에서 당첨금을 수령하실 수 있습니다. " + '참고로 당첨번호는 ' + arrays[0] + ' ' + arrays[1] + ' ' + arrays[2] + ' ' + arrays[3] + ' ' + arrays[4] + ' ' + arrays[5] + ' 입니다.';
              } else if (count == 5 && secondLotto == false) { //2등상의 경우 보너스 숫자가 맞아야 한다
                sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/3.jpg';
                textDisplay += "는 3등상 입니다. 당첨복권, 신분증을 가지고 농협은행에서 당첨금을 수령하실 수 있습니다. ";
              } else if (count == 5 && secondLotto == true) {
                sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/2.png';
                textDisplay += "는 2등상 입니다. 당첨복권, 신분증을 가지고 농협은행에서 당첨금을 수령하실 수 있습니다. ";
              } else if (count == 6) {
                sayImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/1.png';
                textDisplay += "는 1등 입니다. 총 액수는 " + resultFirstPrize + "원 이며 당첨복권, 신분증을 가지고 농협은행 '본점'에서 당첨금을 수령하시면 됩니다. 인생역전 축하합니다!";
              }

            }

            textDisplay += " 이제 다음 질문을 해 주세요.";
            textSSML = textDisplay; //get

            app.data.repeatText = textDisplay;
            app.data.repeatSound = textSSML;

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: textSSML,
                displayText: textDisplay
              }).addSuggestions(chip)
              .addBasicCard(app.buildBasicCard('')
                .setImage(sayImage, sayTitle)
              )
            );



          }); // promise



        }

      }

      //            기능은
      //            1. 로또번호 생성하기
      //            2. 로또번호 대조하기
      //            3. 로또번호 이번회차 정보
      //            4. 로또번호 저번회차 정보

      // repeat반복 재생.
      function repeat_func(app) {
        app.data.fallbackCount = 0;

        let TextDisplay = app.data.repeatText;
        let TextSpeech = app.data.repeatSound;
        let repeatImage = app.data.repeatImage;
        let repeatTitle = app.data.repeatTitle;

        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: TextSpeech,
            displayText: TextDisplay
          }).addSuggestions(app.data.repeatChip)
          .addBasicCard(app.buildBasicCard('')
            .setImage(repeatImage, repeatTitle)
          )
        );

      }

      function noinput(app) {
        if (app.getRepromptCount() === 0) {
          app.ask('죄송합니다. 이해하지 못했습니다. 메뉴얼에 따른 방식으로 말을 해 주세요.');
        } else if (app.getRepromptCount() === 1) {
          app.ask("죄송합니다. 이번에도 이해를 하지 못했습니다. 혹시 사용방법이 어려우신가요? 메뉴얼을 말해보세요. 도움이 되는 커맨드를 알려줍니다.");
        } else if (app.isFinalReprompt()) {
          app.tell("죄송합니다. 더욱 발전시켜서 다시 오겠습니다. 앱을 종료합니다. ");
        }

      }

      //fallback no match word
      function fallback_func(app) {

        app.data.fallbackCount++;

        let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/dogeza.jpg';

        if (parseInt(app.data.fallbackCount) === 1) {
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: "죄송합니다. 이해하지 못했습니다. 메뉴얼에 따른 방식으로 말을 해 주세요.",
              displayText: "죄송합니다. 이해하지 못했습니다. 메뉴얼에 따른 방식으로 말을 해 주세요."
            }).addSuggestions(['메뉴얼', '이번주 로또번호', '283회 로또번호'])
            .addBasicCard(app.buildBasicCard('')
              .setImage(imageLink, '죄송합니다')
            )
          );
        } else if (parseInt(app.data.fallbackCount) === 2) {
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: "죄송합니다. 이번에도 이해를 하지 못했습니다. 혹시 사용방법이 어려우신가요? 메뉴얼을 말해보세요. 도움이 되는 커맨드를 알려줍니다.",
              displayText: "죄송합니다. 이번에도 이해를 하지 못했습니다. 혹시 사용방법이 어려우신가요? 메뉴얼을 말해보세요. 도움이 되는 커맨드를 알려줍니다."
            }).addSuggestions(['메뉴얼', '이번주 로또번호', '283회 로또번호'])
            .addBasicCard(app.buildBasicCard('')
              .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/dogeza2.jpg', '죄송합니다')
            )
          );
        } else if (parseInt(app.data.fallbackCount) === 3) { //tell
          app.tell(app.buildRichResponse()
            .addSimpleResponse({
              speech: "죄송합니다. 더욱 발전시켜서 다시 오겠습니다. 앱을 종료합니다. ",
              displayText: "죄송합니다. 더욱 발전시켜서 다시 오겠습니다. 앱을 종료합니다. "
            })
          );
        }

      } //fallback end

      function exit_func(app) {
        app.tell(app.buildRichResponse()
          .addSimpleResponse({
            speech: "앱을 이용해 주셔서 감사합니다. 바이바이!",
            displayText: "앱을 이용해 주셔서 감사합니다. 바이바이!"
          })
          .addBasicCard(app.buildBasicCard('')
            .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/exit.jpg', '다음에 뵈요')
          )
        );
      }

      // 콤마 찍기
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }


      let actionMap = new Map(); // intent map save list

      actionMap.set('input.welcome', welcome_func); // first : welcome intent tell end
      actionMap.set('intent.lottogenerator', welcome_func); // 로또번호 생성하기

      actionMap.set('intent.beforelottoconfirm', lotto_number_look); // 저번회차 로또 당첨 확인
      actionMap.set('intent.todaylottoconfirm', lotto_number_look); //  이번회차 로또 당첨 확인

      actionMap.set('intent.beforelotto', lotto_now_information); // 저번회차 로또 정보 불러오기
      actionMap.set('intent.thistime', lotto_now_information); // 이번회차 로또 정보 불러오기

      // fallback & repeat & noinput method
      const REPEAT_INTENT = 'intent.repeat';
      const FALLBACK_INTENT = 'input.unknown';
      const NOINPUT = 'noinput';
      const EXITAPP = 'intent.exit';
      actionMap.set(FALLBACK_INTENT, fallback_func);
      actionMap.set(NOINPUT, noinput);
      actionMap.set(EXITAPP, exit_func);
      actionMap.set(REPEAT_INTENT, repeat_func);


      app.handleRequest(actionMap); //   intent search

      break;

  }
}