const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Vahlay_consulting',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

