'use strict';


// 대한통운 616670718176
// 우체국: 6864020516908
// 드림택배 350028881440
// 로젠택배 96171696235
// 편의점택배  644 820 5750
// SLX : 344023591062
//
// 한진택배 505834977793
// 경동택배: 3136292401447
// 일본우정 EJ602365107JP

const {
  dialogflow,
  Suggestions,
  SimpleResponse,
  BasicCard,
  Image,
  Button,
  List,
  Confirmation
} = require('actions-on-google');
const functions = require('firebase-functions');
const requests = require('request')
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
// app
const app = dialogflow({
  debug: true
});

//intent name
const WELCOME_INTENT = 'Default Welcome Intent';
const COMPANY_INTENT = 'Company Intent'; //회사
const NUM_INTENT = 'Num Intent'; // 넘버
const HELP = 'help';
const SUPPORTCOMPANY = 'supportCompany'

//basic intent : for quality
const FALLBACK = 'Default Fallback Intent';
const REPEAT = 'repeat';
const PREVIOUS = 'previous';
const EXIT = 'exit';

//entity name
const COMPANY = 'company';
const ANY = 'any'
const NUMBER = 'number'

//회사이름과 로고 DB
let parcelCompanyArr = [{
    company: 'CJ대한통운',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cjDeahan.jpg'
  }, {
    company: '드림택배',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/dream.png'
  },
  {
    company: '우체국',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/epost.png'
  },
  {
    company: '우체국 EMS',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/ems.jpg'
  }, {
    company: '로젠택배',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/logen.jpg'
  }, {
    company: '편의점택배',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/cvs.jpg'
  },
  {
    company: 'SLX로지스',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/slx.jpg'
  },
  {
    company: '한진택배',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/hanjin.jpg'
  }, {
    company: '경동택배',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/kyungdong.jpg'
  }, {
    company: '일본우정',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/jppost.jpg'
  }, {
    company: '롯데택배',
    image: 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/jppost.jpg'
  }
]

//for chip
let suggestions = ["도움말", "지원되는 택배회사", "CJ대한통운", "편의점택배", "드림택배", "한진택배", "로젠택배"];

