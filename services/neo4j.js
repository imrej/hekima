var S = require('string');
var md5 = require('md5js').md5;
var instance = require('neode')
              .fromEnv()
              .withDirectory(__dirname + '/../models');
const sanitize = function(value) {
   return S(value).trim().latinise().toLowerCase().s.replace(/\W/g, ' ');
}
const calculateUri = function(request) {
   if(request.uri) {
      return request.uri;
   } else {
      return md5(JSON.stringify(request));
   }
}
module.exports = {
   instance: instance,
   sanitize: sanitize,
   calculateUri: calculateUri
}
