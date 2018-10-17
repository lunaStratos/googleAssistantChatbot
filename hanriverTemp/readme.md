## 구글 어시스턴트 앱 오늘 한강물 따듯하냐.
***

[현재 라이브 버전 KO ](https://assistant.google.com/services/a/uid/0000000e03874de8?hl=ko).
[현재 라이브 버전 JP ](https://assistant.google.com/services/a/uid/0000000e03874de8?hl=ja).
[현재 라이브 버전 EN ](https://assistant.google.com/services/a/uid/0000000e03874de8?hl=en).

"앱 오늘 한강물 따듯하냐한테 말하기" 로 인보케이션 가능.

언어는 한국어, 영어 일본어 입니다.
DialogFlow와 Google cloud의 Cloud기능으로 nodeJS를 이용해서 만들었습니다.

api버전은 V1으로 제작되었습니다.

원샷 앱이며, 각 언어에 대응하기 위해서 app내의 lang데이터를 받는 것이 필요했습니다.
 
유저의 요청이 들어오면, api의 주소에서 json을 가져오고 온도를 출력하는 형태입니다. 