function trackingJsonParse(num, company, callback) {
  var id = num; //id를 다 바꿀순없음

  switch (company) {
    case '우체국':
      //https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=7402803016064&displayHeader=N
      // https://m.epost.go.kr/postal/mobile/mobile.trace.RetrieveDomRigiTraceList.comm?sid1=6864020516908
      //https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm
      console.log("우체국");

      var url = "http://m.epost.go.kr/postal/mobile/mobile.trace.RetrieveDomRigiTraceList.comm?sid1=" + id;
      console.log("url: " + url);
      console.log("id: " + id);
      let forms = {
        sid1: id
      }

      requests({
        method: 'GET',
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 1000 * 30
        //,qs: forms
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        console.log(responseBody);
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding);


        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);

        var $result = $('.tb_guide').last(); // result info
        var $table = $('.tb_guide').first(); // detail info

        $result.find('tbody tr td').each(function(index) {
          // 0은 상태, 2는 설명이다.
          var match = $(this).text();
          if (index == 3) { //  마지막 칸
            currentStatus = match;
            return false;
          }

        });
        console.log(currentStatus);

        $table.find('tbody').find('tr').each(function(idx) {
          var row = [];
          var jsonlist = new Object();
          $(this).find('td').each(function(index) {

            if (index == 0) {
              jsonlist.day = $(this).text().trim();
            } else if (index == 1) {
              jsonlist.time = $(this).text().trim();
            } else if (index == 2) {
              //062.603.7190형태로 저장
              let temp = $(this).text().trim();
              jsonlist.location = temp.substring(0, temp.indexOf('0'))
              jsonlist.tel = temp.substring(temp.indexOf('0'), temp.length);
            } else if (index == 3) {
              jsonlist.statusText = $(this).text().trim().replace(/\n/g, '').replace(/\t/g, '');
              jsonlist.remark = $(this).text().trim().replace(/\n/g, '').replace(/\t/g, '');
              tableRow.push(jsonlist);
            }

          });

        }); // $table.find('tbody').find('tr').each(function(idx)

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;

    case 'CJ대한통운': //택배가 없는 경우 조회실패
      // https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=341895532881
      console.log("CJ대한통운");
      var url = 'https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=' + id;
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var html = responseBody.toString(); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $table = $('.ptb10').last();
        console.log($table);
        $table.find('.last_b').each(function(index) {
          // 0은 상태, 2는 설명이다.
          var match = $(this).text().trim();
          if (index == 2) {
            console.log(index);
            currentStatus = match;
          }

        });
        // 테이블 전체 받기
        $table.find('tr').each(function() {
          var row = [];
          var jsonlist = new Object();
          $(this).find('td').each(function(index) {

            if (index == 0) {
              jsonlist.statusText = $(this).text().trim();
            } else if (index == 1) {
              var text = $(this).text().trim().split(' ');
              jsonlist.day = text[0];
              jsonlist.time = text[1];
            } else if (index == 2) {
              let temp = $(this).text().trim();
              jsonlist.tel = temp.substring(temp.indexOf(' 0'), temp.length).replace(')', '');
              jsonlist.remark = $(this).text().trim();
            } else if (index == 3) {
              jsonlist.location = $(this).text().trim();
              tableRow.push(jsonlist);
            }
          });


        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;

    case '편의점택배': //택배가 없는 경우 조회실패644 820 5750
      // https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=341895532881
      console.log("편의점택배");
      var url = 'https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=' + id;
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var html = responseBody.toString(); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $table = $('.ptb10').last();
        console.log($table);
        $table.find('.last_b').each(function(index) {
          // 0은 상태, 2는 설명이다.
          var match = $(this).text().trim();
          if (index == 2) {
            console.log(index);
            currentStatus = match;
          }

        });
        // 테이블 전체 받기
        $table.find('tr').each(function() {
          var row = [];
          var jsonlist = new Object();
          $(this).find('td').each(function(index) {

            if (index == 0) {
              jsonlist.statusText = $(this).text().trim();
            } else if (index == 1) {
              var text = $(this).text().trim().split(' ');
              jsonlist.day = text[0];
              jsonlist.time = text[1];
            } else if (index == 2) {
              let temp = $(this).text().trim();
              jsonlist.tel = temp.substring(temp.indexOf(' 0'), temp.length).replace(')', '');
              jsonlist.remark = $(this).text().trim();
            } else if (index == 3) {
              jsonlist.location = $(this).text().trim();
              tableRow.push(jsonlist);
            }
          });


        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;

    case '한진택배':
      //505737955995
      console.log("한진택배");
      var url = 'http://www.hanjin.co.kr/Delivery_html/inquiry/result_waybill.jsp?wbl_num=' + id;
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding);


        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $table = $('#result_waybill2 table').last();
        $('#result_waybill2 .new_p ul li img').each(function() {
          var match = /^(.+)\(현재단계\)$/.exec($(this).attr('alt'));
          if (match) {
            currentStatus = match[1];
            return false;
          }
        });
        $table.find('thead tr th img').each(function() {
          tableKey.push($(this).attr('alt'));
        });

        var last = $table.find('tbody tr').length - 1;
        $table.find('tbody tr').each(function(idx) {
          var row = [];
          var jsonlist = new Object();

          console.log(idx);
          console.log(last);
          $(this).find('td').each(function(index) {

            if (last == idx) {
              // 마지막 빈칸  tr 방지용.
            } else {
              if (index == 0) { // 날짜
                jsonlist.day = $(this).text().trim();
              } else if (index == 1) { // time
                jsonlist.time = $(this).text().trim();
              } else if (index == 2) { // location
                jsonlist.location = $(this).text().trim();
              } else if (index == 3) { // remark
                jsonlist.remark = $(this).text().trim();
                jsonlist.statusText = $(this).text().trim();
              } else if (index == 4) { // 전화번호
                jsonlist.tel = $(this).text().trim();
                tableRow.push(jsonlist);
              }
            }

          });



        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;

    case '로젠택배': // 로젠택배
      //http://www.ilogen.com/iLOGEN.Web.New/TRACE/TraceView.aspx?gubun=slipno&slipno=12779748590

      var url = "http://www.ilogen.com/iLOGEN.Web.New/TRACE/TraceView.aspx?gubun=slipno&slipno=" + id;
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $table = $('#gridStat');

        //배송상태 받기
        var match = $('#tbLastStat').attr('value');
        currentStatus = match;
        // 잘못된 번호
        if (currentStatus == undefined) {
          console.log('잘못된 번호거나 배송정보가 없습니다.')
          callback(err, {
            code: 300,
            status: '조회된 배송정보가 없습니다.'
          });
          return;
        }
        var LastScanTime = $('#tbScanDt').attr('value').split(' ');
        var dataString = LastScanTime[0];
        var time = LastScanTime[1];

        var last = $table.find('tr').length - 1;
        // 테이블 전체 받기

        $table.find('tr').each(function(idx) {
          var jsonlist = new Object();

          console.log(idx);
          console.log(last);
          $(this).find('td').each(function(index) {

            if (last == idx) {
              // 마지막 빈칸  tr 방지용.
            } else {
              if (index == 0) { // 위치
                jsonlist.location = $(this).text().trim();
              } else if (index == 1) { // 내용
                jsonlist.statusText = $(this).text().trim();
                jsonlist.tel = '';
                jsonlist.remark = '';
                jsonlist.day = '';
                jsonlist.time = '';

                if ((last - 1) == idx) { // 마지막에 시간 추가
                  jsonlist.day = dataString;
                  jsonlist.time = time;
                }


                tableRow.push(jsonlist);
              }
            }

          });
        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });

      break;



    case '드림택배': // KG옐로우캡 => KG 로직스 => 드림택배
      //https://www.idreamlogis.com/delivery/popup_tracking.jsp?item_no=350028881440
      // old http://www.kglogis.co.kr/contents/waybill.jsp?item_no="
      console.log("드림택배 ");
      var url = "https://www.idreamlogis.com/delivery/popup_tracking.jsp?item_no=" + id;
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $result = $('.tblList tbody');
        var $table = $('.tblList');
        //배송상태 받기
        var match = '';

        var last = $result.find('tr').length - 1;
        $result.find('tr').each(function(idx) {
          // 데이터 형태
          // dataString : 2017.12.08 0000
          // location : 이천지점
          // tel : 전화번호
          // remakr : 내용
          // statusCode : 10
          // statusText : 접수대기
          var jsonlist = new Object();
          console.log(idx);
          console.log(last);
          $(this).find('td').each(function(index) {

            if (last == idx) {
              // 마지막 빈칸  tr 방지용.
            } else {
              if (index == 0) { // 위치
                jsonlist.dataString = $(this).text().trim();
              } else if (index == 1) { // 내용
                jsonlist.time = $(this).text().trim();

              } else if (index == 2) { // 지사와 / 연락처
                var values = $(this).text().trim().split(' / ');
                jsonlist.location = values[0];
                jsonlist.tel = values[1];
              } else if (index == 3) { // 내용
                jsonlist.remark = '';
                jsonlist.statusText = $(this).text().trim();
                currentStatus = $(this).text().trim();
                tableRow.push(jsonlist);
              }
            }

          });

        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });

      break;

    case '우체국 EMS':
      // http://service.epost.go.kr/trace.RetrieveEmsTrace.postal?ems_gubun=E&POST_CODE=EV880297406CN
      console.log("우체국EMS");
      var url = "https://service.epost.go.kr/trace.RetrieveEmsRigiTraceList.comm?POST_CODE=" + id + "&displayHeader=N";
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $result = $('table.table_col.ma_b_5');
        var $table = $('table.table_col.detail_off.ma_t_5 tbody');
        //배송상태 받기
        var match = '';
        $result.find('tr').last().find('td').each(function(index) {
          if (index == 2) {
            match += $(this).text();
            console.log(match);
            currentStatus = match;
          }
        });

        var last = $table.find('tr').length - 1;
        // 테이블 전체 받기
        $table.find('tr').each(function(idx) {

          var jsonlist = new Object();

          console.log(idx);
          console.log(last);
          $(this).find('td').each(function(index) {

            if (idx == 0) {
              //첫칸 방지
            } else {
              if (index == 0) { // 위치
                var values = $(this).text().trim().split(' ');
                jsonlist.day = values[0];
                jsonlist.time = values[1];
              } else if (index == 1) { // 내용
                jsonlist.statusText = $(this).text().trim();

              } else if (index == 2) { // 내용
                jsonlist.location = $(this).text().trim();

              } else if (index == 3) { // 내용
                jsonlist.remark = $(this).text().trim();
                jsonlist.tel = '';
                jsonlist.remark = '';

                tableRow.push(jsonlist);
              }
            }

          });

        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }


        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;

    case 'DHL':
      // http://www.dhl.co.kr/ko/express/tracking.shtml?AWB=9976126882&brand=DHL
      console.log("DHL");
      var url = "http://www.dhl.co.kr/ko/express/tracking.shtml?AWB=9976126882" + id + "&brand=DHL";
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding);

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        console.log();
        var $result = $('table.result-checkpoints.show.result-has-pieces.result-has-edd');
        var $table = $('table.table_col.detail_off.ma_t_5');
        //배송상태 받기
        var match = '';
        $result.find('tr').first().find('td').each(function(index) {
          if (index == 1) {
            match += $(this).text();
            console.log(match);
            currentStatus = match;
          }
        });

        // 테이블 전체 받기
        $table.find('tr').each(function() {
          var row = [];
          $(this).find('td').each(function(idx) {
            row.push($(this).text().trim());
          });
          tableRow.push(row);
        });

        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;


    case '경동택배':
      //경동택배는 json 가능하다.
      //http://kdexp.com/basicNewDelivery.kd?barcode=3136292401447
      //http://kdexp.com/newDeliverySearch.kd?barcode=3136292401447
      console.log("경동택배");
      var url = "http://kdexp.com/newDeliverySearch.kd?barcode=" + id;
      console.log(url);
      console.log(company);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var html = responseBody.toString(); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var result = JSON.parse(html);
        //배송상태 받기
        var match = '';

        //만약 성공시
        if (result.result == 'suc') { // suc
          var obj = result.items;
          // 테이블 전체 받기
          for (var i in obj) {
            var jsonlist = new Object();
            var values = obj[i].reg_date.split(' ');
            jsonlist.day = values[0];
            jsonlist.location = obj[i].location;
            jsonlist.tel = obj[i].tel;
            jsonlist.statusText = obj[i].stat;

            jsonlist.remark = '';
            jsonlist.time = '';

            currentStatus = obj[i].stat;
            tableRow.push(jsonlist);
          }

        } else { // 검색 실패시
          callback(err, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
        }


        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;

      //https://www.cupost.co.kr/postbox/delivery/localResult.cupost?invoice_no=
    case '일본우정': // 텍스트 출ㄹ력 수정 우체국 안됨. ㄱ
      //348284412906
      // https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=EJ602365107JP&search.x=81&search.y=10&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88&startingUrlPatten=&locale=ja
      console.log("일본우정");
      var url = "https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=" + id + "&search.x=81&search.y=10&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88&startingUrlPatten=&locale=ja";
      console.log(url);

      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        }
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding);

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);

        var $result = $('table tbody').eq(1);
        //배송상태 받기
        var match = '';
        var jsonlist = new Object();
        $result.find('tr').each(function(index) {
          $(this).find('td').each(function(index2) {
            console.log(index + " : " + index2 + ": " + $(this).text());
            if (1 < index) {

              if (index % 2 == 0) { // 처음일경우
                if (index2 == 0) { // 시간
                  var values = $(this).text().split(' ');
                  jsonlist.dataString = values[0];
                  jsonlist.time = values[1];
                } else if (index2 == 1) { // 내용
                  jsonlist.remark = $(this).text().trim();
                  currentStatus = $(this).text().trim();
                  jsonlist.statusText = $(this).text().trim();
                } else if (index2 == 3) { // 내용
                  jsonlist.location = $(this).text().trim();

                }
              } else if (index % 2 == 1) { // 두번째 칸일 경우
                if (index2 == 0) { // 시간
                  jsonlist.tel = $(this).text().trim();
                  tableRow.push(jsonlist);
                  jsonlist = new Object();
                }
              }


            }

          });



        });


        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }

        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });


      break;

    case 'TNTExpress':
      // http://www.tnt.com/webtracker/tracking.do?respCountry=kr&respLang=ko&searchType=CON&cons=
      console.log("TNTExpress");
      break;

      //http://gtx.webmaker21.kr/
    case '건영택배':
      //http://www.kunyoung.com/goods/goods_01.php?mulno=
      console.log("건영택배");
      break;

    case '천일택배':
      //http://www.chunil.co.kr/HTrace/HTrace.jsp?transNo=
      console.log("천일택배");
      break;

    case 'SLX로지스':
      // http://slx.co.kr/delivery/delivery_number.php?param1=980054064194  , 980054064194
      console.log("SLX로지스");
      var url = "http://slx.co.kr/delivery/delivery_number.php?param1=" + id;
      console.log(url);
      requests({
        url: url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
        },
        timeout: 13000,
        followAllRedirects: true
      }, function(err, res, responseBody) {
        if (err) {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        } else if (error.code == 'ETIMEDOUT') {
          callback(err, {
            code: 400,
            status: '조회에 실패하였습니다'
          });
          return;
        }
        var response_encoding = /charset=([^;]+)/gim.exec(res.headers['content-type'])[1];
        var html = iconv.decode(responseBody, response_encoding); //

        var tableKey = [];
        var tableRow = [];
        var currentStatus = "알수없음";
        var $ = cheerio.load(html);
        var $result = $('div.tbl_type02 tbody').eq(0);
        var $table = $('div.tbl_type02 tbody').eq(1);
        //배송상태 받기
        var match = '';

        // 배송상태 확인
        $result.find('tr').first().find('td').each(function(index) {
          if (index == 1) {
            match = $(this).text();
            currentStatus = match;
          }
        });

        // 테이블 전체 받기
        $table.find('tr').each(function() {
          var jsonlist = new Object();
          $(this).find('td').each(function(index) {

            if (index == 0) { // 날짜
              var values = $(this).text().split(' ');
              jsonlist.day = values[0];
              jsonlist.time = values[1];
            } else if (index == 1) { // 내용
              jsonlist.location = $(this).text().trim();
            } else if (index == 3) { // 내용
              jsonlist.tel = $(this).text().trim();
            } else if (index == 4) { // 내용
              jsonlist.statusText = $(this).text().trim();
              jsonlist.remark = '';

              tableRow.push(jsonlist);
            }

          });
        });


        if (tableRow[0] == undefined) {
          callback(null, {
            code: 300,
            status: '택배가 없거나 조회할 데이터가 없습니다.'
          });
          console.log("return")
          return;
        }


        callback(null, {
          code: 200,
          status: currentStatus,
          list: tableRow
        });
      });
      break;
    default:
      callback(null, {
        code: 500,
        status: '죄송합니다. 아직 지원하지 않는 회사입니다. '
      });
      break;

  } // switch



} //function

