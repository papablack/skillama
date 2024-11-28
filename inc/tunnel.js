const localtunnel = require('localtunnel');

async function tunneling(port){
    const tunnel = await localtunnel({ 
      port: port,
      subdomain: process.env.TUNNELER_NAME
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