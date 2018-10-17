// Title
// 파이널 러시안룰렛
//
// display name and invocation name (동일하게 해야 함)
//
// 파이널 러시안룰렛
//
// Short Description
// 러시안룰렛을 하는 게임입니다.
//
// Full Description
// 러시안룰렛을 하는 게임입니다. 총 6번의 기회! 한번 성공할 때마다 20점씩 얻습니다.
// 술게임이나 모임, 회식등 게임에서 응용이 가능합니다. 지금 도전해보세요!
//
// Company
// Stratos Heavy Industries
//
// sample invocations
// 파이널 러시안룰렛에 연결하기 (invocation name +에 연결하기)
//
//
// Policy
// 아무것도 기록하지 않습니다. 즐기세요.
//
//
// Test method
// 테스트 방법은 간단합니다. 1부터 6까지 숫자를 말하면 됩니다.
// 7이상의 숫자는 엔티티에서 지정하지 않았기에 에러로 표시됩니다.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const ApiAiAction = require('actions-on-google').ApiAiAssistant; // apiai

// cloud function name : finalrussianroulette
// cloud region asia-northeast1-a
// 아직 cloud function은 us 지역만 존재
// https://stackoverflow.com/questions/46902502/use-region-other-than-us-central1-for-google-cloud-functions



