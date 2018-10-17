'use strict'

const {
  dialogflow,
  SignIn
} = require('actions-on-google')
const functions = require('firebase-functions')
const request = require('request')
const promise = require('promise')
const nodemailer = require('nodemailer');

//REF: https://actions-on-google.github.io/actions-on-google-nodejs/classes/conversation.profile.html

const CLIENT_ID = "270308679564-io5q8eemppla50c543mjsetkh7vtbnr8.apps.googleusercontent.com"
// Dialogflow
const app = dialogflow({
  clientId: CLIENT_ID,
  debug: true
});

//No have Event
app.intent('Default Welcome Intent', conv => {
  console.log(conv.user.locale);
  let defaulMessage = '';
  if (conv.user.locale == 'ko-KR') {
    defaulMessage = '아이디를 이용하시겠습니까?';
  } else if ('ja-JP') {
    defaulMessage = '利用しますか？';
  }
  conv.ask(new SignIn(defaulMessage)) // SignIn안의 텍스트는 표시되지 않는다.
})

// Create a Dialogflow intent with the `actions_intent_SIGN_IN` event
// 계정 로그인 시 여기서부터 시작
app.intent('Get Signin', (conv, params, signin) => {

  let defaulMessage = '';

  console.log(signin.status)
  console.log(conv.user.locale);
  if (signin.status === 'OK') {
    const payload = conv.user.profile.payload
    console.log("loaded : ", payload)

    if (conv.user.locale == 'ko-KR') {
      defaulMessage = '계정에 로그인하셨습니다. 어떤 메일 내용을 날리고 싶으신가요? 말하는 내용이 바로 이메일로 전송됩니다.';
    } else if ('ja-JP') {
      defaulMessage = 'アカウントにログインしました。どんなメモをしたいですか？話した内容がすぐに本入メールで送信されます。';
    }

    conv.ask(defaulMessage)
  } else if (signin.status === 'CANCELLED') {

    if (conv.user.locale == 'ko-KR') {
      defaulMessage = '취소를 누르셨습니다. 다음에 이용해 주시면 감사하겠습니다.';
    } else if ('ja-JP') {
      defaulMessage = '[キャンセル]をクリックしました。次の利用いただければありがとうございます。';
    }

    conv.close(defaulMessage);
  } else {
    if (conv.user.locale == 'ko-KR') {
      defaulMessage = '계정 정보를 받지 못했습니다. 앱을 종료합니다.';
    } else if ('ja-JP') {
      defaulMessage = `アカウント情報を受けませんでした。終了すます。`;
    }
    conv.close(defaulMessage);
  }
});

// 메일 보내는 function.
function getEmail(token, callback) {
  var url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token;
  console.log("token : " + token);
  console.log("url: " + url);

  // Get  data
  request({
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    }
  }, function(err, resp, body) {
    if (err) {
      callback(err, {
        code: 400,
        email: '',
        status: 'fail'
      });
      return;
    }
    console.log(body);
    var original = JSON.parse(body);
    console.log("original: " + JSON.stringify(original));

    callback(null, {
      code: 200,
      email: original.email,
      status: 'success'
    });


  });

}

// promise async
const profileGetSync = (token) => new Promise(function(resolved, rejected) {
  getEmail(token, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});


//email
app.intent('email', (conv, params, signin) => {
  console.log("email")

  // 사용자가 말한 내용 => 전부
  const text = conv.parameters['any'];
  //access token get (api 링크 생성을 위해서 필요.)
  const token = conv.user.access.token;
  //log
  console.log("text: ", text);
  //async
  return profileGetSync(token, text)
    .then(function(result) {
      const emailId = result.email;
      console.log("Email: ", emailId)
      // 노출금지. codeshare시 user, pass　삭제
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'noreply.mailsenderaog@gmail.com',
          pass: 'scitmaster987^'
        }
      });
      // 노출금지. codeshare시 user, pass　삭제제

      // 보내는 매일 생성
      var mailOptions = {
        from: 'noreply.mailsenderaog@gmail.com',
        to: emailId,
        subject: text,
        text: text
      };

      //메일 보내기
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      let defaulMessage = '';
      if (conv.user.locale == 'ko-KR') {
        defaulMessage = '에 이메일을 보냈습니다. 앱을 종료합니다.';
      } else if ('ja-JP') {
        defaulMessage = 'にメモを送りしました。アプリを終了します。';
      }

      conv.close(emailId + defaulMessage)

    });

})

//종료하기
app.intent('end', (conv, params, signin) => {
  console.log("END")

  let defaulMessage = '';
  if (conv.user.locale == 'ko-KR') {
    defaulMessage = '앱을 종료합니다.';
  } else if ('ja-JP') {
    defaulMessage = 'アプリを終了します。';
  }

  conv.close(defaulMessage)
})

exports.accountlinkTest = functions.https.onRequest(app)
