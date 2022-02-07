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
console.log(NFTLicense);
const licenserApi = new NFTLicense.OpenSeaApi(
  '0x495f947276749ce646f68ac8c248420045cb7b5e',
  '79454497198554636117345343882506479954454786964086013490182127876323749172863'
);
const licenser = new NFTLicense.default(licenserApi);

// Basic hosting for the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use('/dist', express.static(path.join(__dirname, '/../dist')));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('request verification', () => {
    // Send a new challenge to the user
    socket.emit('challenge', licenser.getChallenge());
  });
  socket.on('challenge answer', (answer) => {
    // Validate that the answer the user sent contains a valid license
    licenser.validateLicenseWithChallenge(answer).then((isValid) => {
      console.log('Validated license:', isValid);
    });
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
