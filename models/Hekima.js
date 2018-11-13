module.exports = {
  uri: {
    type: 'uuid',
    primary: true
  },
  valeur: 'string',
  createdAt: 'number',
  tags: {
    type:"relationship",
    target:"Tag",
    relationship:"TAG",
    direction:"out",
    eager: true
  },
  source: {
    type:"relationship",
    target:"Source",
    relationship:"SOURCE",
    direction:"out",
    eager: true
  }
}
