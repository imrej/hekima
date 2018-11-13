module.exports = {
  uri: {
    type: 'uuid',
    primary: true
  },
  valeur: 'string' ,
  valeurRecherche: 'string',
  is: {
    type:"relationship",
    target:"Tag",
    relationship:"IS",
    direction:"out"
  }
}