//Promise
const asyncTask = (num, company) => new Promise(function(resolved, rejected) {
  trackingJsonParse(num, company, function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});

var isEmpty = function(value) {
  if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
    return true
  } else {
    return false
  }
};

// Welcome intent.
app.intent(WELCOME_INTENT, (conv) => {
  console.log("WELCOME_INTENT");
  conv.data.fallbackCount = 0;

  //console.log("conv: " + JSON.stringify(conv));
  //console.log("action: " + JSON.stringify(conv.action));

  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/percel.jpg';
  let text = '택배라이브!에 오신걸 환영합니다.';
  let title = '택배라이브! 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '택배라이브!';
  let lastConv = '회사를 말해주세요!';
  let flow = 'welcome';
  let suggestionList = suggestions;

  // 넘어온 값이 빈값인지 체크합니다.
  // !value 하면 생기는 논리적 오류를 제거하기 위해
  // 명시적으로 value == 사용
  // [], {} 도 빈값으로 처리

  let welcomeSound = "https://storage.googleapis.com/finalrussianroulette.appspot.com/bgm/faces.ogg";
  if (conv.user.last.seen) {

    displayText = "다시 " + appTitle + "에 오신것을 환영합니다. 저번에 방문하셨으니 아시죠?";
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "7s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';

  } else {
    displayText = appTitle + " 에 오신걸 환영합니다. " + appTitle + " 는 한국의 주요 택배회사의 송장번호를 조회할 수 있습니다. '메뉴얼'를 말하면 안내와 함께 지원가능한 회사를 안내합니다. 조회하실려는 택배 회사를 먼저 말해주세요. 만약 종료하고 싶다면 '끝내기' 라고 말하시면 됩니다."
    speechText = "<speak><par>" +
      '<media><speak><break time="1s"/>' + displayText + "</speak></media>" +
      '<media fadeOutDur="1s" end = "11s"><audio src="' + welcomeSound + '"/></media>' +
      '</par></speak>';
  }

  let convArray = [];
  //이전 재생과 다시재생을 위한
  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;


  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));

});


