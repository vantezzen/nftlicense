# NFTLicense

NFTLicense enables software licensing using NFTs and semi-non fungible tokens. Instead of using random product keys to verify the ownership of a license, NFTLicense will verify if the user's wallet contains a license NFT.

Using this technique, the licensing will be decentralised and independent from third-party licensing providers.

## Features

- Simple API
- Little to no prior NFT/Web3 knowledge required
- Secure wallet and NFT ownership validation
- API-independent: The base class can be used with almost any NFT API, given a provider class has been created. See [create your own API Provider](#create-your-own-api-provider) for more info

## Installation

Simply install the `nftlicense` NPM package using:

- `npm i nftlicense` or
- `yarn add nftlicense` or
- `pnpm i nftlicense`

## Functionality

NFTLicense is split into two parts to enable secure license validation:

- `NFTLicense` runs on your trusted server to determine if the license is valid
- `NFTLicenseBrowser` runs in the user's browser to interact with the user's Web3 Provider (e.g. MetaMask browser extension)

![Flow Chart of verifying a user's license](https://raw.githubusercontent.com/vantezzen/nftlicense/master/docs/flowchart.png)

The above image shows a flow chart of how NFTLicense verifies a valid license:

- Your server software requires the license to be verified (e.g. when the user opens the application)
- NFTLicense will create a licensing request object to verify the ownership of the user's wallet
- You send the licensing request object to the user's browser (e.g. using WebSockets)
- NFTLicenseBrowser is invoked with the licensing request object to answer the server's licensing request
- The user will get a MetaMask popup, prompting them to sign a message text
- NFTLicenseBrowser will return an answer object to your software
- Your software transferes the licensing response object back to your server (e.g. using WebSockets again)
- You call NFTLicense to verify the answer
- NFTLicense will verify that the answer object is a valid signature of the message text
- NFTLicense will call an NFT API (e.g. OpenSea's API) to verify that the wallet contains your licensing NFT
- NFTLicense returns to your software that the license is valid

If NFTLicense encounters problems at these steps (e.g. user doesn't sign message, signature is invalid, API returns NFT is not in wallet), the license will be regarded as invalid.

## Usage

A full example of a simple NFTLicense Server and frontend can be found in the `example/` folder. You can run the example by running `pnpm run example`.

### Create the NFT

As a first step, you'll need to create your licensing NFT.

- To publish using OpenSea, use https://opensea.io/asset/create?enable_supply=true
- The media uploaded is irrelevant, you probably want to set "Supply" higher to enable multiple people to purchase licenses
- NFTLicense is currently written for Ethereum contracts

After creation you'll need the NFT's address and token ID which can be found under "Details".

### Server

```JavaScript
import NFTLicense, { OpenSeaApi } from 'nftlicense';

// You will first need to create an API Provider that allows NFTLicense to verify NFT ownership
const apiProvider = new OpenSeaApi(

  // Address and Token ID of the NFT that should be regarded as the licensing NFT
  nftAddress,
  tokenId,

  // Optionally an OpenSea API Key.
  // This is highly recommended when using the OpenSea API as it is currently
  // very rate limited. The key can be requested on https://docs.opensea.io/reference/request-an-api-key
  MY_OPENSEA_API_KEY

);

// Next, create the licensing manager. Please note that the manager will store internal state so
// you should always use the same manager instance instead of creating multiple ones
const licenser = new NFTLicense(apiProvider);

const verifyLicense = () => {

  // First, create a wallet licensing request for getting the user's wallet and a signature.
  // Please note that a licensing request can only ever be used once!
  // To verify licenses for multiple users, create multiple licensing requests instead
  const licensingRequest = licenser.createLicensingRequest();

  // Now send the licensing request to the user's browser using your preferred method.
  // In this case, it will use a socket.io connection with a callback the user's
  // browser will send after completing the licensing request.
  // Take a look at the browser usage further below to see the code on the other side
  socket.emit('licensing request', licensingRequest, (answer) => {

    // We now got an answer from the user. We can simply pass it back to the licenser to let it
    // validate the rest for us
    licenser.validateLicensingResponse(answer).then((isValid) => {

      // We now got our license verification!
      // If "isValid" is true, NFTLicense has confirmed that the user owns the wallet and the NFT
      console.log('Validated license:', isValid);

    });
  })
}
```

### Browser

```JavaScript
// Import the library
// Alternatively, you can import the script directly using
// <script src="/path/to/dist/NFTLicenseBrowser.js"></script>
// which will add the global NFTLicenseBrowser class to window
import { NFTLicenseBrowser } from 'nftlicense';

// Browser licenser doesn't require any additional information as that is handled
// completely on the server side
const licenser = new NFTLicenseBrowser();

// The server asks us to answer the licensing request using our wallet
// Again, this uses socket.io but you can use any method you'd like
socket.on('licensing request', (licensingRequest, callback) => {

  // Let the created licensor complete the licensing request
  // This will show the user a MetaMask (or other Web3 provider) popup to sign the message
  licenser.createLicensingResponse(licensingRequest).then((answer) => {

    // Simply relay the answer back to the server as all verification is done there
    callback(answer);
  });
});
```

## API

### NFTLicense

`import NFTLicense from 'nftlicense';`

- `new NFTLicense(api: Api, preamble: string = defaultPreamble)`

  Create a new NFTLicense server licensor.

  `api`: API Provider to use for verifying ownership

  `preamble` (optional): Text to prepend to the licensing request message. This will be shown on the user's MetaMask popup. If not set, the preamble will be:

  ```
  Please sign this message to verify your ownership of the wallet.
  After verifying your ownership, we are able to verify that your wallet contains the necessary license NFT to use this software.
  ```

  After the preamble, NFTLicense will add a random UUID to verify that the wallet signed this individual message.

- `createLicensingRequest(): object`

  Returns a new licensing request object

- `validateLicensingResponse(answer: object): Promise<boolean>`

  Validate an answer received from the user's browser. Please note that a licensing response can only ever be validated once to prevent users from using the same licensing info multiple times.

  `answer`: Answer object as returned by `NFTLicenseBrowser.createLicensingResponse`

### NFTLicenseBrowser

`import { NFTLicenseBrowser } from 'nftlicense';`

- `new NFTLicenseBrowser()`

  Create a new NFTLicenseBrowser browser-side licensor

- `createLicensingResponse(licensingRequest: object): Promise<object>`

  Complete a licensing request created by the server.

  This will return an answer object after the user has permitted signing

### OpenSeaApi

`import { OpenSeaApi } from 'nftlicense';`

- `new OpenSeaApi(contractAddress: string, tokenId: string, apiKey: string | null = null)`

  Create a new OpenSea API Provider

  `contractAddress`: Contract address for your NFT

  `tokenId`: Token ID for your NFT

  `apiKey`: API Key for OpenSea API (optional but highly recommended)

### MockApi

`import { MockApi } from 'nftlicense';`

Mock API to enable testing the system. This will simply always successfully validate any request without requesting any APIs

- `new MockApi()`

### Create your own API provider

An API provider implements requesting an NFT API to check if a wallet address contains the NFT. As most other complicated steps (getting wallet address, validating signature etc.) are handled by the library, adding new API providers is relatively simple.

API providers implement the API interface as defined in `src/api/Api.ts`. To comply with the interface, the provider only needs one function:

```TypeScript
hasValidLicense(address: string): Promise<boolean>;
```

This function show, given a wallet adress, return if the wallet contains a valid license.

Depending on the API used this may require additional information (e.g. the NFT's contract address and token ID) - this should be got using the class constructor instead. Using this method you can also create API providers that allow multiple different NFTs as licensing NFTs instead of only accepting one.

For an example of a bare minimum API provider, take a look at the Mock provider at `src/api/MockApi.ts`, for a full example look at `src/api/OpenSea.ts`.

## Development

1. Clone the repository
2. Install dependencies using `pnpm install`

- Webpack can be started in watch mode using `pnpm run watch`
- Production build can be created using `pnpm run build`
- Example page (for testing) can be run by using `pnpm run example`

## License

This code is licensed under the MIT license
