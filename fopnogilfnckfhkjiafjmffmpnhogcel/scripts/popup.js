document.getElementById("openMyDesigns").addEventListener("click", () => {
    openTabs("designs.html");
});

document.getElementById("visit").addEventListener("click", () => {
    window.open("https://merch-research.blogspot.com", '_blank');
});


function openTabs(url){
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	  const currentTab = tabs[0];

	  // Open in a regular window
	  chrome.tabs.create({ url: chrome.runtime.getURL(url) });
	  
	});	
}
document.addEventListener('DOMContentLoaded', async() => {
    // Check the saved state in localStorage

	const settings = await getUI() ;
    const isEnabled = settings? settings.isEnabled : false;
	const nav = settings? settings.showCompetition : false;
	const op = settings? settings.showProductinfo : false;
    
    const toggleButton = document.getElementById('toggleButton');hidePolitics
	const navButton = document.getElementById('hidePolitics');
	const opButton = document.getElementById('storeData');
   
	toggleButton.checked = isEnabled;  // Show "Disable" if enabled
	navButton.checked = nav;  // Show "Disable" if enabled
	opButton.checked = op;  // Show "Disable" if enabled

    toggleButton.addEventListener('click', () => {

        // Update button text
        if (toggleButton.checked) {
            toggleButton.checked = true;
        } else {
            toggleButton.checked = false;
        }

        // Send message to content script to enable/disable feature 
		saveUiSettings(new UI(toggleButton.checked,opButton.checked,navButton.checked));  
    });
	navButton.addEventListener('click', () => {

        // Update button text
        if (navButton.checked) {
            navButton.checked = true;
        } else {
            navButton.checked = false;
        }

        // Send message to content script to enable/disable feature 
		saveUiSettings(new UI(toggleButton.checked,opButton.checked,navButton.checked));  
    });
	opButton.addEventListener('click', () => {

        // Update button text
        if (opButton.checked) {
            opButton.checked = true;
        } else {
            opButton.checked = false;
        }

        // Send message to content script to enable/disable feature   
		saveUiSettings(new UI(toggleButton.checked,opButton.checked,navButton.checked));
    });

});

// Content Script: Function to request the sender tab ID from the background script
async function requestTabId() {
    const maxRetries = 3; // Maximum number of retries
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            return await new Promise((resolve, reject) => {
                const port = chrome.runtime.connect({ name: "activeTabId" });

                // Send request for tab ID
                port.postMessage({ action: "getActiveTabId" });

                // Listen for response on this port
                port.onMessage.addListener((response) => {
                    if (response && response.tabId !== undefined) {
                        resolve(response.tabId);
                    } else {
                        console.error("Failed to retrieve tab ID");
                        reject("Tab ID not found");
                    }
                    port.disconnect(); // Disconnect after receiving response
                });

                // Handle disconnection errors
                port.onDisconnect.addListener(() => {
                    if (chrome.runtime.lastError) {
                        console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError.message);
                    } else {
                        console.log("Port disconnected successfully.");
                    }
                });
            });
        } catch (error) {
            attempt++;
            console.warn(`Attempt ${attempt} failed: ${error}`);

            if (attempt >= maxRetries) {
                console.error("All retry attempts failed.");
                break;
            }

            // Optional: Add a small delay between retries
            await new Promise((resolve) => setTimeout(resolve, 500)); // 1-second delay
        }
    }

    // If all retries fail, return null
    return null;
}

// Function to store data using the retrieved tab ID
async function saveUiSettings(data) {
    try {
        const tabId = true; // Request tab ID

        if (tabId) {
            const port = chrome.runtime.connect({ name: "UI" });

            // Send `tabId` with data
            port.postMessage({ action: "saveUI", data: data});

            // Setup a timeout to close the port if no response within a specified time
            const timeoutId = setTimeout(() => {
                console.warn("Port disconnected due to timeout.");
                port.disconnect();
            }, 30000); // Adjust timeout duration as needed

            // Listen for messages from the background script on this port
            port.onMessage.addListener((response) => {
                clearTimeout(timeoutId); // Clear timeout if response is received

                if (response.status === 'success') {
                    console.log("UI settings saved successfully");
                } else {
                    console.error("Data storage failed", response.message);
                }

                port.disconnect(); // Close port after handling the response
            });

            // Handle any errors during message transmission
            port.onDisconnect.addListener(() => {
                if (chrome.runtime.lastError) {
                    console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                } else {
                    console.log("Port disconnected successfully.");
                }
            });
        }
    } catch (error) {
        console.error("Error in saveUiSettings function:", error);
    }
}

async function getUI() {
    try {
        const tabId = true; // Request tab ID
                        
        if (tabId) {
            return new Promise((resolve, reject) => {
                // Establish a long-lived connection with the background script
                const port = chrome.runtime.connect({ name: "UI" });

                // Send `tabId` with data
                port.postMessage({ action: "getUI"});

                // Listen for messages from the background script on this port
                port.onMessage.addListener((response) => {
                    if (response.status === 'success') {
                        if(!response.message){
                            resolve(null);
                        }else{
                            resolve(response.message);  // Resolve the promise with the response message
                        }
                    } else {
                        resolve(null);  // Resolve with null if the status is not 'success'
                    }

                    // Optionally disconnect the port after receiving the response
                    port.disconnect();
                });

                // Handle any errors during message transmission
                port.onDisconnect.addListener(() => {
                    if (chrome.runtime.lastError) {
                        console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(new Error("Disconnected due to an error"));
                    } else {
                        console.log("Port disconnected successfully.");
                    }
                });
            });
        } else {
            throw new Error("tabId is undefined");
        }

    } catch (e) {
        console.error('Retrieving data failed!', e);
        return null;  // Return null in case of any failure
    }
}








class UI {
    constructor(isEnabled, showProductinfo, showCompetition) {
        this.isEnabled = isEnabled;  // Whether feature is enabled or not
        this.showProductinfo = showProductinfo; // Product info visibility
        this.showCompetition = showCompetition; // Competition info visibility
        this.asin = 'state';  // You can use this for future use, otherwise leave it as it is
    }
}
