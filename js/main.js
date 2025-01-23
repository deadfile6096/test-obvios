// Loading Screen Handler
const loadingScreen = document.querySelector('.loading-screen');
const loadingStatus = document.querySelector('.loading-status');

const loadingMessages = [
    'Initializing AI modules...',
    'Connecting to Solana network...',
    'Loading smart contracts...',
    'Calibrating DEX integrations...',
    'Ready to launch...'
];

let messageIndex = 0;
const messageInterval = setInterval(() => {
    if (messageIndex < loadingMessages.length) {
        loadingStatus.textContent = loadingMessages[messageIndex];
        messageIndex++;
    } else {
        clearInterval(messageInterval);
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                initializeTerminal();
            }, 500);
        }, 500);
    }
}, 500);

// Terminal Interface
const lastLoginElement = document.getElementById('lastLogin');
const now = new Date();
lastLoginElement.textContent = now.toLocaleString();

// Make terminal clickable to focus input
document.querySelector('.terminal-window').addEventListener('click', () => {
    focusTerminalInput();
});

// Create and focus invisible input for typing
function createTerminalInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'terminal-input';
    input.style.position = 'fixed';
    input.style.bottom = '0';
    input.style.left = '0';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    document.body.appendChild(input);
    return input;
}

const terminalInput = createTerminalInput();

function focusTerminalInput() {
    terminalInput.focus();
}

// Handle terminal input
terminalInput.addEventListener('input', (e) => {
    const currentPrompt = document.querySelector('.cursor').parentElement;
    if (!currentPrompt) return;
    
    // Only update the current prompt's content
    const promptText = currentPrompt.querySelector('.prompt');
    const cursor = currentPrompt.querySelector('.cursor');
    currentPrompt.innerHTML = '';
    currentPrompt.appendChild(promptText);
    currentPrompt.appendChild(document.createTextNode(' ' + e.target.value));
    currentPrompt.appendChild(cursor);
});

// Prevent page scroll on input focus
terminalInput.addEventListener('focus', (e) => {
    e.preventDefault();
    const terminalWindow = document.querySelector('.terminal-window');
    const lastPrompt = terminalWindow.querySelector('.cursor')?.parentElement;
    if (lastPrompt) {
        lastPrompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        const currentPrompt = document.querySelector('.cursor').parentElement;
        const command = terminalInput.value.trim();
        
        if (command) {
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            executeCommand(command);
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHistory('down');
    }
});

// Keep terminal focused
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        focusTerminalInput();
    }
});

// Initialize terminal with typewriter effect
function initializeTerminal() {
    const messages = document.querySelectorAll('.system-message, .response');
    messages.forEach((msg, index) => {
        msg.style.opacity = '0';
        setTimeout(() => {
            msg.style.opacity = '1';
            msg.style.animation = 'slideIn 0.3s ease-out forwards';
        }, index * 100);
    });
    setTimeout(() => {
        document.querySelector('.terminal-window').scrollTop = 0;
    }, 100);
}

// Phantom Wallet Integration
let wallet = null;
let publicKey = null;

const connectButton = document.getElementById('connectWallet');
const contractAddressElement = document.getElementById('contractAddress');
const modal = document.getElementById('walletModal');
const closeModal = document.querySelector('.close-modal');
const phantomWalletOption = document.getElementById('phantomWallet');

// Contract address (replace with your actual contract address)
const CONTRACT_ADDRESS = "Web3OK CA Coming Soon";
contractAddressElement.textContent = CONTRACT_ADDRESS;

// Modal handlers with animations
connectButton.onclick = () => {
    modal.style.display = 'block';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
};

closeModal.onclick = () => {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};

