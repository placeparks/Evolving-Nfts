import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NFT } from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../constants/addresses";

const chain = "mumbai";

const teenageImage = "https://amethyst-sound-orangutan-120.mypinata.cloud/ipfs/QmYDbZGfHX12wFHEvzPNgE7f9no8P2xSwpNvTpDEUQ9LFB?_gl=1*1t0gonj*_ga*MTMwNjAzNDA4MS4xNjk2NTA3OTQy*_ga_5RMPXG14TE*MTY5OTI5ODQ0Mi40LjEuMTY5OTI5OTE3OS4zNi4wLjA.";
const adultImage = "https://amethyst-sound-orangutan-120.mypinata.cloud/ipfs/Qme69MGmNSqm2tQ6Kf9XdSzSxKBcRi53bFeVWPrFBBs1mZ?_gl=1*1mawk6d*_ga*MTMwNjAzNDA4MS4xNjk2NTA3OTQy*_ga_5RMPXG14TE*MTY5OTMwMTY2OS41LjAuMTY5OTMwMTY2OS42MC4wLjA."

function getSDK() {
    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY; // No exclamation mark here
    if (!privateKey) {
        throw new Error('PRIVATE_KEY is not set in environment variables');
    }

    const sdk = ThirdwebSDK.fromPrivateKey(privateKey, chain, {
        clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID, // This is safe if it's not a sensitive value
    });
    return sdk;
};

export async function gainExp(
    nft: NFT,
    level: string,
    exp: string,
    nftTokenId: string,
){
    try {
        const sdk = getSDK();

        const contract = await sdk.getContract(CONTRACT_ADDRESS);

        var updatedExp = await parseInt(exp) + 50;
        var updatedLvl = await parseInt(level);

        if (updatedExp >= 100) {
            updatedLvl += 1;
            updatedExp -= 100;
        }

        const metadata = {
            ...nft.metadata,
            attributes: [
                {
                    trait_type: "Level",
                    value: updatedLvl.toString(),
                },
                {
                    trait_type: "Exp",
                    value: updatedExp.toString(),
                },
            ],
        };

        const newUri = await sdk.storage.upload(metadata);

        const updateNFT = await contract.call(
            "setTokenURI",
            [
                nftTokenId,
                newUri,
            ]
        );

        return { success: "NFT Trained!" };
    } catch (error) {
        console.log(error);
    }
};

export async function evolve(
    nft: NFT,
    level: string,
    nftTokenId: string,
){
    try {
        const sdk = getSDK();
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        const lvl = parseInt(level);
        let metadata;

        // Check if the NFT has reached level 2 and evolve to teenager
        if(lvl === 2) {
            metadata = {
                ...nft.metadata,
                name: "Teenager Nina", // New name for the NFT
                image: teenageImage, // New image for level 2
            };
        }
        // Check if the NFT has reached level 3 and evolve to adult
        else if(lvl === 3) {
            metadata = {
                ...nft.metadata,
                name: "Adult Nina", // New name for the NFT
                image: adultImage, // New image for level 3
            };
        }

        // If metadata is defined, then an evolution occurred
        if (metadata) {
            const newUri = await sdk.storage.upload(metadata);
            await contract.call(
                "setTokenURI",
                [nftTokenId, newUri] // Arguments need to be passed as an array
            );
        }
        

        return { success: "NFT Evolved!" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to evolve NFT." };
    }
}