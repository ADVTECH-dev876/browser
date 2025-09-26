const wg = require('wireguard-go');
wg.start({ config: 'wg0.conf' });
