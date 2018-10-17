'use strict';

// 합필을 맞추는 게임
// 비둘기야 먹자에 연결하기

process.env.DEBUG = 'actions-on-google:*';
const DialogflowApp = require('actions-on-google').DialogflowApp; // DialogflowApp

// cloud function name : finalrussianroulette
// cloud region asia-northeast1-a
// 아직 cloud function은 us 지역만 존재
// https://stackoverflow.com/questions/46902502/use-region-other-than-us-central1-for-google-cloud-functions


exports.tekbeaCompare = (request, response) => {
  console.log('Request body: ' + JSON.stringify(request.body));
  //switch : policy가 없으면 deny되기 때문에 policy페이지 만들어야 함.
  // 구글 문서로도 만들수는 있다.
  switch (request.method) {
    case 'GET': // policy를 위한 페이지임
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      var title = '비둘기야 먹자 Privacy Policy';
      var body = '<p>* 비둘기야 먹자 Privacy Policy</p>\n \
  <p>아무것도 저장하지 않습니다.</p>\n \
  <p>그냥 즐기세요.</p>\n \
  <p> - Stratos Heavy Industry</p>\n \
<p></p>\n \
<p>앱 목적 : Object를 context에 넣어서 넘기는지 확인</p>';

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

      const app = new DialogflowApp({
        request,
        response
      });
      // 여기서부터  소스 시작

      console.log("app.getIntent()" + app.getIntent());

      function localAreaCal(cityFrom, cityTo) {
        let sameCity = false;

        if (cityFrom == '서울' || cityFrom == '인천' || cityFrom == '경기') {
          if (cityTo == '서울' || cityTo == '인천' || cityTo == '경기') {
            sameCity = true;
          } else {

          }
        } else if (cityFrom == '세종' || cityFrom == '충남' || cityFrom == '대전') {
          if (cityTo == '세종' || cityTo == '충남' || cityTo == '대전') {
            sameCity = true;
          } else {

          }

        } else if (cityFrom == '경남' || cityFrom == '울산' || cityFrom == '부산') {
          if (cityTo == '경남' || cityTo == '울산' || cityTo == '부산') {
            sameCity = true;
          } else {

          }

        } else if (cityFrom == '광주' || cityFrom == '전남') {
          if (cityTo == '광주' || cityTo == '전남') {
            sameCity = true;
          } else {

          }

        } else if (cityFrom == '경북' || cityFrom == '대구') {
          if (cityTo == '경북' || cityTo == '대구') {
            sameCity = true;
          } else {

          }

        } else if (cityFrom == '강원' || cityFrom == '제주' || cityFrom == '충북') { // 단독 도시
          if (cityTo == cityFrom) {
            sameCity = true;
          } else {

          }

        } // 동일권역 계산기 종료

        return sameCity;
      }
      // welcome function
      function welcome_func(app) {
        app.data.fallbackCount = 0;
        let TextDisplay = '';

        if (app.getLastSeen() == null) {
          TextDisplay = '안녕하세요. 택배요금 계산기입니다. 이 앱은 우체국, 롯데택배, CJ대한통운, 드림택배, 한진택배, GS & CU의 요금을 계산할 수 있는 앱입니다. 원하시는 회사와 도시 그리고 총 길이와 무게를 말해주세요. 예를들어' +
            '"우체국의 서울부터 부산까지 130cm 18kg은 얼마?"처럼 보내는지역 받는지역 길이 무게순으로 말해주세요. 비교를 원하시면 "비교하기" 를 추가로 말해주시면 됩니다. 잘 모르겠다면 "메뉴얼" 을 말해주세요.';
        } else {
          TextDisplay = '다시 오셔서 반갑 반갑 반갑습니다. 택배요금 계산기입니다. 원하시는 회사와 도시 그리고 총 길이와 무게순으로 말해주세요. 아시다시피 비교도 가능합니다';
        }

        if (app.getIntent() == 'command.reset') {
          TextDisplay = '다시 원하시는 회사와 도시 그리고 총 길이와 무게를 말해주세요. 예를들어 ' +
            '"우체국의 서울부터 부산까지 130cm 18kg은 얼마?"라고 말해주시면 됩니다. ';
        }

        let TextSpeech = TextDisplay;

        app.data.repeat = TextDisplay;
        app.data.repeatChip = ['우체국', '한진택배', 'CJ대한통운', '롯데택배', '우체국', '택배가격 비교', '사용방법'];
        app.data.repeatImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/tekbea.jpg';
        app.data.repeatTitle = '환영합니다';

        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: TextSpeech,
            displayText: TextDisplay
          }).addSuggestions(['우체국', '한진택배', 'CJ대한통운', '롯데택배', '우체국', '택배가격 비교', '사용방법'])
          .addBasicCard(app.buildBasicCard('')
            .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/tekbea.jpg', '환영합니다')
          )
        );

      }

      // repeat listen
      function repeat_func(app) {
        app.data.fallbackCount = 0;

        let TextDisplay = app.data.repeat;
        let TextSpeech = app.data.repeat;

        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: TextSpeech,
            displayText: TextDisplay
          }).addSuggestions(app.data.repeatChip)
          .addBasicCard(app.buildBasicCard('')
            .setImage(app.data.repeatImage, app.data.repeatTitle)
          )
        );

      }

      function noinput(app) {
        if (app.getRepromptCount() === 0) {
          app.ask("잘 들리지 않았습니다. '사용방법'을 참조하시거나 '우체국 서울부터 강원까지 100cm 10kg' 이런 식으로 말해주세요");
        } else if (app.getRepromptCount() === 1) {
          app.ask("잘 안들렸습니다. 뭘 말해야 할지 모르신가요? 그러면 '사용방법'을 참조하시거나 우선 회사명이라도 말해주세요");
        } else if (app.isFinalReprompt()) {
          app.tell("죄송합니다. 더욱 발전시켜서 다시 오겠습니다. 앱을 종료합니다. ");
        }

      }

      //fallback no match word
      function fallback_func(app) {

        app.data.fallbackCount++;

        if (parseInt(app.data.fallbackCount) === 1) {
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: "잘 못들었습니다. '사용방법'을 참조하시거나 '우체국 서울부터 강원까지 100cm 10kg' 이런 식으로 말해주세요",
              displayText: "잘 못들었습니다. '사용방법'을 참조하시거나 '우체국 서울부터 강원까지 100cm 10kg' 이런 식으로 말해주세요"
            }).addSuggestions(['사용방법', '우체국', 'CJ대한통운', '드림택배', '한진택배', '롯데택배', '택배가격 비교'])
          );
        } else if (parseInt(app.data.fallbackCount) === 2) {
          app.ask(app.buildRichResponse()
            .addSimpleResponse({
              speech: "이해를 하지 못했습니다. 혹시 사용방법이 어려우신가요? 그러면 '사용방법'을 참조하시거나 우선 회사명이라도 말해주세요",
              displayText: "이해를 하지 못했습니다. 혹시 사용방법이 어려우신가요? 그러면 '사용방법'을 참조하시거나 우선 회사명이라도 말해주세요"
            }).addSuggestions(['사용방법', '우체국', 'CJ대한통운', '드림택배', '한진택배', '롯데택배', '택배가격 비교'])
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

      function sayCommand_func(app) {
        app.data.fallbackCount = 0;
        let company = app.getArgument('company');
        let cm = app.getArgument('number');
        let kg = app.getArgument('number1');
        let from = app.getArgument('area');
        let to = app.getArgument('area1');

        let TextDisplay = '말씀하신 회사는 ' + company + '이며 ' + from + '에서 ' + to + '로 배달되는 ' + cm + 'cm 길이의 ' + kg + 'kg 입니다. 맞으면 "예". 틀리면 "아니오"를 말해주세요.';
        let TextSpeech = TextDisplay;

        app.data.repeatChip = ['예', '아니오', '다시듣기'];
        app.data.repeat = TextDisplay;
        app.data.repeatImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/confirm.png';
        app.data.repeatTitle = company + ' 선택';

        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: TextSpeech,
            displayText: TextDisplay
          }).addSuggestions(['예', '아니오', '다시듣기'])
          .addBasicCard(app.buildBasicCard('')
            .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/confirm.png', company + ' 선택')
          )
        );
      }

      function sayCompare_func(app) {
        app.data.fallbackCount = 0;

        let cm = app.getArgument('number');
        let kg = app.getArgument('number1');
        let from = app.getArgument('area');
        let to = app.getArgument('area1');
        let visit = '방문'; // 방문 기본 셋팅
        console.log("kg: "+kg);
        let companyArray = ['우체국', '롯데택배', '드림택배', '한진택배', 'CJ대한통운']
        let resultArray = [];
        for (var i = 0; i < companyArray.length; i++) {
          let resultVal = calculator_app(companyArray[i], from, to, kg, cm, visit);
          if (resultVal.possible == false) { // 불가능인경우
            resultArray.push({
              "name": companyArray[i],
              "val": 99999,
              "possible": false
            });
          } else { // 가능인경우
            resultArray.push({
              "name": companyArray[i],
              "val": resultVal.price,
              "possible": true
            });
          }

        }

        let lowPriceCompare = 0;

        // 정렬부분
        for (var i = 0; i < resultArray.length; i++) {
          for (var j = 1; j < resultArray.length; j++) {
            if (resultArray[j - 1].val > resultArray[j].val) {
              var temp;
              temp = resultArray[j - 1];
              resultArray[j - 1] = resultArray[j];
              resultArray[j] = temp;
            }
          }
        }

        let resultTextField = '최저가는 ';
        let resultTextFieldPlus = '';
        let resultValAll = '';

        // 최저가 하나만 뽑기


        //텍스트 출력 부분
        for (var i = 0; i < resultArray.length; i++) {
          // 텍스트 출력
          if (resultArray[i].possible == false) {
            resultValAll += resultArray[i].name + ' ' + '무게 길이 초과로 불가능 \n';
          } else {
            resultValAll += resultArray[i].name + ' ' + resultArray[i].val + '원 \n';
          }

          // 음성& 텍스트 부분
          if (resultArray[0].possible == true) {
            resultTextField = '최저가는 ' + resultArray[0].name + ' ' + resultArray[0].val + '원 ';

            if (i < (resultArray.length - 1)) {
              if (resultArray[0].val == resultArray[i + 1].val) {
                resultTextFieldPlus += resultArray[i + 1].name + ' ' + resultArray[i + 1].val + '원 ';
              }
            }

          } else {
            resultTextField = '모든 택배가 cm과 무게초과로 불가능';
          }

        }


        let TextDisplay = '비교 결과는 다음과 같습니다. ' + resultTextField + resultTextFieldPlus + ' 입니다. 다음 질문을 해 주세요.';
        let TextSpeech = TextDisplay;

        app.data.repeatChip = ['다시한번 듣기'];
        app.data.repeat = TextDisplay;
        app.data.repeatImage = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/compare.png';
        app.data.repeatTitle = '회사별 비교결과';

        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: TextSpeech,
            displayText: TextDisplay
          }).addSuggestions(['다시한번 듣기'])
          .addBasicCard(app.buildBasicCard(resultValAll)
            .setTitle('비교결과')
            .setImage('https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/compare.png', '회사별 비교결과')
            .setImageDisplay('CROPPED')
          )
        );

      }

      function result_func(app) {

        let contextGet = app.getContext('commandsay-followup');
        console.log(contextGet);
        let company = contextGet.parameters.company;
        let cm = contextGet.parameters.number;
        let kg = contextGet.parameters.number1;
        let cityFrom = contextGet.parameters.area;
        let cityTo = contextGet.parameters.area1;
        let visit = contextGet.parameters.visit;

        console.log(company[0]);
        console.log(cm[0]);
        console.log(kg[0]);
        console.log(cityFrom[0]);
        console.log(cityTo[0]);
        console.log(visit);

        let resultData = calculator_app(company[0], cityFrom[0], cityTo[0], kg[0], cm[0], visit);
        let TextDisplay = '';
        if (resultData.possible == false) { // 불가능인경우
          TextDisplay = '문의하신 ' + company[0] + '의 택배는 무게 혹은 길이 초과로 접수를 받지 못합니다.';
        } else { // 가능인경우

          TextDisplay = '문의하신 ' + company[0] + '의 가격은 ' + resultData.price + '원 입니다.';
          let plusText = ' ';
          if (company[0] == 'CJ대한통운') {
            plusText = ' 참고로 cj대한통운은 대한통운 앱으로 접수시 1000원이 할인됩니다. ';

          } else if (company[0] == '한진택배') {
            plusText = ' 이마트24나 이마트에서 접수시 크기 무게 거리 상관없이 한진택배는 3500원 고정입니다. ';
          }
          TextDisplay + plusText;
        }

        let TextSpeech = TextDisplay;

        app.data.repeatChip = ['다시듣기'];
        app.data.repeat = TextDisplay + '다음 질문을 해 주세요.';
        app.data.repeatImage = resultData.image;
        app.data.repeatTitle = company[0] + ' 택배가격';


        app.ask(app.buildRichResponse()
          .addSimpleResponse({
            speech: TextSpeech + '다음 질문을 해 주세요.',
            displayText: TextDisplay + '다음 질문을 해 주세요.'
          }).addSuggestions(['다시듣기'])
          .addBasicCard(app.buildBasicCard(TextDisplay)
            .setTitle(company[0] + '택배결과')
            .setImage(resultData.image, company[0] + ' 택배가격')
          )
        );
      }

      function calculator_app(company, cityFrom, cityTo, kg, cm, visit) {

        let possible = true; // 초과시 불가능한지

        let calPrice = 0; // return 값

        let level = 0; // 최종 택배 가격선
        let sameCity = false; // 동일 지역
        let jeju = false; // 제주표시
        let kgCal = 0;
        let cmCal = 0;
        let visitCal = true; // 우체국 창구 방문인지
        let image = ''; // 이미지 링크

        console.log("company: " + company);
        console.log("kg: " + kg);
        console.log("cm: " + cm);

        // 회사이름으로 요금 계산
        // 요금 기준은 https://parcel.epost.go.kr/parcel/use_guide/charge_1.jsp
        switch (company) {
          case '우체국':
            image = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/k_post.jpg';
            if (visit == '창구') {
              visitCal = false;
            }

            // 중량 계산
            if (kg <= 2) { // 2kg
              kgCal = 1;
            } else if (kg > 2 && kg <= 5) { // 5kg
              kgCal = 2;
            } else if (kg > 5 && kg <= 10) { // 10
              kgCal = 3;
            } else if (kg > 10 && kg <= 20) { // 20
              kgCal = 4;
            } else if (kg > 20 && kg <= 30) { // 30
              kgCal = 5;
            } else if (kg > 30) { // 30 초과
              kgCal = 0; //false;
              possible = false;
            }

            // cm 계산
            if (cm <= 60) {
              cmCal = 1;
            } else if (cm > 60 && cm <= 80) {
              cmCal = 2;
            } else if (cm > 80 && cm <= 120) {
              cmCal = 3;
            } else if (cm > 120 && cm <= 140) {
              cmCal = 4;
            } else if (cm > 140 && cm <= 160) {
              cmCal = 5;
            } else if (cm > 160) { // 총합의 길이가 160을 초과하면 안된다.
              cmCal = 0;
              possible = false;
            }

            if ((cityFrom == '제주' && cityTo != cityFrom) || (cityTo == '제주' && cityTo != cityFrom)) {
              jeju = true;
            }

            sameCity = localAreaCal(cityFrom, cityTo);

            if (cmCal >= kgCal) {
              level = cmCal;
            } else if (cmCal <= kgCal) {
              level = kgCal;
            }

            // 창구접수를 기본으로 한다
            // 방문접수를 더한다
            if (level == 1) { // 1단계
              calPrice = 3500;
              if (sameCity == false && jeju == false && visitCal == false) {
                calPrice += 500;
              } else if (sameCity == false && jeju == true && visitCal == false) {
                calPrice += 2000;
              } else if (sameCity == true) {

              }

              //방문접수
              if (visitCal == true && sameCity == true) {
                calPrice += 500;
              } else if (visitCal == true && sameCity == false && jeju == false) {
                calPrice += 1500;
              } else if (visitCal == true && sameCity == false && jeju == true) {
                calPrice += 3000;
              }


            } else if (level == 2) {
              calPrice = 4000;
              if (sameCity == false && jeju == false && visitCal == false) {
                calPrice += 500;
              } else if (sameCity == false && jeju == true && visitCal == false) {
                calPrice += 3000;
              }

              //방문접수
              if (visitCal == true && sameCity == true) {
                calPrice += 1000;
              } else if (visitCal == true && sameCity == false && jeju == false) {
                calPrice += 2000;
              } else if (visitCal == true && sameCity == false && jeju == true) {
                calPrice += 4000;
              }

            } else if (level == 3) {
              calPrice = 5500;
              if (sameCity == false && jeju == false && visitCal == false) {
                calPrice += 500;
              } else if (sameCity == false && jeju == true && visitCal == false) {
                calPrice += 3000;
              }
              //방문접수
              if (visitCal == true && sameCity == true) {
                calPrice += 1000;
              } else if (visitCal == true && sameCity == false && jeju == false) {
                calPrice += 2000;
              } else if (visitCal == true && sameCity == false && jeju == true) {
                calPrice += 4000;
              }

            } else if (level == 4) {
              calPrice = 7000;
              if (sameCity == false && jeju == false && visitCal == false) {
                calPrice += 500;
              } else if (sameCity == false && jeju == true && visitCal == false) {
                calPrice += 3000;
              }
              //방문접수
              if (visitCal == true && sameCity == true) {
                calPrice += 1000;
              } else if (visitCal == true && sameCity == false && jeju == false) {
                calPrice += 2000;
              } else if (visitCal == true && sameCity == false && jeju == true) {
                calPrice += 4000;
              }

            } else if (level == 5) {
              calPrice = 8500;
              if (sameCity == false && jeju == false && visitCal == false) {
                calPrice += 500;
              } else if (sameCity == false && jeju == true && visitCal == false) {
                calPrice += 3500;
              }
              //방문접수
              if (visitCal == true && sameCity == true) {
                calPrice += 1000;
              } else if (visitCal == true && sameCity == false && jeju == false) {
                calPrice += 2000;
              } else if (visitCal == true && sameCity == false && jeju == true) {
                calPrice += 4500;
              }
            }



            break;
          case 'CJ대한통운':
          // https://www.cjlogistics.com/ko/support/guide/parcel
            image = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/cj.jpg';
            // 중량 계산
            if (kg <= 2) { // 2kg
              kgCal = 1;
            } else if (kg > 2 && kg <= 5) { // 5kg
              kgCal = 2;
            } else if (kg > 5 && kg <= 15) { // 10
              kgCal = 3;
            } else if (kg > 15 && kg <= 25) { // 20
              kgCal = 4;
            } else if (kg > 25) { // 30 초과
              kgCal = 9; //false;
              possible = false;
            }

            // cm 계산
            if (cm <=80) {
              cmCal = 1;
            } else if (cm > 80 && cm <= 100) {
              cmCal = 2;
            } else if (cm > 100 && cm <= 120) {
              cmCal = 3;
            } else if (cm > 120 && cm <= 160) {
              cmCal = 4;
            } else if (cm > 160) { // 총합의 길이가 160을 초과하면 안된다.
              cmCal = 9;
              possible = false;
            }

            if ((cityFrom == '제주' && cityTo != cityFrom) || (cityTo == '제주' && cityTo != cityFrom)) {
              jeju = true;
            }

            //동일권역 계산기
            sameCity = localAreaCal(cityFrom, cityTo);

            // 센치미터와 무게 둘중 하나가 더 큰 순으로
            if (cmCal >= kgCal) {
              level = cmCal;
            } else if (cmCal <= kgCal) {
              level = kgCal;
            }

            // 각 레벨당 가격
            if (level == 1) { // 1단계
              calPrice = 5000;
            } else if (level == 2) {
              calPrice = 7000;
            } else if (level == 3) {
              calPrice = 8000;
            } else if (level == 4) {
              calPrice = 9000;
            }

            // 동일권역 타권역 그리고 제주도 추가 운임
            if (sameCity == false && jeju == false) {
              calPrice += 1000;
            } else if (sameCity == false && jeju == true) {
              calPrice += 4000;
            } else if (sameCity == true && jeju == true) {

            }

            break;
          case '편의점':
            break;
          case '한진택배':
            image = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/hanjin.jpg';
            // 중량 계산
            if (kg <= 1) { // 2kg
              kgCal = 1;
            } else if (kg > 1 && kg <= 10) { // 5kg
              kgCal = 2;
            } else if (kg > 10 && kg <= 20) { // 10
              kgCal = 3;
            } else if (kg > 20 && kg <= 25) { // 20
              kgCal = 4;
            } else if (kg > 25) { // 30 초과
              kgCal = 9; //false;
              possible = false;
            }

            // cm 계산
            if (cm <= 60) {
              cmCal = 1;
            } else if (cm > 60 && cm <= 120) {
              cmCal = 2;
            } else if (cm > 120 && cm <= 140) {
              cmCal = 3;
            } else if (cm > 140 && cm <= 160) {
              cmCal = 4;
            } else if (cm > 160) { // 총합의 길이가 160을 초과하면 안된다.
              cmCal = 9;
              possible = false;
            }

            if ((cityFrom == '제주' && cityTo != cityFrom) || (cityTo == '제주' && cityTo != cityFrom)) {
              jeju = true;
            }


            //한진택배는 동일권역 아님
            if (cityFrom == cityTo) {
              sameCity = true;
            } else if (cityFrom != cityTo) {
              sameCity = false;
            }

            // 센치미터와 무게 둘중 하나가 더 큰 순으로
            if (cmCal >= kgCal) {
              level = cmCal;
            } else if (cmCal <= kgCal) {
              level = kgCal;
            }

            // 각 레벨당 가격
            if (level == 1) { // 1단계
              calPrice = 4000;
            } else if (level == 2) {
              calPrice = 4000;
            } else if (level == 3) {
              calPrice = 5000;
            } else if (level == 4) {
              calPrice = 6000;
            }

            // 동일권역 타권역 그리고 제주도 추가 운임
            if (sameCity == false && jeju == false) {
              calPrice += 1000;
            } else if (sameCity == false && jeju == true) {
              calPrice += 3000;
            } else if (sameCity == true && jeju == true) {

            }

            break;

          case '드림택배':
            image = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/dream.jpg';
            // 중량 계산
            if (kg <= 1) { // 2kg
              kgCal = 1;
            } else if (kg > 1 && kg <= 10) { // 5kg
              kgCal = 2;
            } else if (kg > 10 && kg <= 20) { // 10
              kgCal = 3;
            } else if (kg > 20 && kg <= 30) { // 20
              kgCal = 4;
            } else if (kg > 30) { // 30 초과
              kgCal = 9; //false;
              possible = false;
            }

            // cm 계산
            if (cm <= 60) {
              cmCal = 1;
            } else if (cm > 60 && cm <= 120) {
              cmCal = 2;
            } else if (cm > 120 && cm <= 140) {
              cmCal = 3;
            } else if (cm > 140 && cm <= 160) {
              cmCal = 4;
            } else if (cm > 160) { // 총합의 길이가 160을 초과하면 안된다.
              cmCal = 9;
              possible = false;
            }

            if ((cityFrom == '제주' && cityTo != cityFrom) || (cityTo == '제주' && cityTo != cityFrom)) {
              jeju = true;
            }

            //동일권역 계산기
            sameCity = localAreaCal(cityFrom, cityTo);

            // 센치미터와 무게 둘중 하나가 더 큰 순으로
            if (cmCal > kgCal) {
              level = cmCal;
            } else if (cmCal < kgCal) {
              level = kgCal;
            } else if (cmCal == kgCal) {
              level = kgCal;
            }

            // 각 레벨당 가격
            if (level == 1) { // 1단계
              calPrice = 5000;
            } else if (level == 2) {
              calPrice = 8000;
            } else if (level == 3) {
              calPrice = 10000;
            } else if (level == 4) {
              calPrice = 12000;
            }

            // 동일권역 타권역 그리고 제주도 추가 운임
            if (sameCity == false && jeju == false) {

            } else if (sameCity == false && jeju == true) {
              calPrice += 2000;
            } else if (sameCity == true && jeju == true) {

            }

            break;

          case '롯데택배':
            image = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/tekbeaImage/lotte.gif';
            // 중량 계산
            if (kg <= 10) { // 2kg
              kgCal = 1;
            } else if (kg > 10 && kg <= 20) { // 5kg
              kgCal = 2;
            } else if (kg > 20 && kg <= 25) { // 10
              kgCal = 3;
            } else if (kg > 25) { // 30 초과
              kgCal = 9; //false;
              possible = false;
            }
            console.log("possible in kgCal flow: " + possible);

            // cm 계산
            if (cm <= 120) {
              cmCal = 1;
            } else if (cm > 120 && cm <= 140) {
              cmCal = 2;
            } else if (cm > 140 && cm <= 160) {
              cmCal = 3;
            } else if (cm > 160) { // 총합의 길이가 160을 초과하면 안된다.
              cmCal = 9;
              possible = false;
            }
            console.log("possible in cmCal flow: " + possible);

            if ((cityFrom == '제주' && cityTo != cityFrom) || (cityTo == '제주' && cityTo != cityFrom)) {
              jeju = true;
            }

            //동일권역 계산기
            sameCity = localAreaCal(cityFrom, cityTo);

            // 센치미터와 무게 둘중 하나가 더 큰 순으로
            if (cmCal > kgCal) {
              level = cmCal;
            } else if (cmCal < kgCal) {
              level = kgCal;
            } else if (cmCal == kgCal) {
              level = kgCal;
            }

            // 각 레벨당 가격
            if (level == 1) { // 1단계
              calPrice = 4000;
            } else if (level == 2) {
              calPrice = 5000;
            } else if (level == 3) {
              calPrice = 6000;
            }

            // 동일권역 타권역 그리고 제주도 추가 운임
            if (sameCity == false && jeju == false) {
              calPrice += 1000;
            } else if (sameCity == false && jeju == true) {
              calPrice += 3000;
            } else if (sameCity == true && jeju == true) {

            }

            if (visit == '창구') {
              calPrice -= 1000;
            }
            break;
        } // swtich

        console.log("level: " + level);
        console.log("sameCity: " + sameCity);
        console.log("jeju: " + jeju);
        console.log("kgCal: " + kgCal);
        console.log("cmCal: " + cmCal);
        console.log("visitCal: " + visitCal);
        console.log("possible: " + possible);

        let resultJson = {
          "image": image,
          "price": calPrice,
          "possible": possible
        };
        return resultJson;


      }

      function exit_func(app){
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



      let actionMap = new Map(); // intent map save list

      const WELCOME_INTENT = 'input.welcome';
      const COMMANDSAY_INTENT = 'command.say';
      const RESULT_INTENT = 'command.result';
      const COMPARE_INTENT = 'command.compare';
      const REPEAT_INTENT = 'repeat.intent';
      const FALLBACK_INTENT = 'input.unknown';
      const RESET = 'command.reset';
      const NOINPUT = 'noinput';

      const EXITAPP = 'command.exit';


      actionMap.set(WELCOME_INTENT, welcome_func); // first : welcome intent
      actionMap.set(COMMANDSAY_INTENT, sayCommand_func);
      actionMap.set(COMPARE_INTENT, sayCompare_func);
      actionMap.set(RESULT_INTENT, result_func);

      actionMap.set(REPEAT_INTENT, repeat_func);
      actionMap.set(FALLBACK_INTENT, fallback_func);
      actionMap.set(RESET, welcome_func);
      actionMap.set(NOINPUT, noinput);

      actionMap.set(EXITAPP, exit_func);



      app.handleRequest(actionMap); //   intent search

      break; // end
  }

}
