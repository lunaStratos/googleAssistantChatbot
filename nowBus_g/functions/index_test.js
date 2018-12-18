const request = require('request'); // request
function getHangangTemp(callback) {
  var url = 'http://hangang.dkserver.wo.tc';

  // Get data
  request({
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.1 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    }
  }, function(err, resp, body) {
    // if (err) {
    //   callback(err, {
    //     code: 400,
    //   });
    //   return;
    // }
    var original = JSON.parse(body.toString());

    callback(null, {
      code: 200,
      result: original.result,
      temp: original.temp,
      time: original.time,
    });
  });

}

//Promise
const asyncTask = () => new Promise(function(resolved, rejected) {
  getHangangTemp(function(err, result) {
    if (err) {
      rejected(err);
    } else {
      resolved(result);
    }
  });
});

function test(){
  return asyncTask()
    .then(function(result) {
      //로그 확인용
      console.log("result : " + JSON.stringify(result));

    });
}
test();