//COMPANY_INTENT
app.intent(COMPANY_INTENT, (conv) => {
  console.log("COMPANY_INTENT");
  conv.data.fallbackCount = 0;
  // app.getArgument(name) -> v2: conv.parameters[name]

  const companyEntity = conv.parameters[COMPANY];
  conv.data.companys = companyEntity;

  console.log("companyEntity data: ", companyEntity);
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '이제 송장번호를 말해주세요. 송장번호만 말하면 됩니다. 키보드로 입력하기를 추천합니다.';
  let flow = 'company';
  let suggestionList = ['예시: 281829120', '예시: 3192-8828-9222']

  // 디스플레이 용 텍스트
  displayText = '선택하신 회사는 ' + companyEntity + '입니다.';
  speechText = displayText;

  //search data
  let parcelCompanyJson = parcelCompanyArr.find(item => {
    return item.company == companyEntity;
  });

  //이미지교체
  imageLink = parcelCompanyJson.image;

  //이전 재생을 위한 arrays
  let convArray = conv.data.previous;
  if (convArray === undefined) {
    convArray = [];
  }
  //이전 재생과 다시재생을 위한
  let convJson = {
    'flow': flow,
    'convResponse': convResponse,
    'data': {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));


});



//NUM_INTENT
app.intent(NUM_INTENT, (conv) => {
  console.log("NUM_INTENT");
  conv.data.fallbackCount = 0;
  //공백제거
  const numEntity = conv.parameters[ANY].replace(/-/g, '').replace(/\s/g, '');
  const companyEntity = conv.data.companys;

  console.log("numEntity data: ", numEntity);
  // let text
  let displayText = '';
  let speechText = '';

  let imageLink = '';
  let text = '';
  let title = '';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '다른 조회하실 회사나 명령어를 말해주세요.';
  let flow = 'num';
  let suggestionList = suggestions;


  // 디스플레이 용 텍스트
  displayText = companyEntity + '의 송장번호 [' + numEntity + '] 을 말하셨습니다. 송장조회 결과는';
  speechText = displayText;

  let deviceListSelect = {}

  return asyncTask(numEntity, companyEntity)
    .then(function(result) {

      console.log("result : " + JSON.stringify(result));

      if (result.code != 200 && result.code != 300) { //300과 200 피하
        //문제있음
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/error.jpg";
        title = "서버연결 에러";
        displayText = "현재 서버에 문제가 있어서 연결할 수 없습니다. 다음에 다시 시도해 주세요.";
        speechText = displayText;


      } else if (result.code == 300) {
        //송장번호 잘못되거나 집화처리 안됨.
        imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/page4-invalid-tel.png";
        title = "검색결과 없음";
        subtitle = "검색결과가 없습니다. 잘못된 송장번호이거나 아직 집화처리가 안되었을 확률이 높습니다. 택배는 보통 5시에 수거가 됩니다. "
        displayText = "검색결과가 없습니다. 잘못된 송장번호이거나 아직 집화처리가 안되었을 확률이 높습니다. 택배는 보통 5시에 수거가 됩니다."
        speechText = displayText;

      } else { // no problem -> List

        console.log("let results stringify : " + JSON.stringify(result));

        //text make temp
        let tempText = '';

        //List넣는 item
        let itemMake = {};

        //돌리기 전에 만들어 놓기
        let lastResult = ' 현재 ' + result.list[result.list.length - 1].statusText + " 입니다.";
        if (companyEntity == '일본우정') {
          lastResult = '아래 리스트와 같습니다.'
        }
        let arrList = result.list;
        arrList.reverse();

        //for 돌리기
        console.log(arrList.length)
        for (var i = arrList.length - 1; i >= 0; i--) {
          console.log(i)
          //날짜 기초작업
          let dayString = arrList[i].day
          let time = arrList[i].time

          //시간작업 (날짜먼저)
          let d = new Date(dayString);
          d.setHours(9); //UTC +9: 한국
          let months = d.getMonth() + 1 //월은 1을 의무적으로 추가
          dayString = d.getFullYear() + '년 ' + months + '월 ' + d.getDate() + '일'

          // 시간이 있다면 추가 작업 한다
          if (time != '') {
            let timeDiv = time.split(':') //시: [0], 분: [1] 공통사항 ':'
            //시와 분을 추가한다.
            d.setHours(parseInt(timeDiv[0]));
            d.setMinutes(timeDiv[1]);
            let hourMin = d.getHours() + '시 ' + d.getMinutes() + '분 ';
            dayString += hourMin
            console.log('result date: ', d.getHours() + '시 ' + d.getMinutes())
          }

          //기본정보 받기
          let remark = arrList[i].remark
          let tel = arrList[i].tel
          let statusText = arrList[i].statusText
          let location = arrList[i].location

          //최소데이터 : statusText이라도 있어야 한다.
          if (companyEntity == '로젠택배' || companyEntity == '드림택배' || companyEntity == '일본우정') {
            dayString = '';
          }
          if (tel == undefined) {
            tel = '';
          }

          //Textmake
          let alt_text = statusText; //statusText로 그냥 받기 <- 이 데이터는 무조건 존재
          //외부에 List용 데이터 생성
          deviceListSelect[i + 2] = dayString + " " + statusText + " " + remark + " / " + location + " " + tel; // 외부 모듈

          //time: statusText (location)
          let makeSubResultData = remark + ' / ' + location + ' ' + tel + ' \n';

          title = dayString + ' ' + statusText //회사상태 : 결론
          subtitle = makeSubResultData //내용들
          console.log(title)
          console.log(subtitle)
          //make items
          itemMake[i + 2] = {
            title: title, //시간: 배송상태
            description: subtitle //time, remark and location + tel
          } // itemMake

        } //for


        displayText += lastResult
        speechText = displayText;
        console.log("displayText : " + displayText);

        //이미지 data
        let parcelCompanyJson = parcelCompanyArr.find(item => {
          return item.company == companyEntity;
        });

        //이미지교체
        imageLink = parcelCompanyJson.image;

        //List는 최소 2개부터 가능 dummy채워넣기
        let length3 = 3 - result.list.length;
        for (let i = 0; i < length3; i++) {
          let SELECTION_KEY = '';
          let IMG_URL = '';
          let alt_text = '';
          IMG_URL = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/noReaBang/none.jpg';
          alt_text = '-';

          deviceListSelect[result.list.length + 2] = " "; // 외부 모듈
          //make items
          itemMake[result.list.length + 2] = {
            title: " ",
            description: " "
          } // itemMake
        } //for

        //List선택용 저장하기
        conv.data.deviceListSelect = deviceListSelect;

        let userData = {
          company: companyEntity,
          num: numEntity
        }

        conv.data.previousFinalData = userData
        convResponse = 'list';

        //이전 재생을 위한 arrays
        let convArray = conv.data.previous;
        if (convArray === undefined) {
          convArray = [];
        }

        //이전 재생과 다시재생을 위한
        let convJson = {
          'flow': flow,
          'convResponse': convResponse,
          'data': {
            'displayText': displayText,
            'speechText': speechText,
            'imageLink': imageLink,
            'text': text,
            'title': title,
            'subtitle': subtitle,
            'lastConv': lastConv,
            'itemMake': itemMake,
            'suggestion': suggestionList
          }
        }
        convArray.push(convJson);
        conv.data.previous = convArray;

        // List End
        conv.ask(new SimpleResponse({
          speech: speechText,
          text: displayText,
        }));
        conv.ask(new List({
          title: title,
          items: itemMake
        }));
        conv.ask(new Suggestions(suggestionList));
        conv.ask(lastConv);
        return; //여기서 종료.
      }

      //이전 재생을 위한 arrays`
      let convArray = conv.data.previous;
      if (convArray === undefined) {
        convArray = [];
      }
      //이전 재생과 다시재생을 위한
      let convJson = {
        'flow': flow,
        'convResponse': convResponse,
        'data': {
          'displayText': displayText,
          'speechText': speechText,
          'imageLink': imageLink,
          'text': text,
          'title': title,
          'subtitle': subtitle,
          'lastConv': lastConv,
          'suggestion': suggestionList
        }
      }
      convArray.push(convJson);
      conv.data.previous = convArray;


      //ask
      conv.ask(new SimpleResponse({
        speech: speechText,
        text: displayText,
      }));
      conv.ask(new Suggestions(suggestionList));
      conv.ask(new BasicCard({
        text: text,
        subtitle: subtitle,
        title: title,
        image: new Image({
          url: imageLink,
          alt: '이미지',
        }),
      }));
      conv.ask(new SimpleResponse(lastConv));


    });


});


