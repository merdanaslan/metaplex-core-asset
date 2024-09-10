import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { createGenericFile, keypairIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

const uploadAssets = async () => {
  // Set up Umi with a signer
  const umi = createUmi('https://api.devnet.solana.com')
    .use(irysUploader({
      address: 'https://devnet.irys.xyz',
      timeout: 60000, // Increase timeout to 60 seconds
    }));
  
  // Load the keypair from file
  const keypairFile = fs.readFileSync('/Users/merdanaslan/my-solana-wallet.json', 'utf-8');
  const keypairData = JSON.parse(keypairFile);
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(keypairIdentity(signer));

  // Upload image
  const imageFile = fs.readFileSync(path.join('./maindocs-high-res.png'));
  const umiImageFile = createGenericFile(imageFile, 'maindocs-high-res.png', {
    tags: [{ name: 'Content-Type', value: 'image/png' }],
  });

  console.log('Uploading Image...');
  const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
    throw new Error(err);
  });
  console.log('Image URI:', imageUri[0]);

  // Create and upload metadata
  const metadata = {
    name: 'My NFT',
    description: 'This is an NFT on Solana',
    image: imageUri[0],
    external_url: 'https://maindocs.io',
    attributes: [
      { trait_type: 'trait1', value: 'value1' },
      { trait_type: 'trait2', value: 'value2' },
    ],
    properties: {
      files: [{ uri: imageUri[0], type: 'image/png' }],
      category: 'image',
    },
  };

  console.log('Uploading Metadata...');
  const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    throw new Error(err);
  });
  console.log('Metadata URI:', metadataUri);
};

export { uploadAssets };