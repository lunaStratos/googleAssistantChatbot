'use strict';

process.env.DEBUG = 'actions-on-google:*';
const DialogFlow = require('actions-on-google').DialogflowApp; // apiai
const requests = require('request'); // request
const Promise = require('promise');

let endText = " 다음 질문을 해 주세요.";

exports.cryptocurrencyUpBit = (request, response) => {
  //dialogflowFirebaseFulfillment cryptocurrency

  //switch : policy가 없으면 deny되기 때문에 policy페이지 만들어야 함.
  // 구글 문서로도 만들수는 있다.
  //console.log('Request body: ' + JSON.stringify(request.body));
  let jsonLang = request.body.lang;
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
      const lastSeen = app.getLastSeen();
      console.log(app.getIntent());

      // 여기서부터 시작

      // 코인정보 업비트서버에서 가져오기
      function getBitsumJson(code, callback) {
        var url = "https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-" + code;
        var hanName = '';
        var imageLink = '';
        console.log(code);
        //BTC, ETH, DASH, LTC, ETC, XRP, BCH, XMR, ZEC, QTUM, BTG, EOS (기본값: BTC), ALL(전체)
        //https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/10?code=CRIX.UPBIT.KRW-
        switch (code) {
          case 'BTC':
            hanName = "비트코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitcoin.jpg";
            break;
          case 'ETH':
            hanName = "이더리움";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethereum.jpg";
            break;
          case 'DASH':
            hanName = "대쉬";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dash.jpg";
            break;
          case 'LTC':
            hanName = "라이트 코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/litecoin.jpg";
            break;
          case 'ETC':
            hanName = "이더리움 클래식";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethereumclassic.jpg";
            break;
          case 'XRP':
            hanName = "리플";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ripple.jpg";
            break;
          case 'BCC':
            hanName = "비트코인 캐쉬";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitcoincash.jpg";
            break;
          case 'XMR':
            hanName = "모네로";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/moenro.jpg";
            break;
          case 'ZEC':
            hanName = "제트캐쉬";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/zcash.png";
            break;
          case 'QTUM':
            hanName = "퀀텀";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/quantum.png";
            break;
          case 'BTG':
            hanName = "비트코인 골드";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitgold.jpg";
            break;
          case 'XLM':
            hanName = "스텔라루멘";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/stellar.png";
            break;
          case 'SNT':
            hanName = "스테이터스 네트쿼크 토큰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SNT.jpeg";
            break;
          case 'NEO':
            hanName = "네오";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/neo.jpg";
            break;
          case 'STEEM':
            hanName = "스팀";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/steem.jpg";
            break;
          case 'SBD':
            hanName = "스팀달러";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SBD.png";
            break;
          case 'STRAT':
            hanName = "스트라티스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/STRAT.png";
            break;
          case 'XEM':
            hanName = "뉴 이코노미 무브먼트";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/XEM.png";
            break;
          case 'KMD':
            hanName = "코모도";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/KMD.png";
            break;
          case 'LSK':
            hanName = "리스크";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/LSK.jpg";
            break;
          case 'OMG':
            hanName = "오미세고";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/OMG.png";
            break;
          case 'MER':
            hanName = "머큐리";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/mer.png";
            break;
          case 'ARDR':
            hanName = "아더";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ARDR.png";
            break;
          case 'EMC2':
            hanName = "아인스타이늄";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/EMC2.png";
            break;
          case 'PIVX':
            hanName = "피벡스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/PIVX.png";
            break;
          case 'TIX':
            hanName = "블록틱스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/TIX.png";
            break;
          case 'POWR':
            hanName = "파워렛저";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/POWR.png";
            break;
          case 'ARK':
            hanName = "아크";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ARK.jpg";
            break;
          case 'GRS':
            hanName = "그로스톨코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/GRS.png";
            break;
          case 'STORJ':
            hanName = "스토리지";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/STORJ.jpg";
            break;
          case 'MTL':
            hanName = "메탈";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/MTL.jpg";
            break;
          case 'WAVES':
            hanName = "웨이브";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/WAVES.jpeg";
            break;
          case 'REP':
            hanName = "어거";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/REP.png";
            break;
          case 'VTC':
            hanName = "버트코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/VTC.png";
            break;
          case 'STORM':
            hanName = "스톰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/storm.jpg";
            break;
          case 'ICX':
            hanName = "아이콘";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/icon.JPG";
            break;

            //2018년 9월 28일 추가
          case 'GNT':
            hanName = "골렘";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/GNT.png";
            break;
          case 'IOST':
            hanName = "아이오에스티";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IOST.png";
            break;
          case 'GTO':
            hanName = "기프토";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/GTO.png";
            break;
          case 'POLY':
            hanName = "폴리매쓰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/POLY.png";
            break;
          case 'MFT':
            hanName = "메인프레임";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/MFT.png";
            break;
          case 'IOTA':
            hanName = "아이오타";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IOTA.png";
            break;
          case 'DCR':
            hanName = "디크레드";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/DCR.png";
            break;
          case 'DMT':
            hanName = "디마켓";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/DMT.png";
            break;
          case 'ZRX':
            hanName = "제로엑스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ZRX.png";
            break;
          case 'ADX':
            hanName = "애드엑스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ADX.png";
            break;
          case 'SRN':
            hanName = "시린토큰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SRN.png";
            break;
          case 'CVC':
            hanName = "시빅";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/CVC.png";
            break;
          case 'BAT':
            hanName = "베이직어텐션토큰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/BAT.png";
            break;
          case 'IQ':
            hanName = "에브리피디아";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IQ.png";
            break;
          case 'LOOM':
            hanName = "룸네트워크";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/LOOM.png";
            break;
          case 'MCO':
            hanName = "모나코";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/MCO.png";
            break;
          case 'RFR':
            hanName = "리퍼리움";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/RFR.png";
            break;
          case 'SC':
            hanName = "시아코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SC.png";
            break;
          case 'ZIL':
            hanName = "질리카";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ZIL.png";
            break;
          case 'ONT':
            hanName = "온톨로지";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ONT.png";
            break;
          case 'IGNIS':
            hanName = "이그니스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/IGNIS.png";
            break;
          case 'TRX':
            hanName = "트론";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/TRX.png";
            break;
          case 'ADA':
            hanName = "에이다";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ADA.png";
            break;
          case 'OST':
            hanName = "오에스티";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/OST.png";
            break;


          case 'ALL':
            url = "https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-BTC";
            hanName = "전체";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/main.jpg";
            break;
          default: // 기본은 모든 정보를 가져온다
            url = "https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-BTC";
            hanName = "전체";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/main.jpg";
            break;
        }
        console.log(url);

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
              name: ''
            });
            return;
          }

          var original = JSON.parse(body.toString());
          callback(null, {
            code: 200,
            data: original[0],
            name: hanName,
            imageLink: imageLink
          });
        });

      }


      function getBitFlyerJson(callback) {
        var url = "https://api.bitflyer.jp/v1/ticker?product_code=BTC_JPY";

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
              name: ''
            });
            return;
          }

          var original = body;
          callback(null, {
            code: 200,
            data: original
          });
        });

      }

      function getJPYKRW(callback) {
        var url = "http://api.manana.kr/exchange/rate.json";

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
              name: ''
            });
            return;
          }

          var original = body;
          callback(null, {
            code: 200,
            data: original
          });
        });

      }

      function promiseJsonConnect(currency) {
        return new Promise(function(resolved, rejected) {
          getBitsumJson(currency, function(err, result) {
            if (err) {
              rejected(err);
            } else {
              resolved(result);
            }
          });
        });
      }

      function kimchiPromiseJsonConnect() {
        return new Promise(function(resolved, rejected) {
          getBitFlyerJson(function(err, result) {
            if (err) {
              rejected(err);
            } else {
              resolved(result);
            }
          });
        });
      }

      function getJPYKRWJsonConnect() {
        return new Promise(function(resolved, rejected) {
          getJPYKRW(function(err, result) {
            if (err) {
              rejected(err);
            } else {
              resolved(result);
            }
          });
        });
      }

      // 선택된 코인 가격 출력
      function select_coin_func(app) {
        app.data.fallbackCount = 0;
        var currency = app.getArgument('currency');
        Promise.all([promiseJsonConnect(currency)]).then(result => {
          let displayText = '';
          let speechText = '';
          if (result[0].code != 200) {
            //문제있음
            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
            );
          } else {

            let results = result[0].data;

            let opening_price = parseInt(results.openingPrice);

            let min_price = parseInt(results.highPrice);
            let max_price = parseInt(results.lowPrice);
            let average_price = parseInt(results.tradePrice);

            let imageLink = result[0].imageLink; // 이미지 주소 복사

            let name = result[0].name; // 사용자 경험을 위한 이름 한글

            let texttemp = '현재 ' + name + '의 가격은 평균' + average_price + '원 입니다. 최저가는 ' + min_price + '원 이며 최고가는 ' + max_price + '원 입니다. ' + endText;

            displayText = '현재 ' + name + '의 가격은 평균' + average_price + '원 입니다. 최저가는 ' + min_price + '원 이며 최고가는 ' + max_price + '원 입니다. ' + endText;

            speechText = displayText;

            app.data.repeatText = displayText;
            app.data.repeatSound = speechText;
            app.data.repeatImage = imageLink;
            app.data.repeatTitle = '현재 ' + name + '의 가격';
            app.data.repeatChip = ['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'];

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle('평균 ' + average_price + '원 입니다.')
                .setTitle('현재 ' + name + '의 가격')
                .setImage(imageLink, name))
            );

          }


        });

      } // 선택된 코인 가격 출력

      // 현재 코인 시세
      function nowall_coin_func(app) {
        app.data.fallbackCount = 0;
        let currency = "BTC";
        Promise.all([promiseJsonConnect(currency)]).then(result => {

          let displayText = '';
          let speechText = '';
          console.log(result);
          if (parseInt(result[0].code) != 200) {
            //문제있음
            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
            );
          } else { // code 200

            let BTC = parseInt(result[0].data.tradePrice);
            let calculatorComma = numberWithCommas(BTC);

            let imageLink = result[0].imageLink;

            let textinsert = '';

            //자세한 화폐 시세는 추가적인 데이터를 부른다.
            if (actions != "input.welcome") {
              displayText += '비트코인 ' + calculatorComma + '원 \n' + ' 입니다. ';
              textinsert += '비트코인 ' + calculatorComma + '원 \n' + ' 입니다. ';
            } else {
              app.data.fallbackCount = 0;
              if (lastSeen != null) { // re visit.
                displayText += '가상화폐 시세에 다시 오신 것을 환영합니다. 기준점인 ';
                textinsert += '가상화폐 시세에 다시 오신 것을 환영합니다. 기준점인 ';
              } else { // first
                displayText += '가상화폐 시세에 오신것을 환영합니다. 현재 기준점인 ';
                textinsert += '가상화폐 시세에 오신것을 환영합니다. 현재 기준점인 ';
              }
              displayText += '비트코인은 ' + calculatorComma + '원 \n' + ' 입니다. 지원되는 코인질문을 해주시면 언제든지 답해드립니다.';
              textinsert += '\n' + '비트코인은 ' + calculatorComma + '원 \n' + ' 입니다. 지원되는 코인질문을 해주시면 언제든지 답해드립니다.';
            }

            displayText += endText;
            speechText = displayText;

            app.data.repeatText = displayText;
            app.data.repeatSound = speechText;
            app.data.repeatImage = imageLink;
            app.data.repeatTitle = '기준점 비트코인 시세';
            app.data.repeatChip = ['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'];

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle("기준점 비트코인 시세")
                .setTitle("기준점 비트코인 시세")
                .setImage(imageLink, "화폐 시세"))
            );
          }
        });

      }

      // 코인수를 계산해주는 메소드
      function coin_cal_func(app) {
        app.data.fallbackCount = 0;
        let currency = app.getArgument('currency');
        let number = app.getArgument('number');

        Promise.all([promiseJsonConnect(currency)]).then(result => {

          let displayText = '';
          let speechText = '';

          if (result[0].code != 200) {
            //문제있음

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
              .addBasicCard(app.buildBasicCard('')
                .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/dogeza.jpg', '죄송합니다')
              )
            );
          } else {

            let results = result[0].data;

            let average_price = parseInt(results.openingPrice);
            let imageLink = result[0].imageLink;
            let name = result[0].name;

            let calculator = parseInt(average_price * number); // 계산
            let calculatorComma = numberWithCommas(calculator);
            displayText = name + '의 ' + number + '개 가격은 현재 ' + calculatorComma + '원 입니다.' + endText;
            speechText = displayText;

            app.data.repeatText = displayText;
            app.data.repeatSound = speechText;
            app.data.repeatImage = imageLink;
            app.data.repeatTitle = name + '의 ' + number + '개 가격';
            app.data.repeatChip = ['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'];

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle(calculator.toString())
                .setTitle(name + '의 ' + number + '개 가격')
                .setImage(imageLink, name))
            );
          }
        });



      }

      function bye_func(app) {
        app.data.fallbackCount = 0;
        let displayText = '앱을 종료합니다. 이용해 주셔서 감사합니다.';
        let speechText = displayText;
        app.tell(app.buildRichResponse()
          .addSimpleResponse({
            speech: speechText,
            displayText: displayText
          })
        );

      }

      // fallback count & method.
      const FALLBACK_NUMBER = "fallbacks";

      function fallback_func(app) {
        let count = app.data.fallbackCount;
        count++;
        app.data.fallbackCount = count;

        let speechText = '';
        let displayText = '';

        if (count === 1) {
          displayText = '지원되지 않는 명령어 입니다. 지원되는 명령어 중 하나는 저는 "20 비트코인 가격"을 말하면 계산이 가능합니다. 자 다시 말해주세요.';
          speechText = displayText;
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: speechText,
              displayText: displayText
            }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
            .addBasicCard(app.buildBasicCard('')
              .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/dogeza.jpg', '죄송합니다')
            )
          );

        } else if (count === 2) {
          displayText = '지원되지 않는 명령어 입니다. 지원되는 명령어 중 하나는 저는 "현재 시세를 알려줘" 를 말하면 현재 12개의 비트코인 시세를 알려줍니다. 자 다시 말해주세요.';
          speechText = displayText;
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: speechText,
              displayText: displayText
            }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
            .addBasicCard(app.buildBasicCard('')
              .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/lottoImage/dogeza2.jpg', '정말로 죄송합니다')
            )
          );

        } else if (count > 2) {
          displayText = '더이상 앱은 사용자님의 말을 이해하지 못했습니다. 종료하겠습니다.';
          speechText = displayText;
          app.tell(app.buildRichResponse()
            .addSimpleResponse({
              speech: speechText,
              displayText: displayText
            })
          );
        }

      }

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

      // 비트코인 시세한테 말하기 전용 메소드

      function bitcoinprice_func(app) {

        Promise.all([promiseJsonConnect("BTC")]).then(result => {

          let displayText = '';
          let speechText = '';
          if (parseInt(result[0].code) != 200) {
            //문제있음
            app.tell(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              })
            );
          } else { // code 200

            let BTC = parseInt(result[0].data.tradePrice);
            let calculatorComma = numberWithCommas(BTC);
            let imageLink = result[0].imageLink;
            let textinsert = '';

            //자세한 화폐 시세는 추가적인 데이터를 부른다.

            if (lastSeen != null) { // re visit.
              displayText += '비트코인 시세에 다시 오신 것을 환영합니다. 기준점인 ';
              textinsert += '비트코인 시세에 다시 오신 것을 환영합니다. 기준점인 ';
            } else { // first
              displayText += '비트코인 시세에 오신것을 환영합니다. 현재 기준점인 ';
              textinsert += '비트코인 시세에 오신것을 환영합니다. 현재 기준점인 ';
            }
            displayText += '비트코인은 ' + calculatorComma + '원 \n' + ' 입니다. 그럼 앱을 종료합니다.';
            textinsert += '\n' + '비트코인은 ' + calculatorComma + '원 \n' + ' 입니다. 그럼 앱을 종료합니다.';

            speechText = displayText;

            app.tell(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              })
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle("비트코인 시세")
                .setTitle("비트코인 시세")
                .setImage(imageLink, "비트코인 시세"))
            );
          }
        });

      }

      function kimchiPrice_func(app) {

        Promise.all([promiseJsonConnect("BTC"), kimchiPromiseJsonConnect(), getJPYKRWJsonConnect()]).then(([rows1, rows2, row3]) => {

          let displayText = '';
          let speechText = '';

          if (parseInt(rows1[0].code) != 200) {
            //문제있음
            app.tell(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              })
            );
          } else { // code 200
            console.log(JSON.stringify(rows1[0]));
            console.log(JSON.stringify(rows2[0]));
            console.log(JSON.stringify(rows3[0]));

            let BTCKR = parseInt(rows1[0].data.tradePrice);
            let BitflyerBTC = parseInt(rows2[0].data.ltp);
            let JPYKRW = parseInt(rows3[0].data.rate);
            let calKimchiPrice = 100 - (BitflyerBTC * JPYKRW) / BTCKR;
            let imageLink = rows1[0].imageLink;
            let textinsert = '';

            //자세한 화폐 시세는 추가적인 데이터를 부른다.

            if (lastSeen != null) { // re visit.
              displayText += '김치 프리미넘에 다시 오신 것을 환영합니다. 기준점인 ';
              textinsert += '비트코인 시세에 다시 오신 것을 환영합니다. 기준점인 ';
            } else { // first
              displayText += '비트코인 시세에 오신것을 환영합니다. 현재 기준점인 ';
              textinsert += '비트코인 시세에 오신것을 환영합니다. 현재 기준점인 ';
            }
            displayText += '김치 프리미엄은 ' + calKimchiPrice + '% \n' + ' 입니다. ';
            textinsert += '\n' + '김치 프리미엄은  ' + calKimchiPrice + '% \n' + ' 입니다.';

            speechText = displayText;

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              })
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle("비트코인 시세")
                .setTitle("비트코인 시세")
                .setImage(imageLink, "비트코인 시세"))
            );
          }
        });

      }

      function help_func(app) {

        let displayText = '이 앱은 2가지 기능이 있습니다. "20 비트코인은 얼마"와 같이 말하면 계산된 액수를 말합니다. "리플의 가격을 알려줘" 같이 말을 하면 특정 화폐의 가격을 알 수 있습니다. 앱을 종료하고 싶다면 "끝내기"를 말하시면 됩니다. 다음질문을 해 주세요.';
        let speechText = displayText;

        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: speechText,
            displayText: displayText
          }).addSuggestions(['메뉴얼', '다시듣기', '비트코인', '리플', '이더리움'])
          .addBasicCard(app.buildBasicCard('')
            .setSubtitle("비트코인 메뉴얼")
            .setTitle("비트코인 메뉴얼")
            .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/image/menu.jpg', "비트코인 메뉴얼"))
        );

      }

      // 콤마 찍기
      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }


      // intend get
      const actionMap = new Map();

      // intent name
      const WELCOME = 'input.welcome';
      const BYE = 'intent.exit';
      const SELECTCOINPRICE = 'intent.selectcoinprice'; //
      const COINCAL = 'intent.cal'; //
      const FALLBACK = 'input.unknown'; //
      const REPEATFUNC = 'intent.repeat'; //
      const HELPFUNC = 'intent.menual'; //
      const KIMCHIPRICE = 'intent.kimchi';
      //exit
      actionMap.set(WELCOME, nowall_coin_func);

      //exit
      actionMap.set(BYE, bye_func);

      // intend fucntion
      actionMap.set(SELECTCOINPRICE, select_coin_func);
      actionMap.set(WELCOME, nowall_coin_func);
      actionMap.set(COINCAL, coin_cal_func);
      actionMap.set(KIMCHIPRICE, kimchiPrice_func);


      actionMap.set(FALLBACK, fallback_func);

      actionMap.set(REPEATFUNC, repeat_func);
      actionMap.set(HELPFUNC, help_func);

      //비트코인 시세 앱에서 사용하는 부분 건드리지 말것.
      const BITCOINPRICE = 'input.bitcoinprice';
      actionMap.set(BITCOINPRICE, bitcoinprice_func);


      // go!
      app.handleRequest(actionMap);

      break; // default end
  }

}
