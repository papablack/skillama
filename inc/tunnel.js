const localtunnel = require('localtunnel');

async function tunneling(port){
    const tunnel = await localtunnel({ 
      port: port,
      subdomain: 'antired-api'
    });

    console.log(`🌍 Tunnel URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('❌ Tunnel closed');
    });

    tunnel.on('error', err => {
      console.error('🔥 Tunnel error:', err);
    });

   return tunnel;
}


module.exports = { tunneling }