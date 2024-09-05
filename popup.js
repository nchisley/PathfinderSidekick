document.addEventListener('DOMContentLoaded', () => {
    const walletInput = document.getElementById('walletAddress');
    const fetchButton = document.getElementById('fetchNFTs');
    const deleteButton = document.getElementById('deleteWallet');
    const nftDisplay = document.getElementById('nftDisplay');
    const totalTraits = 15;

    // Debounce function to limit the rate at which fetchNFTs can be called
    let debounceTimeout;
    const debounce = (func, delay) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(func, delay);
    };

    // Load stored data
    const loadStoredData = () => {
        const storedWallet = localStorage.getItem('walletAddress');
        const storedNFTs = localStorage.getItem('nftData');
        if (storedWallet) {
            walletInput.value = storedWallet;
            showStoredWalletAddress(storedWallet);
            if (storedNFTs) {
                displayNFTs(JSON.parse(storedNFTs));
            }
        }
    };

    loadStoredData();

    // Event listeners
    fetchButton.addEventListener('click', () => debounce(async () => {
        const walletAddress = walletInput.value.trim();
        if (!walletAddress) {
            return alert('Please enter a Solana wallet address.');
        }
        await updateNFTs(walletAddress);
    }, 300));

    deleteButton.addEventListener('click', () => {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('nftData');
        walletInput.value = '';
        nftDisplay.innerHTML = 'Wallet address and NFT data removed.';
        deleteButton.style.display = 'none';
    });

    async function updateNFTs(walletAddress) {
        try {
            fetchButton.disabled = true;
            fetchButton.textContent = 'Fetching NFTs...';
            const nfts = await fetchNFTs(walletAddress);
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('nftData', JSON.stringify(nfts));
            displayNFTs(nfts);
            showStoredWalletAddress(walletAddress);
        } catch (error) {
            nftDisplay.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        } finally {
            fetchButton.disabled = false;
            fetchButton.textContent = 'SUMMON';
        }
    }

    function showStoredWalletAddress(walletAddress) {
        nftDisplay.innerHTML = `<p>Stored Wallet Address: ${walletAddress}</p>`;
        deleteButton.style.display = 'block';
    }

    async function fetchNFTs(walletAddress) {
        const apiKey = 'n8tr0ncrypto_sk_04oj4tc4cy2eiit3etxblx0bwspp1iua'; // Note: Should be securely managed
        const url = `https://api.simplehash.com/api/v0/nfts/owners?chains=solana&wallet_addresses=${walletAddress}&collection_ids=b1fd6d81e11166a1e4ae373ba56f290e`;
        const response = await fetch(url, {
            headers: { 'X-API-KEY': apiKey, 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return (await response.json()).nfts || [];
    }

    function calculateProgress(traits) {
        return ((traits.filter(trait => trait.value !== '???').length / totalTraits) * 100);
    }

    function displayNFTs(nfts) {
        nftDisplay.innerHTML = nfts.length ? '' : 'No NFTs found from the specified collection for this wallet address.';
        nfts.forEach(nft => {
            const container = document.createElement('div');
            container.className = 'nft';
            container.innerHTML = generateNFTHTML(nft);
            nftDisplay.appendChild(container);
        });
    }

    function generateNFTHTML(nft) {
        const traits = nft.extra_metadata?.attributes || [];
        const progressPercentage = calculateProgress(traits);
        const firstName = traits.find(t => t.trait_type.toLowerCase() === 'first name')?.value || '???';
        const lastName = traits.find(t => t.trait_type.toLowerCase() === 'last name')?.value || '???';

        return `
            <h3>${firstName} ${lastName}</h3>
            <div class="progress-container">
                <div class="progress-bar" style="width:${progressPercentage}%;">${Math.floor(progressPercentage)}%</div>
            </div>
            ${nft.image_url ? `<img src="${nft.image_url}" class="nft-image" loading="lazy">` : ''}
            <p class="description">${generateDescription(nft)}</p>
        `;
    }

    function generateDescription(nft) {
        const traits = nft.extra_metadata?.attributes.reduce((acc, trait) => {
            acc[trait.trait_type.toLowerCase()] = trait.value;
            return acc;
        }, {});

        return `
            Meet <b>${traits["first name"] || "???"}</b> <b>${traits["last name"] || "???"}</b>, a Pathfinder like no other. 
            They dress in a <b>${traits["clothes"] || "distinctive clothing"}</b> with a unique <b>${traits["accessory"] || "???"}</b> accessory. 
            They are accented by a <b>${traits["headgear"] || "???"}</b> on their head and a <b>${traits["backpiece"] || "???"}</b> on their back, adding to their remarkable appearance. 
            With a <b>${traits["expression"] || "???"}</b> expression and a <b>${traits["nose"] || "???"}</b> nose, they choose to maintain a <b>${traits["hairstyle"] || "???"}</b> hairstyle. 
            They often carry a <b>${traits["mouth item"] || "None"}</b> mouth item and boast a <b>${traits["body marking"] || "???"}</b> body marking. 
            With <b>${traits["eye color"] || "???"}</b> eyes and <b>${traits["skin color"] || "???"}</b> skin, this proud member of the <b>${traits["faction"] || "???"}</b> faction stands out against a <b>${traits["background"] || "???"}</b>.
        `;
    }
});