app.intent('saveNumAndCompany', (conv) => {
  console.log("saveNumAndCompany");
  conv.data.fallbackCount = 0;

  let displayText = '.';
  let speechText = '';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '설명서';
  let subtitle = ''

  let lastConv = '다음 질문을 해 주세요.';
  let flow = 'help';
  let convResponse = 'original'
  let suggestionList = suggestions;


  speechText = displayText;

  //이전 재생을 위한 arrays
  let convArray = conv.data.previous;

  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

});


app.intent('actions.intent.CONFIRMATION', (conv, params, confirmation) => {
  console.log('Remember')
  console.log(confirmation)
  if (confirmation) {

    //사용자가 다시 접속시 확인용
    let userFinalData = []
    let userFinalJson = conv.data.previousFinalData;
    //사용자가 만약 이전 데이터가 있다면
    if (isEmpty(conv.user.storage.previousFinalData) == false) {
      userFinalData = conv.user.storage.previousFinalData
    }

    //이전 데이터가 같은게 있는지 검색
    let count = 0;
    for (var j = 0; j < userFinalData.length; j++) {
      if (userFinalJson.num == userFinalData[j].num) {
        count++;
      }
    }
    console.log('count: ', count)
    // 검색된게 없다면 저장
    if (count == 0) {
      console.log('count save')

      userFinalData.push(userFinalJson)
      console.log(userFinalData)
      conv.user.storage.previousFinalData = userFinalData;
      console.log(conv.user.storage.previousFinalData)
    }

    conv.ask('알겠습니다 저장하였습니다. 하실말을 해 주세요.');
  } else {
    conv.ask('저장하지 않았습니다.');
  }
});

