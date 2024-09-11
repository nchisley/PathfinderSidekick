document.addEventListener('DOMContentLoaded', () => {
    const walletInput = document.getElementById('walletAddress');
    const fetchButton = document.getElementById('fetchNFTs');
    const deleteButton = document.getElementById('deleteWallet');
    const nftDisplay = document.getElementById('nftDisplay');
    const nftSelector = document.getElementById('nftSelector');
    const body = document.body;

    const totalTraits = 15;  // Total number of traits in the NFT

    // Create the star icon element
    const starIcon = document.createElement('div');
    starIcon.innerHTML = '🌞'; // Moon symbol for day, will change to 🌚 for night
    starIcon.style.cssText = `
        position: fixed;
        top: 10px;
        right: 20px;
        font-size: 30px;
        cursor: pointer;
        z-index: 3;
    `;
    document.body.appendChild(starIcon);

    // Function to toggle night mode
    const toggleNightMode = () => {
        const isNight = body.classList.toggle('night');
        localStorage.setItem('nightMode', isNight);
        starIcon.innerHTML = isNight ? '🌚' : '🌞'; // Change icon based on mode
    };

    // Event listener for the star icon
    starIcon.addEventListener('click', toggleNightMode);

    // Function to check window size and apply/remove panel-open class
    const checkWindowSize = () => {
        if (window.innerWidth > 360) {
            document.body.classList.add('panel-open');
        } else {
            document.body.classList.remove('panel-open');
        }
    };

    // Initial check and set night mode if previously enabled
    const loadNightMode = () => {
        const isNight = localStorage.getItem('nightMode') === 'true';
        if (isNight) {
            body.classList.add('night');
            starIcon.innerHTML = '🌚';
        }
    };

    // Initial checks
    checkWindowSize();
    loadNightMode();

    // Add event listener for window resize
    window.addEventListener('resize', checkWindowSize);

    // Load stored data
    const loadStoredData = () => {
        const storedWalletAddress = localStorage.getItem('walletAddress');
        const storedNFTs = localStorage.getItem('nftData');
        
        if (storedWalletAddress) {
            walletInput.value = storedWalletAddress;
            showStoredWalletAddress(storedWalletAddress);
            if (storedNFTs) {
                displayNFTs(JSON.parse(storedNFTs));
            }
        }
    };

    loadStoredData();

    // Fetch NFTs
    fetchButton.addEventListener('click', async () => {
        const walletAddress = walletInput.value.trim();
        if (!walletAddress) {
            return alert('Enter a Solana wallet address.');
        }

        try {
            fetchButton.disabled = true;
            fetchButton.textContent = 'SUMMONING...';
            await updateNFTs(walletAddress);
        } catch (error) {
            nftDisplay.innerHTML = `<span class="alert">Error fetching Pathfinders: ${error.message}</span>`;
        } finally {
            fetchButton.disabled = false;
            fetchButton.textContent = 'SUMMON';
        }
    });

    deleteButton.addEventListener('click', () => {
        const noticeContainer = document.getElementById('noticeContainer');
        const nftDisplay = document.getElementById('nftDisplay');
        
        // Clear local storage data
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('nftData');
        
        // Clear the input and nft display
        walletInput.value = '';
        nftDisplay.innerHTML = '';
        nftSelector.style.display = 'none';  // Hide the dropdown
        
        // Clear any existing notices
        noticeContainer.innerHTML = '';
    
        // Create a specific notice element
        const notice = document.createElement('div');
        notice.className = 'notice';
        notice.innerHTML = 'I removed your wallet address<br>and Pathfinders.';
        noticeContainer.appendChild(notice);
    
        // Hide the notice after 5 seconds
        setTimeout(() => {
            notice.remove();
        }, 5000);
    });

    async function updateNFTs(walletAddress) {
        localStorage.setItem('walletAddress', walletAddress);
        showStoredWalletAddress(walletAddress);
        const nfts = await fetchNFTs(walletAddress);
        localStorage.setItem('nftData', JSON.stringify(nfts));
        displayNFTs(nfts);
    }

    // Utility function to truncate the wallet address
    function truncateAddress(address) {
        if (!address || address.length < 8) return address;
        return `${address.substring(0, 4)}....${address.substring(address.length - 4)}`;
    }

    function showStoredWalletAddress(walletAddress) {
        const noticeContainer = document.getElementById('noticeContainer');
        const truncatedAddress = truncateAddress(walletAddress);
    
        // Clear any existing notices
        noticeContainer.innerHTML = '';
    
        // Create a specific notice element
        const notice = document.createElement('div');
        notice.className = 'notice';
        notice.innerHTML = `I loaded the wallet address ${truncatedAddress}<br>and your Pathfinders!`;
        noticeContainer.appendChild(notice);
    
        deleteButton.style.display = 'block';
    
        // Hide the notice after 5 seconds
        setTimeout(() => {
            notice.remove();
        }, 5000);
    }
    
    // Function to fetch NFTs (Pathfinders collection id = b1fd6d81e11166a1e4ae373ba56f290e)
    async function fetchNFTs(walletAddress) {
        const apiKey = 'n8tr0ncrypto_sk_04oj4tc4cy2eiit3etxblx0bwspp1iua';
        const url = `https://api.simplehash.com/api/v0/nfts/owners?chains=solana&wallet_addresses=${walletAddress}&collection_ids=b1fd6d81e11166a1e4ae373ba56f290e`;
    
        const response = await fetch(url, {
            headers: { 'X-API-KEY': apiKey, 'Accept': 'application/json' }
        });
    
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
        const data = await response.json();
        return data.nfts || [];
    }
    

    // Function to calculate progress based on traits
    function calculateProgress(traits) {
        const filledTraits = traits.filter(trait => trait.value !== '???').length;
        const progressPercentage = (filledTraits / totalTraits) * 100;
        return progressPercentage;
    }

    // Display NFTs with the progress bar
    function displayNFTs(nfts) {
        nftDisplay.innerHTML = nfts.length ? '' : '<span class="alert">No NFTs found from the specified collection for this wallet address.</span>';
        if (nfts.length > 0) {
            populateDropdown(nfts);
            displaySingleNFT(nfts[0]);  // Display the first NFT by default
        }
    }

    function populateDropdown(nfts) {
        nftSelector.style.display = 'block';
        nftSelector.innerHTML = '';

        nfts.forEach((nft, index) => {
            const option = document.createElement('option');
            option.value = index;
            const firstName = nft.extra_metadata?.attributes.find(trait => trait.trait_type.toLowerCase() === 'first name')?.value || '???';
            const lastName = nft.extra_metadata?.attributes.find(trait => trait.trait_type.toLowerCase() === 'last name')?.value || '???';
            option.textContent = `${firstName} ${lastName}`;
            nftSelector.appendChild(option);
        });

        nftSelector.addEventListener('change', (event) => {
            displaySingleNFT(nfts[event.target.value]);
        });
    }

    function displaySingleNFT(nft) {
        nftDisplay.innerHTML = '';  // Clear previous display

        const container = document.createElement('div');
        container.className = 'nft';

        const traits = nft.extra_metadata?.attributes || [];

        const nameElement = document.createElement('h3');
        const firstName = traits.find(trait => trait.trait_type.toLowerCase() === 'first name')?.value || '???';
        const lastName = traits.find(trait => trait.trait_type.toLowerCase() === 'last name')?.value || '???';
        nameElement.textContent = `${firstName} ${lastName}`;
        container.appendChild(nameElement);

        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress-container';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressPercentage = calculateProgress(traits);
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.innerText = `${Math.floor(progressPercentage)}%`;
        progressBarContainer.appendChild(progressBar);
        container.appendChild(progressBarContainer);

        if (nft.image_url) {
            const img = document.createElement('img');
            img.src = nft.image_url;
            img.className = 'nft-image';
            container.appendChild(img);
        }

        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'description';
        descriptionElement.innerHTML = generateDescription(nft);
        container.appendChild(descriptionElement);

        nftDisplay.appendChild(container);
    }

    function generateDescription(nft) {
        const traits = nft.extra_metadata?.attributes.reduce((acc, trait) => {
            acc[trait.trait_type.toLowerCase()] = trait.value;
            return acc;
        }, {});

        return `
            <p>CHAPTER ONE<br><b>THE BEGINNING</b></p>Meet <b>${traits["first name"] || "???"}</b> <b>${traits["last name"] || "???"}</b>, a Pathfinder like no other. 
            They dress in a <b>${traits["clothes"] || "distinctive clothing"}</b> with a unique <b>${traits["accessory"] || "???"}</b> accessory. 
            They are accented by a <b>${traits["headgear"] || "???"}</b> on their head and a <b>${traits["backpiece"] || "???"}</b> on their back, adding to their remarkable appearance. 
            With a <b>${traits["expression"] || "???"}</b> expression and a <b>${traits["nose"] || "???"}</b> nose, they choose to maintain a <b>${traits["hairstyle"] || "???"}</b> hairstyle. 
            They often carry a <b>${traits["mouth item"] || "None"}</b> mouth item and boast a <b>${traits["body marking"] || "???"}</b> body marking. 
            With <b>${traits["eye color"] || "???"}</b> eyes and <b>${traits["skin color"] || "???"}</b> skin, this proud member of the <b>${traits["faction"] || "???"}</b> faction stands out against a <b>${traits["background"] || "???"}</b>.
        `;
    }
});