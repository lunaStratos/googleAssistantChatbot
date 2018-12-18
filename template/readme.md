# Google Assistant & Dialogflow 부가설명

로또마스터로 일단 기본적인 챗봇을 구현할 수 있지만 dialogflow의 진정한 매력은 이하의 기능을 사용하는 것입니다. 아래의 기능을 위치정보나 게임 등을 구현할수 있습니다.

## Context

Context는 대화 연결 구조를 만드는 기능입니다.

예를들어 하나의 Intent에서
**예**를 말하면 **B**로 연결 되야 하는 말이 있고
**아니오**를 말하면 **D**로 연결 되야 하는 말이 있다고 칩시다.

즉, 말의 분기점이 있을때 context로 이름을 설정하여 구현을 합니다.

이럴게 아니라 실제 파일로 예를 들어보겠습니다.

우선 [샘플파일](./KoreaContextTest.zip)입니다.

<p align="center">
<img src="./img/context_01.png?raw=true"/>
</p>

mix와 yaki라는 intent가 보일겁니다.

<p align="center">
<img src="./img/context_02.png?raw=true"/>
</p>

우선 EatApple intent입니다. *사과를 먹자* 라고 말하면 작동을 합니다.

<p align="center">
<img src="./img/context_03.png?raw=true"/>
</p>

그 다음으로 분기점입니다. *구워서 먹자*를 하면 output에 yaki를 출력하는 context 입니다.

<p align="center">
<img src="./img/context_031.png?raw=true"/>
</p>

mix *갈아서 먹자*를 하면 output에 mix를 출력하는 context 입니다.

context가 출력되는 것은 대화상에서는 보이지 않습니다. 하지만 결과보기를 말하면

<p align="center">
<img src="./img/context_041.png?raw=true"/>
</p>

<p align="center">
<img src="./img/context_04.png?raw=true"/>
</p>

둘다 **결과보기** 이지만 **input context**의 설정한 이름 **yaki**, 다른 하나는 **mix**로 출력합니다.

즉 output으로 설정한 이름대로 결과를 출력을 하게 됩니다.

<p align="center">
<img src="./img/context_05.png?raw=true"/>
</p>

이렇게요.

참고로 context에 값을 넣어서 보낼수 있습니다, 만 conv.data라는 게 있어서 그렇게 어렵게 값을 넘길 필요가 없습니다.

## Event (위치정보)

**Event**는 보통 Permission을 설정하는 기능입니다. [레퍼런스 링크](https://developers.google.com/actions/assistant/helpers#helper_intents)를 보면 다양한 Event이름이 있는데 위치정보, 이름, 날짜 등의 기능이 있습니다.

**위치정보**를 예를 들어 설명해볼까요? 다음은 [주유소 가격비교](https://github.com/lunaStratos/googleAssistantChatbot/tree/master/oilPrice) 소스입니다.

<p align="center">
<img src="./img/event_location.png?raw=true"/>
</p>

	actions_intent_PERMISSION

위의 이름을 Event에 넣습니다. 그리고 소스에서는

	app.intent(ALLROUND_INTENT_YES, (conv, params, confirmationGranted) => {
	  if (confirmationGranted == false) { //권한없음

	  } else { //권한있음
    const latitude = conv.device.location.coordinates.latitude
    const longitude = conv.device.location.coordinates.longitude
    //이하 소스 생략

이런식입니다. **예** 라고 허락을 하면 **actions_intent_PERMISSION**이벤트가 작동을 하여  권한을 얻게 됩니다. 그러면 gps데이터를 얻어올수 있는 겁니다.


## Event-followup

**Event**는 이름이나 위치정보 Permission를 설정하는 것도 있지만 다음과 같이 **followup**이라는 기능도 있습니다.


	app.intent(STARTGAME_NO, (conv) => {
	  // 바로 welcome으로 이동한다
	  // 이벤트에 selectJob 이름 넣기
	  conv.followup('selectJob');
	});

이렇게 사용합니다. **conv**에 저렇게 설정하면 **STARTGAME_NO intent**로 이동시 **selectJob** Event를 가진 intent로 바로 넘어가게 됩니다.
## conv.data

제가 쓴 코드를 보다보면(특히 [마피아게임](https://github.com/lunaStratos/googleAssistantChatbot/tree/master/Mafia)) conv.data.xxxx에 Value를 넣어주는 모습이 종종 보입니다. 특히 fallbackCount를 수동으로 구현할때 많이 쓰는데, 임시 데이터 저장 기능입니다.

사용시에는


		conv.data.sample = [1,2,3,4,5]

다른대화에서 받을때에는

		let array = conv.data.sample

이런식입니다. array말고도 다른 String이나 int등 모든 데이터 저장이 가능합니다.

이 기능은 종료했다가 다시 시작하면 사라지는 데이터이니, 만약 유지되는 기능을 쓴다면 [userStorage](https://developers.google.com/actions/assistant/save-data)를 써야 합니다.


## Media response

2분 이상의 대화를 표기해야 하는 경우 Media response를 사용합니다. [라면타이머](https://github.com/lunaStratos/googleAssistantChatbot/tree/master/RamenTimer)에서 사용한 코드를 보시겠습니다.


	  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
	  }));
	  conv.ask(new Suggestions(suggestions));

	  //MediaObject
	  conv.ask(new MediaObject({
    name: title, //제목
    url: mediaUrl, //url주소
    description: text, //설명
    icon: new Image({
      url: imageLink, //이미지링크
      alt: title, //타이틀
	    }),
	  }));


> conv.ask(new Suggestions(suggestions));

위의 chip을 쓰지 않으면 에러가 나는 걸로 알고 있습니다.
저는 품질 96 ogg로 해서 사용합니다. 