//2~30까지 가능
app.intent('List Call', (conv, params, option) => {
  conv.data.fallbackCount = 0;

  let deviceListSelect = conv.data.deviceListSelect;
  console.log('선택')
  let response = '죄송합니다. 화면을 출력할 수 있는 기기가 아닙니다. 다른 명령을 말해주세요.';
  if (option && deviceListSelect.hasOwnProperty(option)) {
    response = "선택하신 택배의 자세한 상황은 " + deviceListSelect[option] + " 입니다. ";
  }
  conv.ask(response);
  conv.ask(new Suggestions(suggestions));
});

app.intent('Previous List', (conv, params, option) => {
  conv.data.fallbackCount = 0;
  console.log('Previous List')
  let displayText = '죄송합니다. 화면을 출력할 수 있는 기기가 아닙니다. 다른 명령을 말해주세요.';
  let speechText = '';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/detail.jpg';
  let text = '';
  let title = '리스트 선택';
  let subtitle = ''

  let lastConv = '다음 질문을 해 주세요.';
  let flow = 'List select';
  let convResponse = 'original'
  let suggestionList = suggestions;


  //List
  let deviceListSelect = conv.data.deviceListSelect;
  if (option && deviceListSelect.hasOwnProperty(option)) {
    displayText = "선택하신 택배의 자세한 상황은 " + deviceListSelect[option] + " 입니다.";
  }

  speechText = displayText;

  if (conv.data.companys == '일본우정') {
    displayText = "죄송합니다. 일본우정은 구글 어시스턴트 TTS재생 문제로 자세한 정보 보기를 지원하지 않습니다."
    speechText = displayText;
  }

  //이전 재생을 위한 arrays
  let convArray = conv.data.previous;

  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList

    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;


  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));
});


