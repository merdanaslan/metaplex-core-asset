import { createNft } from './createNft.js';

console.log('Starting NFT creation process...');
createNft()
  .then(() => console.log('NFT creation process completed.'))
  .catch((error) => {
    console.error('An error occurred during NFT creation:');
    console.error(error);
  });