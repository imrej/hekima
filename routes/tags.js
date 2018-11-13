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
    promise = instance.cypher("MATCH (t:Tag) WHERE t.valeurRecherche =~ {valeur} return t ORDER BY t.valeur asc LIMIT 20", {valeur: '.*' + sanitize(q) + '.*'})
  } else {
    promise = instance.cypher("MATCH (t:Tag) return t ORDER BY t.valeur asc LIMIT 20");
  }
  promise.then(neo4jres => {
     instance.hydrate(neo4jres, 't').toJson().then(tags => {
       res.send(tags);
     });
  });
});
router.post('/', function(req, res, next) {
  const tagUpsertReq = req.body;
  const uri = calculateUri(tagUpsertReq);
  const fields = {
    valeur: tagUpsertReq.valeur,
    valeurRecherche: sanitize(tagUpsertReq.valeur)
  };
  instance.mergeOn('Tag', {uri: uri}, fields)
  .then(merged => {
      console.log("Tag " + uri + " saved");
      merged.toJson().then(json => res.send(json));
  }).catch(err => {
    console.error("Erreur lors de la sauvegarde du tag "+ uri);
    console.error(err);
    res.statusCode = 500;
    res.send(JSON.stringify(err));
  });
});
module.exports = router;