// =======================================================================

// FALLBACK
app.intent(FALLBACK, (conv) => {
  console.log("FALLBACK");

  // let text
  let displayText = '';
  let speechText = '';
  let imageLink = '';
  let text = '';
  let title = '죄송합니다';
  let subtitle = ''

  let lastConv = '이제 말을 해 주세요.';
  let flow = 'fallback';
  let convResponse = 'original'

  let count = conv.data.fallbackCount;
  count++;
  conv.data.fallbackCount = count;

  if (count < 3) {

    if (count === 1) {
      displayText = '제가 잘 모르는 회사입니다. "도움말"을 말하시면 지원되는 회사를 아실 수 있습니다. ';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza.jpg";
      speechText = displayText;
    } else if (count === 2) {
      displayText = '죄송합니다. 혹시 제가 모르는 회사인가요? "현재 가능한 회사" 이라고 말하시면 어떤 택배회사가 조회가 가능한지 알 수있습니다.';
      imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/coinimage/dogeza2.jpg";
      speechText = displayText;
    }

    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestions));
    conv.ask(new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
    conv.ask(new SimpleResponse(lastConv));

  } else if (count > 2) {
    displayText = '정말로 죄송합니다. 제가 잘 모르는 회사이거나 인식이 실패했습니다. 앱을 종료하겠습니다. ';
    imageLink = "https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/DQmeEHtAtdRcA64c9dJPSNFeArbQEWVbcNfoTpix2EjJ484_1680x8400.png";
    speechText = displayText;

    conv.close(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }), new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));

  } //if 1


});


// HELP
app.intent(HELP, (conv) => {
  console.log("HELP");
  conv.data.fallbackCount = 0;

  let displayText = '택배라이브! 택배회사를 조회하는 기능을 가지고 있습니다. 택배회사를 말한 후 다음에 송장번호를 말하면 조회가 가능합니다. 지원되는 회사는 "지원되는 회사"라고 말하시면 됩니다.';
  let speechText = '';
  // let subModule
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/help.jpg';
  let text = '';
  let title = '설명서';
  let subtitle = ''

  let lastConv = '다음 질문을 해 주세요.';
  let flow = 'help';
  let convResponse = 'original'
  let suggestionList = suggestions;

  speechText = displayText;

  //이전 재생을 위한 arrays
  let convArray = conv.data.previous;

  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));
});


// SUPPORTRAMEN
app.intent(SUPPORTCOMPANY, (conv) => {
  console.log("SUPPORTCOMPANY");
  conv.data.fallbackCount = 0;

  let tempText = '';
  for (var i = 0; i < parcelCompanyArr.length; i++) {
    tempText += parcelCompanyArr[i].company
    if (parcelCompanyArr.slice(-1)[0] == i + 1) {

    } else {
      tempText += ", "
    }

  }
  let displayText = '지원되는 택배회사는 현재 ' + tempText + ' 입니다. ';
  let speechText = '';
  let convResponse = 'original'
  let lastConv = '다음 질문을 해 주세요.';
  let suggestionList = suggestions;
  // let text

  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/ramenImage/info.png';
  // let text
  let text = '';
  let title = '지원되는 회사종류';
  let subtitle = ''
  let flow = 'support'

  speechText = displayText;

  //이전 재생과 다시 재생을 위한
  let convArray = conv.data.previous;
  let convJson = {
    flow: flow,
    'convResponse': convResponse,
    data: {
      'displayText': displayText,
      'speechText': speechText,
      'imageLink': imageLink,
      'text': text,
      'title': title,
      'subtitle': subtitle,
      'lastConv': lastConv,
      'suggestion': suggestionList
    }
  }
  convArray.push(convJson);
  conv.data.previous = convArray;

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));

});


