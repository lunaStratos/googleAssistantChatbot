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
  MediaObject
} = require('actions-on-google');
const functions = require('firebase-functions');

// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';


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
  const imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/sunung/sunung.png';
  const ssmlSound = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/sunung/sunung.mp3'
  const mediaSound = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/sunung/digi_sunung.mp3'
  // App name
  const appTitle = '수능 타이머';

  //KST변환 2019
  let nowTime = new Date('2018-11-15').getTime()
  let sunungYear = new Date('2018-11-15').getFullYear() + 1 //  2018년 수능은 2019년 수능이라고 부른다.
  let sunungDay = new Date('2018-11-15').getFullYear() + '년 ' + (new Date('2018-11-15').getMonth() + 1) + '월 ' + new Date('2018-11-15').getDate() + '일'
  let endTime = new Date().getTime() + 1000 * 60 * 60 * 9

  let result = endTime - nowTime
  let resultDay = Math.abs(parseInt(result / (24 * 60 * 60 * 1000)))
  let resultHour = Math.abs(parseInt(result / (60 * 60 * 1000))) - resultDay * 24
  let resultMinute = Math.abs(parseInt(result / (60 * 1000))) - resultDay * 24 * 60 - resultHour * 60
  let lastResult = resultDay + '일 ' + resultHour + '시 ' + resultMinute + '분'

  //KST변환
  let nowTime2020 = new Date('2019-11-14').getTime()
  let sunungYear2020 = new Date('2019-11-14').getFullYear() + 1 //  2018년 수능은 2019년 수능이라고 부른다.
  let sunungDay2020 = new Date('2019-11-14').getFullYear() + '년 ' + (new Date('2019-11-14').getMonth() + 1) + '월 ' + new Date('2019-11-14').getDate() + '일'
  let endTime2020 = new Date().getTime() + 1000 * 60 * 60 * 9

  let result2020 = endTime2020 - nowTime2020
  let resultDay2020 = Math.abs(parseInt(result2020 / (24 * 60 * 60 * 1000)))
  let resultHour2020 = Math.abs(parseInt(result2020 / (60 * 60 * 1000))) - resultDay2020 * 24
  let resultMinute2020 = Math.abs(parseInt(result2020 / (60 * 1000))) - resultDay2020 * 24 * 60 - resultHour2020 * 60
  let lastResult2020 = resultDay2020 + '일 ' + resultHour2020 + '시 ' + resultMinute2020 + '분'

  //KST변환
  let nowTime2021 = new Date('2020-11-19').getTime()
  let sunungYear2021 = new Date('2020-11-19').getFullYear() + 1 //  2018년 수능은 2019년 수능이라고 부른다.
  let sunungDay2021 = new Date('2020-11-19').getFullYear() + '년 ' + (new Date('2020-11-19').getMonth() + 1) + '월 ' + new Date('2020-11-19').getDate() + '일'
  let endTime2021 = new Date().getTime() + 1000 * 60 * 60 * 9

  let result2021 = endTime2021 - nowTime2021
  let resultDay2021 = Math.abs(parseInt(result2021 / (24 * 60 * 60 * 1000)))
  let resultHour2021 = Math.abs(parseInt(result2021 / (60 * 60 * 1000))) - resultDay2021 * 24
  let resultMinute2021 = Math.abs(parseInt(result2021 / (60 * 1000))) - resultDay2021 * 24 * 60 - resultHour2021 * 60
  let lastResult2021 = resultDay2021 + '일 ' + resultHour2021 + '시 ' + resultMinute2021 + '분'

  //response
  let insertSpeakSSML = sunungYear + '년의 수능은 ' + lastResult + '남았습니다. 수능날은 ' + sunungDay + '입니다.'
  displayText = insertSpeakSSML + '\n *' +sunungYear2020 +' 수능 D-Day : ' + lastResult2020 +'\n *' +sunungYear2021 +' 수능 D-Day : ' + lastResult2021
  speechText ='<speak><par>' +
    '<media><speak><break time="3s"/>' + insertSpeakSSML + "</speak></media>" +
    '<media fadeOutDur="2s" soundLevel="-10dB"  ><audio src="' + ssmlSound + '"/></media>' +
    '</par></speak>'

  conv.close(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.close(new MediaObject({
    name: appTitle,
    url: mediaSound,
    description: lastResult +' 남았습니다.',
    icon: new Image({
      url: imageLink,
      alt: appTitle,
    }),
  }));

});


// Action name is different to method name.
// my action name is dialogv2. So If you want another name, please rename it.
// action name: dialogv2 => change your action name.
exports.sunung = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
