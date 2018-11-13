var express = require('express');
var router = express.Router()
var neode = require('neode');
var neo4j = require('../services/neo4j.js');
var instance = neo4j.instance;
var sanitize = neo4j.sanitize;
var calculateUri = neo4j.calculateUri;

router.get('/', function(req, res, next) {
  const q = req.query.q;
  let promise;
  if(q) {
    promise = instance.cypher("MATCH (t:Source) WHERE t.titreRecherche =~ {valeur} return t ORDER BY t.titreRecherche asc LIMIT 20", {valeur: '.*' + sanitize(q) + '.*'})
  } else {
    promise = instance.cypher("MATCH (t:Source) return t ORDER BY t.valeur asc LIMIT 20");
  }
  promise.then(neo4jres => {
     instance.hydrate(neo4jres, 't').toJson().then(tags => {
       res.send(tags);
     });
  });
});
router.post('/', function(req, res, next) {
  const sourceUpsertReq = req.body;
  const uri = calculateUri(sourceUpsertReq);
  const fields = {
    type: sourceUpsertReq.type,
    auteur: sourceUpsertReq.auteur,
    titre: sourceUpsertReq.titre,
    titreRecherche: sanitize(sourceUpsertReq.titre)
  };
  instance.mergeOn('Source', {uri: uri}, fields)
  .then(merged => {
      merged.toJson().then(json => res.send(json));
  }).catch(err => {
    res.statusCode = 500;
    res.send(JSON.stringify(err));
  });
});
module.exports = router;
