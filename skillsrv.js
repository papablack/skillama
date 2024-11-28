
require('dotenv').config();

const { tunneling } = require('./inc/tunnel');
const { setupSrv } = require('./inc/srv');

const app = setupSrv();
const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Start the express server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Create tunnel with fixed subdomain
    const tunneler = await tunneling(port);
  } catch (error) {
    console.error('🔥 Server startup error:', error);
    process.exit(1);
  }
};


startServer();
