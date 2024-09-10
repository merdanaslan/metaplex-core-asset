import { create } from '@metaplex-foundation/mpl-core'
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplCore } from '@metaplex-foundation/mpl-core'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { base58 } from '@metaplex-foundation/umi/serializers'
import { Keypair } from '@solana/web3.js'
import fs from 'fs'

export const createNft = async () => {
  // Load keypair from file
  const keypairFile = fs.readFileSync('/Users/merdanaslan/my-solana-wallet.json', 'utf-8');
  const keypairData = JSON.parse(keypairFile);
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

  // Setting Up Umi
  const umi = createUmi('https://api.devnet.solana.com')
    .use(mplCore())
    .use(irysUploader({
      address: 'https://devnet.irys.xyz',
    }))

  const signer = createSignerFromKeypair(umi, keypair)
  umi.use(signerIdentity(signer))

  // Use the URIs from the previous upload
  const imageUri = 'https://arweave.net/G8dG5EGGu8FimmHLfzXZCRKJ6AQnag17JwUL12divHAZ'
  const metadataUri = 'https://arweave.net/7CchRcjEpwqYYLLKN7nWSPtHGuXgh1kV3N4df2amcRvy'

  console.log('Using previously uploaded assets:')
  console.log('Image URI:', imageUri)
  console.log('Metadata URI:', metadataUri)

  // Creating the NFT
  console.log('Creating NFT...')
  try {
    const asset = generateSigner(umi)
    const { signature, nft } = await create(umi, {
      asset,
      name: 'My NFT',
      uri: metadataUri,
      sellerFeeBasisPoints: 500, // 5%
    }).sendAndConfirm(umi)

    // Log out the signature and the links to the transaction and the NFT
    console.log('\nNFT Created')
    console.log('View Transaction on Solana Explorer')
    console.log(`https://explorer.solana.com/tx/${base58.deserialize(signature)[0]}?cluster=devnet`)
    console.log('\n')
    console.log('View NFT on Metaplex Explorer')
    console.log(`https://core.metaplex.com/explorer/${asset.publicKey}?env=devnet`)
  } catch (error) {
    console.error('Error creating NFT:', error)
    if (error.logs) {
      console.error('Transaction logs:', error.logs)
    }
  }
}

// Remove this line if it exists at the end of the file:
// createNft().catch(console.error)