// Wallet connection handler
async function connectWallet() {
    try {
        addTerminalMessage('Initializing wallet connection...');
        
        // Check if Phantom is installed
        const isPhantomInstalled = window.solana && window.solana.isPhantom;
        
        if (!isPhantomInstalled) {
            addTerminalMessage('Phantom wallet not detected!', 'error');
            window.open("https://phantom.app/", "_blank");
            return;
        }

        // Connect to Phantom
        const resp = await window.solana.connect();
        publicKey = resp.publicKey.toString();
        
        // Update button text and add disconnect button
        connectButton.textContent = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
        connectButton.classList.add('connected');
        
        // Add disconnect handler
        connectButton.onclick = disconnectWallet;
        
        // Close modal with animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Add success message to terminal
        addTerminalMessage(`Connected to wallet: ${publicKey}`, 'success');

    } catch (err) {
        console.error("Error connecting to wallet:", err);
        addTerminalMessage(`Error: ${err.message}`, 'error');
    }
}

// Disconnect wallet handler
async function disconnectWallet() {
    try {
        addTerminalMessage('Disconnecting wallet...');
        await window.solana.disconnect();
        publicKey = null;
        
        // Reset button with animation
        connectButton.classList.add('disconnecting');
        setTimeout(() => {
            connectButton.textContent = "Connect Wallet";
            connectButton.classList.remove('connected', 'disconnecting');
            connectButton.onclick = () => {
                modal.style.display = 'block';
                setTimeout(() => modal.style.opacity = '1', 10);
            };
        }, 300);
        
        addTerminalMessage('Wallet disconnected successfully', 'success');
        
    } catch (err) {
        console.error("Error disconnecting wallet:", err);
        addTerminalMessage(`Error: ${err.message}`, 'error');
    }
}

// Enhanced terminal message handler with animations
function addTerminalMessage(message, type = 'info') {
    const terminal = document.querySelector('.terminal-body .message-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.style.opacity = '0';
    
    const prompt = document.createElement('span');
    prompt.classList.add('prompt');
    prompt.textContent = 'web3ok@solana:~$';
    
    const content = document.createElement('span');
    content.classList.add(type);
    content.textContent = ` ${message}`;
    
    messageElement.appendChild(prompt);
    messageElement.appendChild(content);
    
    // Remove cursor from previous line
    const previousCursor = terminal.querySelector('.cursor')?.parentElement;
    if (previousCursor) {
        previousCursor.remove();
    }
    
    terminal.appendChild(messageElement);
    
    // Add new cursor line
    const cursorLine = document.createElement('div');
    cursorLine.classList.add('system-message');
    cursorLine.style.opacity = '0';
    cursorLine.innerHTML = '<span class="prompt">web3ok@solana:~$</span> <span class="cursor">█</span>';
    terminal.appendChild(cursorLine);
    
    // Animate new elements
    requestAnimationFrame(() => {
        messageElement.style.opacity = '1';
        messageElement.style.animation = 'slideIn 0.3s ease-out forwards';
        cursorLine.style.opacity = '1';
        cursorLine.style.animation = 'slideIn 0.3s ease-out forwards';
    });
    
    // Scroll to bottom with smooth animation
    terminal.scrollTo({
        top: terminal.scrollHeight,
        behavior: 'smooth'
    });
}

// Add click event listener to Phantom wallet option
phantomWalletOption.addEventListener('click', connectWallet);

// Matrix text effect with smoother animation
document.querySelectorAll('.matrix-text').forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    
    [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        span.style.animation = `fadeIn 0.5s ease-out forwards ${i * 0.05}s`;
        element.appendChild(span);
    });
});

