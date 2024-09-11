#!/usr/bin/env node

import { mplCore } from '@metaplex-foundation/mpl-core'
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import fs from 'fs'
import path from 'path'

const uploadWithExistingWallet = async () => {
  const umi = createUmi('https://api.devnet.solana.com')
    .use(mplCore())
    .use(
      irysUploader({
        // mainnet address: "https://node1.irys.xyz"
        // devnet address: "https://devnet.irys.xyz"
        address: 'https://devnet.irys.xyz',
      })
    )

  // Generate a new keypair signer.
  const signer = generateSigner(umi)

  // You will need to use fs and navigate the filesystem to
  // load the wallet you wish to use via relative pathing.
  const walletFile = fs.readFileSync('/Users/merdanaslan/my-solana-wallet.json')

  // Convert your walletFile onto a keypair.
  let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(JSON.parse(walletFile)));

  // Load the keypair into umi.
  umi.use(keypairIdentity(keypair));

  console.log('Using wallet:', keypair.publicKey)

  // Read and upload the image
  const imageFile = fs.readFileSync(path.join('./maindocs-high-res.png'))
  const umiImageFile = createGenericFile(imageFile, 'maindocs-high-res.png', {
    tags: [{ name: 'Content-Type', value: 'image/png' }],
  })

  console.log('Uploading Image...')
  const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
    throw new Error(err)
  })

  console.log('imageUri:', imageUri[0])

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
  }

  console.log('Uploading Metadata...')
  const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    throw new Error(`Failed to upload metadata: ${err.message}`)
  })

  console.log('Metadata URI:', metadataUri)
}

uploadWithExistingWallet().catch(console.error)