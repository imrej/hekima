var express = require('express');
var router = express.Router()
var neode = require('neode');
var neo4j = require('../services/neo4j.js');
var instance = neo4j.instance;
var sanitize = neo4j.sanitize;
var calculateUri = neo4j.calculateUri;

router.get('/', function(req, res, next) {
  const q = req.query.q;
  const tags = asArray(req.query.tags);
  const sources = asArray(req.query.sources);
  const order_by = req.query.order || 'createdAt';
  const sort = req.query.sort || 'ASC';
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page-1) * limit;
  const params = {};
  const order = {[order_by]: sort};
  if(tags.length === 0 && sources.length === 0) {
      instance.all("Hekima", params, order, limit, skip).then(neo4jres => {
          neo4jres.toJson().then(hekimas => {
              hekimas.forEach(hekima => hekima.source = (hekima.source ? hekima.source[0] : null));
              res.send(hekimas);
          });
      }).catch(err => {
          res.send(err)
      });
  } else {
      var extraMatch = "";
      let hasSource = false;
      let hasTags = false;
      var cypherparams = {skip: skip, limit: limit};
      if(sources.length > 0) {
          extraMatch += "OPTIONAL MATCH (n)-[rs:SOURCE]->(s:Source) WHERE s.uri in {sources} \n";
          cypherparams.sources = sources;
          hasSource = true;
      }
      if(tags && tags.length > 0) {
          extraMatch += "OPTIONAL MATCH (n)-[rt:TAG]->(t:Tag) WHERE t.uri in {tags}\n";
          cypherparams.tags = tags;
          hasTags = true;
      }
      instance.cypher("MATCH (n:Hekima)\n" +
          extraMatch +
          "WITH n as n, " + getCount(hasSource, hasTags, tags) + " \n" +
          "WHERE nbTags > 0\n" +
          "RETURN n ORDER BY nbTags desc, n.createdAt desc SKIP {skip} LIMIT {limit}",
          cypherparams)
      .then(neo4jres => {
        instance.hydrate(neo4jres, 'n').toJson().then(hekimas => {
            hekimas.forEach(hekima => hekima.source = (hekima.source ? hekima.source[0] : null));
            res.send(hekimas);
        });
      }).catch(err => {
      console.error(err);
        res.send(err)
      });
  }

});
router.get('/:uri', function(req, res, next) {
  const uri = req.params.uri;
  instance.find("Hekima", uri).then(neo4jres => {
     neo4jres.toJson().then(hekima => {
       hekima.source = hekima.source ? hekima.source[0] : null;
       res.send(hekima);
     });
  }).catch(err => {
    res.status(404).send(err.stack);
  });
});
router.post('/', function(req, res, next) {
  const hekimaUpsertReq = req.body;
  const uri = calculateUri(hekimaUpsertReq);
  const fields = {
    valeur: hekimaUpsertReq.valeur,
  };
  if(!hekimaUpsertReq.uri) {
    fields.createdAt = Date.now();
  }
  instance.mergeOn('Hekima', {uri: uri}, fields)
  .then(merged => {
      instance.cypher("MATCH (t:Hekima{uri:{uri}})-[r:SOURCE|TAG]->() delete r", {uri: uri})
      .then(() => {
        updateSource(uri, hekimaUpsertReq).then(() => {  
            updateTags(uri, hekimaUpsertReq).then(() => {
              console.log(uri + " fully updated");
              merged.toJson().then(json => res.send(json));
            }).catch(err => {
              console.error("Error while updating tags of " + uri);
              console.error(err);
              merged.toJson().then(json => res.send(json));
            });
        }).catch(err => {
          console.error("Error while updating source of " + uri);
          console.error(err);
          merged.toJson().then(json => res.send(json));
        });
      })
      .catch(err => {
        console.error("Error while removing source and tags of " + uri);
        console.error(err);
        merged.toJson().then(json => res.send(json));
      })
      
  }).catch(err => {
    res.statusCode = 500;
    res.send(JSON.stringify(err));
  });
});
function updateSource(uri, hekimaUpsertReq) {
  if(hekimaUpsertReq.source) {
    return instance.cypher(
        "MATCH (t:Hekima{uri:{hekUri}}) MATCH(s:Source{uri:{srcUri}}) CREATE (t)-[:SOURCE]->(s)",
        {hekUri: uri, srcUri: hekimaUpsertReq.source});
  } else {
    return new Promise((resolve) => {resolve();});
  }
}
function updateTags(uri, hekimaUpsertReq) {
  if(hekimaUpsertReq.tags) {
    return instance.cypher(
        "MATCH (h:Hekima{uri:{hekUri}}) MATCH(t:Tag) WHERE t.uri in {tagUris} CREATE (h)-[:TAG]->(t)",
        {hekUri: uri, tagUris: hekimaUpsertReq.tags});
  } else {
    return new Promise((resolve) => {resolve();});
  }
}
function asArray(src) {
  let myarray;
  if(src) {
    if(Array.isArray(src)) {
      myarray = src;
    } else {
      myarray = [src];
    }
  } else {
    myarray = [];
  }
  return myarray;
}
function getCount(hassource, hastags, tags) {
    var count;
    if(hassource) {
        if(hastags) {
            count = " count(rs) * " + tags.length +" + count(rt)";
        } else {
            count = " count(rs)";
        }
    } else {
        count = " count(rt)";
    }
    return count + " as nbTags";
}
module.exports = router;
