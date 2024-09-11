#!/usr/bin/env node

console.log('Script started');

import { create, mplCore } from '@metaplex-foundation/mpl-core';
import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { base58 } from '@metaplex-foundation/umi/serializers';
import fs from 'fs';

const createNft = async () => {
  console.log('Starting NFT creation process...');

  try {
    const umi = createUmi('https://api.devnet.solana.com')
      .use(mplCore());

    console.log('Umi created');

    // Load the existing wallet
    const walletFile = fs.readFileSync('/Users/merdanaslan/my-solana-wallet.json');
    console.log('Wallet file read');

    let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(JSON.parse(walletFile)));
    console.log('Keypair created');

    umi.use(keypairIdentity(keypair));
    console.log('Using wallet:', keypair.publicKey);

    // Use the existing metadata URI
    const metadataUri = 'https://arweave.net/6CoXqatTj3KDdTTi7GzL8Xn3vr8aTe7S3kESKQ6iLWEF';

    // Creating the NFT
    const asset = generateSigner(umi);
    console.log('Asset signer generated');

    console.log('Creating NFT...');
    const tx = await create(umi, {
      asset,
      name: 'My NFT',
      uri: metadataUri,
    }).sendAndConfirm(umi);

    console.log('Transaction sent');

    // Deserialize the signature
    const signature = base58.deserialize(tx.signature)[0];

    // Log out the signature and the links to the transaction and the NFT
    console.log('\nNFT Created');
    console.log('View Transaction on Solana Explorer');
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log('\n');
    console.log('View NFT on Metaplex Explorer');
    console.log(`https://core.metaplex.com/explorer/${asset.publicKey}?env=devnet`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

createNft().catch(console.error);