// Contract address copy functionality
function copyContractAddress() {
    const address = document.getElementById('contractAddress').textContent;
    navigator.clipboard.writeText(address).then(() => {
        const contractElement = document.querySelector('.contract-address');
        contractElement.classList.add('copied');
        
        // Show temporary "Copied!" message
        const tooltip = document.querySelector('.copy-tooltip');
        tooltip.textContent = 'Copied!';
        
        setTimeout(() => {
            contractElement.classList.remove('copied');
            tooltip.textContent = 'Click to copy';
        }, 1000);
        
        addTerminalMessage('Contract address copied to clipboard', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        addTerminalMessage('Failed to copy contract address', 'error');
    });
}

// Terminal command handling
const commandHistory = [];
let historyIndex = -1;

function navigateHistory(direction) {
    if (commandHistory.length === 0) return;
    
    if (direction === 'up') {
        historyIndex = Math.max(0, historyIndex - 1);
    } else {
        historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    }
    
    const currentInput = document.querySelector('.cursor').parentElement;
    if (historyIndex < commandHistory.length) {
        currentInput.innerHTML = `<span class="prompt">web3ok@solana:~$</span> ${commandHistory[historyIndex]}<span class="cursor">█</span>`;
        terminalInput.value = commandHistory[historyIndex];
    } else {
        currentInput.innerHTML = '<span class="prompt">web3ok@solana:~$</span> <span class="cursor">█</span>';
        terminalInput.value = '';
    }
}

function executeCommand(command) {
    const terminal = document.querySelector('.message-container');
    
    // Remove the current command line
    const currentPrompt = document.querySelector('.cursor').parentElement;
    currentPrompt.innerHTML = `<span class="prompt">web3ok@solana:~$</span> ${command}`;
    
    // Execute command and show response
    let response = null;
    switch(command.toLowerCase().trim()) {
        case 'whoami':
            response = document.querySelector('.response.matrix-text').cloneNode(true);
            break;
        case 'features':
            response = document.querySelector('.response.feature-grid').cloneNode(true);
            break;
        case 'capabilities':
            response = document.querySelector('.response.capabilities-list').cloneNode(true);
            break;
        case 'stats':
            response = document.querySelector('.response.stats-list').cloneNode(true);
            break;
        case 'connect':
            connectButton.click();
            break;
        case 'help':
            response = document.querySelector('.response.commands-list').cloneNode(true);
            break;
        case 'clear':
            clearTerminal();
            return;
        case 'stake':
            const stakeMsg = document.createElement('div');
            stakeMsg.className = 'response info';
            stakeMsg.textContent = 'Staking functionality coming soon...';
            terminal.appendChild(stakeMsg);
            break;
        case 'mint':
            const mintMsg = document.createElement('div');
            mintMsg.className = 'response info';
            mintMsg.textContent = 'NFT minting functionality coming soon...';
            terminal.appendChild(mintMsg);
            break;
        case 'swap':
            const swapMsg = document.createElement('div');
            swapMsg.className = 'response info';
            swapMsg.textContent = 'Token swapping via Jupiter coming soon...';
            terminal.appendChild(swapMsg);
            break;
        case 'launch':
            const launchMsg = document.createElement('div');
            launchMsg.className = 'response info';
            launchMsg.textContent = 'Token launch functionality coming soon...';
            terminal.appendChild(launchMsg);
            break;
        default:
            const errorMsg = document.createElement('div');
            errorMsg.className = 'response error';
            errorMsg.textContent = `Command not found: ${command}. Type 'help' for available commands.`;
            terminal.appendChild(errorMsg);
    }

    // Append response if exists
    if (response) {
        terminal.appendChild(response);
        response.style.display = 'block';
    }
    
    // Add new prompt
    const newPrompt = document.createElement('div');
    newPrompt.className = 'system-message';
    newPrompt.innerHTML = '<span class="prompt">web3ok@solana:~$</span> <span class="cursor">█</span>';
    terminal.appendChild(newPrompt);
    
    // Reset input value
    terminalInput.value = '';
    
    // Scroll to the new prompt within terminal
    const terminalWindow = document.querySelector('.terminal-window');
    terminalWindow.scrollTop = terminalWindow.scrollHeight;
    
    // Focus input without scrolling page
    setTimeout(() => {
        terminalInput.focus({preventScroll: true});
    }, 50);
}

function showWhoami() {
    const whoamiSection = document.querySelector('.response.matrix-text').cloneNode(true);
    whoamiSection.style.opacity = '0';
    document.querySelector('.message-container').appendChild(whoamiSection);
    
    requestAnimationFrame(() => {
        whoamiSection.style.opacity = '1';
        whoamiSection.style.animation = 'slideIn 0.3s ease-out forwards';
    });
}

function clearTerminal() {
    const container = document.querySelector('.message-container');
    container.innerHTML = '';
    addTerminalMessage('Terminal cleared', 'info');
} 