exports.finalrussianroulette = (request, response) => {
 console.log('Request body: ' + JSON.stringify(request.body));
    //switch : policy가 없으면 deny되기 때문에 policy페이지 만들어야 함.
    // 구글 문서로도 만들수는 있다.
    switch (request.method) {
        case 'GET': // policy를 위한 페이지임
            response.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });

            var title = '파이널 러시안룰렛 Privacy Policy';
            var body = '<p>* 파이널 러시안룰렛 Privacy Policy</p>\n \
  <p>아무것도 저장하지 않습니다.</p>\n \
  <p>그냥 즐기세요.</p>\n \
  <p> - Stratos Heavy Industry</p>';

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
            // 여기서부터  소스 시작

            // welcome function
            function welcome_func(app) {

                let welcomeText = '<speak><par>' +
                   
                    '<media><break time="2s"/><speak>파이널 러시안룰렛에 온걸 환영합니다. 게임에 대한 도움말은 "매뉴얼"을 말하면 됩니다. 게임을 시작하겠습니까? 시작하려면 "게임시작", 종료하려면 "끝내기"를 말해주세요</speak></media>' +
                    '<media>' +
                    '<audio src="https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg"/></media>' +
                    '</par></speak>';

                let welcomeTextDisplay = "파이널 러시안룰렛에 온걸 환영합니다. 게임에 대한 설명은 '매뉴얼'을 말하면 됩니다. 게임을 시작하겠습니까? 시작하려면 '게임시작', 종료하려면 '끝내기'를 말해주세요.";

                app.ask(app.buildRichResponse()
                    .addSimpleResponse({
                        speech: welcomeText,
                        displayText: welcomeTextDisplay
                    })
                );
            }

            // 게임 시작안하고 종료할때
            function welcome_func_no(app) {
                let noText = "잔넨, 게임을 하지 않고 끝내시다니. 다음에는 꼭! 이용해주세요!";
                app.tell(app.buildRichResponse()
                    .addSimpleResponse({
                        speech: noText,
                        displayText: noText
                    })
                );
            }



            // 게임 스타트(Yes라 말할때 시작됨)
            // context 생성해줘야 함. name: gameflow
            // Context를 생성해야 안에서 돌수있음.
            function startGame(app) {
                // 게임시작때 수를 생성함. 이후 그 수를 사용

                let starttext = '<speak> 그럼 게임을 시작합니다.<audio src="https://actions.google.com/sounds/v1/weapons/gun_reload.ogg" clipEnd ="2s"/> 지금 리볼버에는 총알이 한알 장전 되어 있습니다. ' +
                    '1부터 6까지의 숫자 중 하나를 말해주세요.</speak>';
                let starttextDidplay = '그럼 게임을 시작합니다. (찰칵) 지금 리볼버에는 총알이 한알 장전 되어 있습니다. ' +
                    '1부터 6까지의 숫자 중 하나를 말해주세요.';

                let values = 0; // 점수 Context로 넘긴다
                let randomValue = Math.floor(Math.random() * 6) + 1;

                // make context
                let parameters = {};
                parameters['randomGun'] = randomValue;
                parameters['userValues'] = 0;
                
                app.setContext("random", 20, parameters);
             
                let parameters2 = {};
                parameters2['numbers'] = 999;
                parameters2['values'] = values;
                app.setContext("gameflow", 10, parameters2);

                app.ask(app.buildRichResponse()
                    .addSimpleResponse({
                        speech: starttext,
                        displayText: starttextDidplay
                    })
                    .addSuggestions(['1', '2', '3', '4', '5', '6'])
                );

            }

            // help function
            //다이어로그 플로우에서 처리


            // 게임 부분,
            function russianRoulette(app) {

                let number = app.getArgument('number'); // 파라메터의 숫자를 받는다.
                let randomGun = app.getContextArgument('random', 'randomGun').value;
                let contextValue = app.getContextArgument('gameflow', 'numbers').value;
                let values = app.getContext('gameflow').parameters.values;
                 
    
                //let values = valuess;
                //app.getContextArgument('random', 'userValues').value;

                // 1부터 6까지의 숫자중 랜덤한 숫자를 만드는 로직.

                // random으로 주사위 만드는 형태
                let userSay = parseInt(number); // 숫자로 바꾸는 부분
                let text = ""; //공통 텍스트 받는 부분
                let displaytext = ""; //공통 텍스트 받는 부분
                let searchMethod = /^[1-6]$/g;

                if (userSay == parseInt(randomGun)) { // 러시안 룰렛 실패
                    // make context
                    const parameters = {};
                    parameters['number'] = number;
                    app.setContext("end", 3, parameters);

                    let randomValue = Math.floor(Math.random() * 6) + 1;

                    // make context
                    let parameters2 = {};
                    parameters2['randomGun'] = randomValue;
                    parameters2['userValues'] = 0;
                    app.setContext("random", 20, parameters2);

                    let parameters3 = {};
                    parameters3['numbers'] = 999;
                    parameters3['values'] = 0;
                    app.setContext("gameflow", 10, parameters3);


                    // 이부분에서 총이 발사된 특이점을 따로 만들어줘야 한다.
                    text = '<speak><seq> <media fadeOutDur="0.3s"><audio src="https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/battle_short.ogg"/> </media> <media><audio src="https://actions.google.com/sounds/v1/weapons/m4_shots.ogg" clipEnd ="3s"/></media>' +
                        "<media><speak>총이 발사되었습니다. 으악! 안타깝네요. 당신의 총 점수는 " + values + "점 입니다. " +
                        "계속 하실려면 '다시' 혹은 아무 숫자나 말해주세요. 게임을 끝내고 싶다면 끝내기를 말해주시면 됩니다.</speak></media></seq></speak>";
                    displaytext = "(팡팡!) 총이 발사되었습니다. 으악! 안타깝네요. 당신의 총 점수는 " + values + "점 입니다. " +
                        "계속 하실려면 '다시' 혹은 아무 숫자나 말해주세요. 게임을 끝내고 싶다면 '끝내기'를 말해주시면 됩니다.";
                   
                } else if (userSay > 6 || userSay < 1) {
                    // 1과 6외의 다른 숫자를 말하는 경우
                    // .test 로
                    text = '<speak> <audio src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg" clipEnd ="2s"/>그 숫자는 러시안룰렛 총에 없는 숫자입니다. 1부터 6까지의 숫자 중 하나를 말해주세요.</speak>';
                    displaytext = "그 숫자는 러시안룰렛 총에 없는 숫자입니다. 1부터 6까지의 숫자 중 하나를 말해주세요.";
                } else { // 러시안 룰렛 성공

                    let arrays = contextValue + "";


                    console.log("arrays의 갯수 : " + arrays.split("/").length);
                    if (arrays.indexOf(number) == -1) { // 숫자를 검색해서 없으면 -1
                        // 게임이 끝날경우 분기
                        if (arrays.split("/").length == 5) {


                            let randomValue = Math.floor(Math.random() * 6) + 1;

                            // make context
                            let parameters = {};
                            parameters['randomGun'] = randomValue;
                            parameters['userValues'] = 0;
                            app.setContext("random", 20, parameters);

                            let parameters2 = {};
                            parameters2['numbers'] = 999;
                            parameters2['values'] = 0;
                            app.setContext("gameflow", 10, parameters2);

                            text = '<speak> <seq><media fadeOutDur="0.3s"><audio src="https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/battle.ogg"/></media><media><audio src="https://actions.google.com/sounds/v1/crowds/battle_crowd_celebrate_stutter.ogg" clipEnd ="3s"/></media>' +
                                "<media><speak>축하드립니다. 100점! 모든 총알을 피했습니다. 운이 좋은 편이라는게 증명되었습니다. 게임중이라면 절대방어를 얻었겠네요. 아니면.. 이제 로또를 사보는게 어떨까요? 자 게임을 다시하고 싶으신가요? 다시하고 싶다면 '다시' 혹은 숫자를, 종료하고 싶다면 '끝내기'를 말해주세요.</speak></media></seq></speak>"
                            displaytext = "(환호) 축하드립니다. 100점! 모든 총알을 피했습니다. 운이 좋은 편이라는게 증명되었습니다. 게임중이라면 절대방어를 얻었겠네요. 아니면.. 이제 로또를 사보는게 어떨까요? 자 게임을 다시하고 싶으신가요? 다시하고 싶다면 '다시' 혹은 숫자를, 종료하고 싶다면 '끝내기'를 말해주세요."
                          
                        } else {
                            let saveNumber = contextValue + "/" + number;
                            values += 20; // 점수를 더해줌
                            let parameters = {};
                            parameters['numbers'] = saveNumber;
                            parameters['values'] = values;
                            app.setContext("gameflow", 10, parameters);

                            
                            let parametersRandom = {};
                            parametersRandom['randomGun'] = randomGun;
                            parametersRandom['userValues'] = 0;
                            app.setContext("random", 20, parametersRandom);

                            text = '<speak><seq> <media fadeOutDur="0.3s"><audio src="https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/battle_short.ogg"/></media> <media><audio src="https://actions.google.com/sounds/v1/weapons/gun_trigger_release.ogg" clipEnd ="2s"/></media>' +
                                "<media><speak>총에서 총알이 발사되지 않았습니다. 다행이네요! 현재 당신의 점수는 " + values +
                                " 점 입니다. 계속해서 번호를 말해주세요.</speak></media></seq> </speak>";
                            displaytext = "(철컥) 총에서 총알이 발사되지 않았습니다. 다행이네요! 현재 당신의 점수는 " + values + " 점 입니다. 계속해서 번호를 말해주세요.";
                        }


                    } else { // 이미 있는 숫자를 말한 경우

                        text = '<speak> <audio src="https://actions.google.com/sounds/v1/cartoon/pop.ogg" clipEnd ="2s"/>그 숫자는 이미 말한 숫자입니다. 다른 숫자를 말해주세요.</speak>';
                        displaytext = "그 숫자는 이미 말한 숫자입니다. 다른 숫자를 말해주세요.";
                    }

                } // if end


                // ask text

                app.ask(app.buildRichResponse()
                    .addSimpleResponse({
                        speech: text,
                        displayText: displaytext
                    })
                    .addSuggestions(['1', '2', '3', '4', '5', '6'])
                );





            }
            // 게임 다시 시작시
            function retryGame(app) { // 게임 다시 시작하기

                let retryText = '<speak> 다시 게임을 시작합니다. <audio src="https://actions.google.com/sounds/v1/weapons/gun_reload.ogg" clipEnd ="2s"/> 리볼버가 장전되었습니다. 1부터 6까지의 숫자중 하나를 말해주세요.</speak>';
                let retryTextDisplay = "다시 게임을 시작합니다. (철컥) 리볼버가 장전되었습니다. 1부터 6까지의 숫자 중 하나를 말해주세요."
                let randomValue = Math.floor(Math.random() * 6) + 1;
                // make context
                let parameters = {};
                parameters['randomGun'] = randomValue;
                parameters['userValues'] = 0;
                app.setContext("random", 20, parameters);
             

                let parameters3 = {};
                parameters3['numbers'] = 999;
                parameters3['values'] = 0;
                app.setContext("gameflow", 10, parameters3);

                //ask
                app.ask(app.buildRichResponse()
                    .addSimpleResponse({ // for help text
                        speech: retryText,
                        displayText: retryTextDisplay
                    })
                );

            }

            function unknown_say(app) {

                let contextValue = app.getContextArgument('gameflow', 'numbers').value;
                let temp = contextValue + "";
                var array = temp.split('/');

                console.log(array.length);

                let textin = '';
                let failText = "";
                for (var i in array) {
                    if (i == 0) {

                    } else {
                        textin += array[i] + " ";
                    }
                }
                if (array.length == 1) {
                    failText = "숫자를 말해주세요. 참고로 아직 아무런 숫자를 말하지 않았습니다.";
                } else {

                    failText = "숫자를 말해주세요. 참고로 지금까지 말한 숫자는 " + textin + " 입니다";
                }

                app.ask(app.buildRichResponse()
                    .addSimpleResponse({
                        speech: failText,
                        displayText: failText
                    })
                    .addSuggestions(['1', '2', '3', '4', '5', '6'])
                );

            }


            function endGame(app) { // 게임 종료
                let endText = "이용해 주셔서 감사합니다. 언제든 다시 이용하길 기대할께요.";
				let endTextSSML = '<speak><seq><media><speak>'+endText+' </speak></media><media><audio src="https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/final.ogg"/></media></seq></speak>';
                app.tell({ // tell == exit google asistant
                    speech: endTextSSML,
                    displayText: endText +" (종료음)"
                })
            }

            function notGame(app) { // 게임중이 아닐때
                let endText = "게임중이 아닙니다. 게임을 시작할려면 '다시'를, 종료하실리면 '끝내기'를 말해주세요";

                app.ask({ // tell == exit google asistant
                    speech: endText,
                    displayText: endText
                })
            }

            let actionMap = new Map(); // intent map save list

            actionMap.set('input.welcome', welcome_func); // first : welcome intent
            actionMap.set('DefaultWelcomeIntent.DefaultWelcomeIntent-yes', startGame); // 게임시작
            actionMap.set('intent.gamestart', startGame); // 게임시작

            actionMap.set('DefaultWelcomeIntent.DefaultWelcomeIntent-no', welcome_func_no); // 게임종료

            actionMap.set('intent.end.gameflow', endGame); // 게임종료 (게임중)
            actionMap.set('intent.end', endGame); // 게임종료 (게임중이 아닐때)
            actionMap.set('intent.end.gameflow.end', endGame); // 게임종료 (게임중이 아닐때)

            // 러시안룰렛 게임중, 7이상의 숫자 처리
            actionMap.set('intent.number', russianRoulette);

            actionMap.set('intent.retry', retryGame); // 다시 시작
            actionMap.set('intent.retry.gameflow', retryGame); // // 게임중 다시시작

            actionMap.set('intentendgameflowend.intentendgameflowend-fallback', notGame); // 게임중인 아닐때
            actionMap.set('intentnumber.intentnumber-fallback', unknown_say); // 게임중 숫자 아닌걸 말할때
            actionMap.set('intent.end.gameflow.end.fallback', unknown_say); // 게임중 
            app.handleRequest(actionMap); //   intent search
            
            break; // end
    }

}