// PREVIOUS
app.intent(PREVIOUS, (conv) => {
  console.log("PREVIOUS");
  conv.data.fallbackCount = 0;

  let convArray = conv.data.previous;
  let convArraylength = convArray.length - 1; //현재 array
  let flow = convArray[convArraylength].flow
  let convResponse = convArray[convArraylength].convResponse

  console.log(convArray);
  console.log('convArraylength: ', convArraylength);

  let displayText = convArray[convArraylength].data.displayText;
  let speechText = convArray[convArraylength].data.speechText;

  let text = convArray[convArraylength].data.text;
  let imageLink = convArray[convArraylength].data.imageLink;
  let title = convArray[convArraylength].data.title;
  let subtitle = convArray[convArraylength].data.subtitle;
  let lastConv = convArray[convArraylength].data.lastConv;
  let suggestionList = convArray[convArraylength].data.suggestion;


  if (convArraylength == 0) { // 처음이라면

  } else { // 처음이 아니라면

    //마지막 array제거 후 저장하기
    convArray.pop();
    //제거된 array의 -1인 길이를 가져와야 한다.
    //-1을 안하면 방금 말한 데이터를 가져오기 때문.
    convArraylength = convArraylength - 1;

    displayText = convArray[convArraylength].data.displayText;
    speechText = convArray[convArraylength].data.speechText;

    // let text
    imageLink = convArray[convArraylength].data.imageLink;
    text = convArray[convArraylength].data.text;
    subtitle = convArray[convArraylength].data.subtitle;
    title = convArray[convArraylength].data.title;
    lastConv = convArray[convArraylength].data.lastConv;
    suggestionList = convArray[convArraylength].data.suggestion;

    flow = convArray[convArraylength].flow
    convResponse = convArray[convArraylength].convResponse;

    //last save
    conv.data.previous = convArray;

  }

  //리스트 전용
  if (convResponse == 'list') {
    let itemMake = convArray[convArraylength].data.itemMake
    // List End
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new List({
      title: title,
      items: itemMake
    }));
    conv.ask(new Suggestions(suggestionList));
    conv.ask(lastConv);
    return;
  }

  //ask
  conv.ask(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.ask(new Suggestions(suggestionList));
  conv.ask(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
  conv.ask(new SimpleResponse(lastConv));


});

// REPEAT
app.intent(REPEAT, (conv) => {
  console.log("REPEAT");
  conv.data.fallbackCount = 0;

  let convArray = conv.data.previous;
  let convArraylength = convArray.length - 1;

  let displayText = convArray[convArraylength].data.displayText;
  let speechText = convArray[convArraylength].data.speechText;
  let imageLink = convArray[convArraylength].data.imageLink;

  let text = convArray[convArraylength].data.imageLink;
  let title = convArray[convArraylength].data.title;
  let subtitle = convArray[convArraylength].data.subtitle;
  let lastConv = convArray[convArraylength].data.lastConv;
  let suggestionList = convArray[convArraylength].data.suggestion;

  let convResponse = convArray[convArraylength].convResponse;
  let flow = convArray[convArraylength].flow;

  speechText = displayText;

  if (convResponse == 'list') {
    let itemMake = convArray[convArraylength].data.itemMake
    // List End
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new List({
      title: title,
      items: itemMake
    }));
    conv.ask(new Suggestions(suggestionList));
    conv.ask(lastConv);
  } else {
    //ask
    conv.ask(new SimpleResponse({
      speech: speechText,
      text: displayText,
    }));
    conv.ask(new Suggestions(suggestionList));
    conv.ask(new BasicCard({
      text: text,
      subtitle: subtitle,
      title: title,
      image: new Image({
        url: imageLink,
        alt: '이미지',
      }),
    }));
    conv.ask(new SimpleResponse(lastConv));
  }



});

//EXIT
app.intent(EXIT, (conv) => {
  console.log("EXIT");
  conv.data.fallbackCount = 0;
  let displayText = '앱을 종료합니다. 이용해 주셔서 감사합니다냥!';
  let speechText = '';

  // let text
  let name = '끝내기';
  let imageLink = 'https://storage.googleapis.com/finalrussianroulette.appspot.com/parcelLive/bye.jpg';

  let text = '';
  let title = '택배라이브! 입니다';
  let subtitle = ''
  let convResponse = 'original'
  let appTitle = '';
  let lastConv = '';
  let flow = 'end';
  speechText = displayText;

  //ask
  conv.close(new SimpleResponse({
    speech: speechText,
    text: displayText,
  }));
  conv.close(new BasicCard({
    text: text,
    subtitle: subtitle,
    title: title,
    image: new Image({
      url: imageLink,
      alt: '이미지',
    }),
  }));
});

// Action name is different to method name.
// my action name is dialogv2. So If you want another name, please rename it.
// action name: dialogv2 => change your action name.
exports.parcelLive = functions.https.onRequest(app);

// for help link
// 1. V1 and v2 different : https://developers.google.com/actions/reference/nodejs/lib-v1-migration
// 2. fulfillment design: https://developers.google.com/actions/dialogflow/fulfillment
