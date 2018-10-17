'use strict';

process.env.DEBUG = 'actions-on-google:*';
const DialogFlow = require('actions-on-google').DialogflowApp; // apiai
const requests = require('request'); // request
const Promise = require('promise');

let endText = " 다음 질문을 해 주세요.";

exports.cryptocurrency = (request, response) => {
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

      // 여기서부터 시작
      let coinArray = ['비트코인', '이더리움', '대쉬', '라이트 코인', '이더리움 클래식', '리플', '비트코인 캐시',
        '제트캐쉬', '퀀텀', '비트코인 골드', '이오스', '아이콘', '비체인', '트론', '엘프', '미스릴', '모나코', '오미세고', '카이버', '골렘', '에이치쉐어', '질리카', '에토스', '텐엑스페이토큰', '왁스', '파워렛져', '루프링', '기프토', '스팀', '스트라티스', '제로엑스', '어거', '애터니티', '넴', '스테이터스 네트워크 토큰', '에이다',
        '파풀러스', '코르텍스', '트루', '쎄타코인', '월튼', '아이오티', '아크블록', '트루체인', '원트루네트워크', '플레이코 '
      ];

      // 코인정보 빗섬서버에서 가져오기
      function getBitsumJson(code, callback) {
        var url = '';
        var hanName = '';
        var imageLink = '';
        console.log(code);
        //BTC, ETH, DASH, LTC, ETC, XRP, BCH, XMR, ZEC, QTUM, BTG, EOS (기본값: BTC), ALL(전체)
        switch (code) {
          case 'BTC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "비트코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitcoin.jpg";
            break;
          case 'ETH':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "이더리움";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethereum.jpg";
            break;
          case 'DASH':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "대쉬";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dash.jpg";
            break;
          case 'LTC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "라이트 코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/litecoin.jpg";
            break;
          case 'ETC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "이더리움 클래식";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethereumclassic.jpg";
            break;
          case 'XRP':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "리플";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ripple.jpg";
            break;
          case 'BCH':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "비트코인 캐쉬";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitcoincash.jpg";
            break;

          case 'XMR':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "모네로";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/moenro.jpg";
            break;
          case 'ZEC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "제트캐쉬";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/zcash.png";
            break;
          case 'QTUM':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "퀀텀";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/quantum.png";
            break;
          case 'BTG':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "비트코인 골드";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/bitgold.jpg";
            break;
          case 'EOS':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "이오스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/eos.jpg";
            break;


            //2018 9 20 업데이트 ::  추가코인
          case 'ICX':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "아이콘";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/icon.JPG"; //
            break;
          case 'VEN':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "비체인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ven.jpg";
            break;


          case 'TRX':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "트론";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/trx.jpg";
            break;
          case 'ELF':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "엘프";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/elf.jpg";
            break;
          case 'MITH':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "미스릴";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/mith.jpg";
            break;
          case 'MCO':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "모나코";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/mco.jpg";
            break;
          case 'OMG':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "오미세고";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/OMG.png";
            break;
          case 'KNC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "카이버";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/knc.jpg";
            break;
          case 'GNT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "골렘";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/gnt.jpg";
            break;
          case 'HSR':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "에이치쉐어";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/hsr.jpg";
            break;

          case 'ZIL':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "질리카";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/zil.png";
            break;
          case 'ETHOS':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "에토스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ethos.png";
            break;
          case 'PAY':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "텐엑스페이토큰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/pay.jpg";
            break;
          case 'WAX':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "왁스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/wax.png";
            break;

          case 'POWR':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "파워렛져";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/POWR.png";
            break;
          case 'LRC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "루프링";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/lrc.jpg";
            break;
          case 'GTO':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "기프토";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/gto.jpg";
            break;
          case 'STEEM':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "스팀";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/steem.jpg";
            break;
          case 'STRAT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "스트라티스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/STRAT.png";
            break;
          case 'ZRX':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "제로엑스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/zrx.jpg";
            break;

          case 'REP':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "어거";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/rep.jpg";
            break;
          case 'AE':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "애터니티";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ae.png";
            break;
          case 'XEM':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "넴";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/xem.png";
            break;
          case 'SNT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "스테이터 스네트워크 토큰";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/SNT.jpeg"; //
            break;
          case 'ADA':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "에이다";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ada.png";
            break;
          case 'PPT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "파풀러스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ppt.jpg";
            break;
          case 'CTXC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "코르텍스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ctxc.png";
            break;



          case 'CMT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "코르텍스";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/cmt.png";
            break;
          case 'THETA':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "쎄타코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/theta.png";
            break;
          case 'WTC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "월튼";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/wtc.png";
            break;
          case 'ITC':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "아이오티";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/itc.jpg";
            break;
          case 'TRUE':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "트루체인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/true.jpg";
            break;
          case 'ABT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "아크블록";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/abt.png";
            break;


          case 'RNT':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "원트루네트워크";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/rnt.png";
            break;
          case 'PLY':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "플레이코인";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/ply.jpg";
            break;

            //ALL OR 기본값
          case 'ALL':
            url += "https://api.bithumb.com/public/ticker/" + code;
            hanName = "전체";
            imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/main.jpg";
            break;
          default: // 기본은 모든 정보를 가져온다
            url += "https://api.bithumb.com/public/ticker/ALL";
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
              status: '8888',
              name: ''
            });
            return;
          }

          var original = JSON.parse(body.toString());
          callback(null, {
            code: 200,
            status: original.status,
            data: original.data,
            name: hanName,
            imageLink: imageLink
          });
        });

      }

      // 셔플기계
      function shuffle(arrays) {
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
        let newArray = ['도움말', '지원되는 코인'];
        for (let k = 2; k < 7; k++) {
          newArray[k] = arrays[k];
        }
        return newArray;
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

      // 선택된 코인 가격 출력
      function select_coin_func(app) {
        app.data.fallbackCount = 0;
        var currency = app.getArgument('currency');

        console.log("currency : " + currency);

        Promise.all([promiseJsonConnect(currency)]).then(result => {

          let displayText = '';
          let speechText = '';
          if (result[0].code != 200 || result[0].status != "0000") {
            //문제있음
            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              })
            );
          } else {

            let results = result[0].data;

            let opening_price = parseInt(results.opening_price);
            let closing_price = parseInt(results.closing_price);
            let min_price = parseInt(results.min_price);
            let max_price = parseInt(results.max_price);
            let average_price = parseInt(results.average_price);
            let units_traded = parseInt(results.units_traded);
            let volume_1day = parseInt(results.volume_1day);
            let volume_7day = parseInt(results.volume_7day);
            let buy_price = parseInt(results.buy_price);
            let sell_price = parseInt(results.sell_price);
            let timestamp = parseInt(results.date);
            var dateGetDate = new Date(timestamp);
            let imageLink = result[0].imageLink; // 이미지 주소 복사

            let name = result[0].name; // 사용자 경험을 위한 이름 한글

            let texttemp = '현재 ' + name + '의 가격은 평균' + average_price + '원 입니다. 최저가는 ' + min_price + '원 이며 최고가는 ' + max_price + '원 입니다. ' + endText;

            displayText = '현재 ' + name + '의 가격은 평균' + average_price + '원 입니다. 최저가는 ' + min_price + '원 이며 최고가는 ' + max_price + '원 입니다. ' + endText;

            speechText = displayText;

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              }).addSuggestions(shuffle(coinArray))
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

        let currency = "ALL";
        Promise.all([promiseJsonConnect(currency)]).then(result => {

          let displayText = '';
          let speechText = '';

          if (parseInt(result[0].code) != 200 || result[0].status != "0000") {
            //문제있음
            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              })
            );
          } else {


            let BTC = parseInt(result[0].data.BTC.average_price);
            let ETH = parseInt(result[0].data.ETH.average_price);
            let DASH = parseInt(result[0].data.DASH.average_price);
            let LTC = parseInt(result[0].data.LTC.average_price);
            let ETC = parseInt(result[0].data.ETC.average_price);
            let XRP = parseInt(result[0].data.XRP.average_price);
            let BCH = parseInt(result[0].data.BCH.average_price);
            let XMR = parseInt(result[0].data.XMR.average_price);
            let ZEC = parseInt(result[0].data.ZEC.average_price);
            let QTUM = parseInt(result[0].data.QTUM.average_price);
            let BTG = parseInt(result[0].data.BTG.average_price);
            let EOS = parseInt(result[0].data.EOS.average_price);
            //12
            let imageLink = result[0].imageLink;

            let textinsert = '';

            //자세한 화폐 시세는 추가적인 데이터를 부른다.
            if (actions != "input.welcome") {
              displayText += '비트코인 ' + BTC + '원 \n' +
                '이더리움 ' + ETH + '원 \n' +
                '대쉬 ' + DASH + '원 \n' +
                '라이트코인 ' + LTC + '원 \n' +
                '리플 ' + XRP + '원 \n' +
                '이더리움 클래식' + ETC + '원 \n' +
                '비트코인 캐쉬 ' + BCH + '원 \n' +
                '모네로 ' + XMR + '원 \n' +
                '제트캐쉬 ' + ZEC + '원 \n' +
                '퀀텀 ' + QTUM + '원 \n' +
                '비트코인 골드 ' + BTG + '원 \n' +
                '이오스 ' + EOS + '원 \n' +
                ' 입니다. ';

              textinsert += '비트코인 ' + BTC + '원 \n' +
                '이더리움 ' + ETH + '원 \n' +
                '대쉬 ' + DASH + '원 \n' +
                '라이트코인 ' + LTC + '원 \n' +
                '리플 ' + XRP + '원 \n' +
                '이더리움 클래식' + ETC + '원 \n' +
                '비트코인 캐쉬 ' + BCH + '원 \n' +
                '모네로 ' + XMR + '원 \n' +
                '제트캐쉬 ' + ZEC + '원 \n' +
                '퀀텀 ' + QTUM + '원 \n' +
                '비트코인 골드 ' + BTG + '원 \n' +
                '이오스 ' + EOS + '원 \n' +
                ' 입니다. ';
            } else {
              app.data.fallbackCount = 0;
              if (lastSeen != null) { // re visit.
                displayText += '가상화폐 가격에 다시 오신 것을 환영합니다. 현재 시세는';
                textinsert += '가상화폐 가격에 다시 오신 것을 환영합니다. 현재 시세는';
              } else { // first
                displayText += '가상화폐 가격에 오신것을 환영합니다. 현재 주요 화폐의 시세는 다음과 같습니다. ';
                textinsert += '가상화폐 가격에 오신것을 환영합니다. 현재 주요 화폐의 시세는 다음과 같습니다. ';
              }
              displayText += '\n' +
                '비트코인 ' + BTC + '원 \n' +
                '이더리움 ' + ETH + '원 \n' +
                '리플 ' + XRP + '원 \n' +
                ' 입니다. ' +
                '모든화폐의 시세는 "현재 시세"를 말해주세요.';
              textinsert += '비트코인 ' + BTC + '원 \n' +
                '이더리움 ' + ETH + '원 \n' +
                '리플 ' + XRP + '원 \n' +
                ' 입니다. ' +
                '모든화폐의 시세는 "현재 시세"를 말해주세요.';
            }

            displayText += endText;

            speechText = displayText;

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              }).addSuggestions(shuffle(coinArray))
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle("주요 화폐 시세")
                .setTitle("주요 전자화폐 시세")
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

          if (result[0].code != 200 || result[0].status != "0000") {
            //문제있음

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText,
                displayText: "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요. " + endText
              })
            );
          } else {

            let results = result[0].data;

            let opening_price = parseInt(results.opening_price);
            let closing_price = parseInt(results.closing_price);
            let min_price = parseInt(results.min_price);
            let max_price = parseInt(results.max_price);
            let average_price = parseInt(results.average_price);
            let units_traded = parseInt(results.units_traded);
            let volume_1day = parseInt(results.volume_1day);
            let volume_7day = parseInt(results.volume_7day);
            let buy_price = parseInt(results.buy_price);
            let sell_price = parseInt(results.sell_price);
            let date = parseInt(results.date);
            let imageLink = result[0].imageLink;
            let name = result[0].name;

            let calculator = parseInt(average_price * number); // 계산

            displayText = name + '의 ' + number + '개 가격은 현재 ' + calculator + '원 입니다.' + endText;
            speechText = displayText;

            app.ask(app.buildRichResponse()
              .addSimpleResponse({
                speech: speechText,
                displayText: displayText
              }).addSuggestions(shuffle(coinArray))
              .addBasicCard(app.buildBasicCard('')
                .setSubtitle(calculator.toString())
                .setTitle(name + '의 ' + number + '개 가격')
                .setImage(imageLink, name))
            );
          }
        });


      }

      function bye_func(app) {
        let displayText = '앱을 종료합니다. 이용해 주셔서 감사합니다.';
        let speechText = displayText;
        app.tell(app.buildRichResponse()
          .addSimpleResponse({
            speech: speechText,
            displayText: displayText
          })
        );

      }





      //지원되는 코인
      function supportcoin_func() {
        app.data.fallbackCount = 0;
        let support_coin = '';

        for (let i = 0; i < coinArray.length; i++) {

          if (i == (coinArray.length - 1)) {
            support_coin += coinArray[i]
          } else {
            support_coin += coinArray[i] + ', '
          }

        }

        let support_coin2 = coinArray
        let speechText = "지원되는 코인은 다음과 같습니다. ";
        let displayText = "지원되는 코인은 다음과 같습니다. \n \n* 지원되는 코인 리스트\n" + support_coin;
        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: speechText,
            displayText: displayText
          }).addSuggestions(shuffle(coinArray))
          .addBasicCard(app.buildBasicCard('')
            .setSubtitle('')
            .setTitle('지원되는 코인')
            .setImage("https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/support.png", "지원되는 코인")
          )

        )
      }


      // fallback count & method.
      const FALLBACK_NUMBER = "fallbacks"

      function fallback_func(app) {
        let count = app.data.fallbackCount;
        count++;
        app.data.fallbackCount = count;
        app.setContext(FALLBACK_NUMBER);
        console.log("count++: " + count);
        console.log("app.data.fallbackCount: " + app.data.fallbackCount);
        let speechText = '';
        let displayText = '';

        if (count === 1) {
          displayText = '지원되지 않는 명령어 입니다. 지원되는 명령어 중 하나는 저는 "20 비트코인 가격"을 말하면 계산이 가능합니다. 자 다시 말해주세요.';
          speechText = displayText;
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: speechText,
              displayText: displayText
            }).addSuggestions(shuffle(coinArray))
          );

        } else if (count === 2) {
          displayText = '지원되지 않는 명령어 입니다. 지원되는 명령어 중 하나는 저는 "현재 시세를 알려줘" 를 말하면 현재 12개의 비트코인 시세를 알려줍니다. "지원되는 코인"이라고 말하면 가능한 코인을 알려두립니다. 자 다시 말해주세요.';
          speechText = displayText;
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: speechText,
              displayText: displayText
            }).addSuggestions(shuffle(coinArray))
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

      // intend get
      const actionMap = new Map();

      // intent name
      const WELCOME = 'input.welcome';
      const BYE = 'intent.exit';
      const SELECTCOINPRICE = 'intent.selectcoinprice'; //
      const NOWCOINPRICE = 'intent.nowcoinprice'; //
      const SUPPORTCOIN = 'intent.supportcoin'; //
      const COINCAL = 'intent.cal'; //
      const FALLBACK = 'input.unknown'; //
      //exit
      actionMap.set(WELCOME, nowall_coin_func);

      //exit
      actionMap.set(BYE, bye_func);

      // intend fucntion
      actionMap.set(SELECTCOINPRICE, select_coin_func);
      actionMap.set(NOWCOINPRICE, nowall_coin_func);
      actionMap.set(SUPPORTCOIN, supportcoin_func);
      actionMap.set(COINCAL, coin_cal_func);
      actionMap.set(FALLBACK, fallback_func);


      // go!
      app.handleRequest(actionMap);

      break; // default end
  }

}
