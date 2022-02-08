// Basic express + socket.io setup
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Create the licenser for our example NFT
const NFTLicense = require('../dist/NFTLicense');

let licenserApi;
if (process.env.NFTLICENSE_API) {
  // Example of how OpenSea API can be used
  // This licensor uses an example NFT created for this demo
  // You can find the NFT at https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/79454497198554636117345343882506479954454786964086013490182127876323749172863
  licenserApi = new NFTLicense.OpenSeaApi(
    '0x495f947276749ce646f68ac8c248420045cb7b5e',
    '79454497198554636117345343882506479954454786964086013490182127876323749172863'
  );
} else {
  // Use mock API provider instead to not make HTTP requests
  licenserApi = new NFTLicense.MockApi();
}

const licenser = new NFTLicense.default(licenserApi);

// Basic hosting for the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use('/dist', express.static(path.join(__dirname, '/../dist')));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('request verification', () => {
    // Send a new licensing request to the user
    socket.emit('licensing request', licenser.createLicensingRequest());
  });
  socket.on('licensing response', (licensingResponse) => {
    // Validate that the response the user sent contains a valid license
    licenser.validateLicensingResponse(licensingResponse).then((isValid) => {
      console.log('Validated license:', isValid);

      // Send result to frontend to let it display
      // Normally you may save this into your cache or enable your software features now
      socket.emit('licensing completed', isValid);
    });
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
