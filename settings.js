document.getElementById('saveWallet').addEventListener('click', () => {
    const walletAddress = document.getElementById('settingsWalletAddress').value;
    if (walletAddress) {
        updateWalletAddress(walletAddress);
        alert('Wallet address saved!');
    } else {
        alert('Please enter a wallet address.');
    }
});

document.getElementById('deleteWallet').addEventListener('click', () => {
    updateWalletAddress('');
    document.getElementById('settingsWalletAddress').value = '';
    alert('Wallet address deleted!');
});

function updateWalletAddress(address) {
    localStorage.setItem('walletAddress', address);
    // Optionally, update the popup if it's open
    chrome.runtime.sendMessage({action: "updateWallet", wallet: address});
}

// Load current wallet address into the input field
document.addEventListener('DOMContentLoaded', () => {
    const currentWallet = localStorage.getItem('walletAddress') || '';
    document.getElementById('settingsWalletAddress').value = currentWallet;
});