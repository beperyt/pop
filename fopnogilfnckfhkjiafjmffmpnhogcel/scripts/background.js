/////////////////////////////////////////////////////////////////////////////////////////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "downloadCSV") {
        chrome.downloads.download({
            url: request.url,
            filename: request.filename,
            saveAs: true // Prompts user for save location
        }, function(downloadId) {
            //console.log("Download triggered with ID:", downloadId);

            if (typeof URL.revokeObjectURL === "function") {
                // Revoke each Object URL after download to free up memory
                setTimeout(() => {
                    URL.revokeObjectURL(request.url);
                    //console.log("Object URL revoked for:", request.filename);
                }, 30000); // Adjust delay if needed
            }
        });
    }
});

// Background Script: Listening for connections and messages
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "activeTabId") {
        port.onMessage.addListener(async (request,sender) => {
            if (request.action === "getActiveTabId") {
                // No need for chrome.tabs.query; we can respond via the same port
                const tabId = port.sender.tab ? port.sender.tab.id : null; // Use sender's tab ID directly
                port.postMessage({ tabId: tabId });
            }
        });
    }
});

chrome.runtime.onConnect.addListener(async (port) => {
    if (port.name === "closeTabs") {
        port.onMessage.addListener(async (request,sender) => {
            if (request.action === "closeTabs") {
                const tabId = port.sender.tab?.id;

                if (!tabId) {
                    //console.error('Invalid tab ID. Cannot close tab.');
                    port.postMessage({ status: 'error', message: 'Invalid tab ID' });
                    return;
                }

                chrome.tabs.remove(tabId, async() => {
                    if (chrome.runtime.lastError) {
                        //console.error('Failed to close tab:', chrome.runtime.lastError.message);
                        port.postMessage({ status: 'error', message: 'Failed to close tab' });
                        return;
                    }

                    //console.log('New tab opened successfully');

                });
            }
        });

        port.onDisconnect.addListener(() => {
            //console.log('Port disconnected.');
        });
    }
});



// Background Script: Listening for connections and messages
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "TabId") {
        port.onMessage.addListener(async (request,sender) => {
            if (request.action === "getActiveTabId") {
                // No need for chrome.tabs.query; we can respond via the same port
                const tabId = port.sender.tab ? port.sender.tab.id : null; // Use sender's tab ID directly
                port.postMessage({ tabId: tabId });
            }
        });
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "data") {
        port.onMessage.addListener(async (request, sender) => {
            const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;
               
            if (request.action === "storeData") {
                try {
                    const result = await addProducts(request.data, request.name);  // Ensure addProducts is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status });
                    } else {
                        //console.error("Error: addProducts returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in addProducts result' });
                    }
                } catch (error) {
                    //console.error("storeData action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            } else if (request.action === "delete") {
                try {
                    const result = await deleteAllRecords(request.storename);  // Ensure deleteStore is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status });
                    } else {
                        //console.error("Error: deleteStore returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in deleteStore result' });
                    }
                } catch (error) {
                    //console.error("delete action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            } else {
                //console.warn("Unknown action received:", request.action);
                port.postMessage({ status: 'failed', message: 'Unknown action' });
            }
        });
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "dataChannel") {
        port.onMessage.addListener(async (request, sender) => {
            const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;

            if (request.action === "storeData") {
                try {
                    const result = await addProducts(request.data, request.name);  // Ensure addProducts is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status });
                    } else {
                        //console.error("Error: addProducts returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in addProducts result' });
                    }
                } catch (error) {
                    //console.error("storeData action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            } else if (request.action === "delete") {
                try {
                    const result = await deleteAllRecords(request.storename);  // Ensure deleteStore is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status });
                    } else {
                        //console.error("Error: deleteStore returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in deleteStore result' });
                    }
                } catch (error) {
                    //console.error("delete action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            } else {
                //console.warn("Unknown action received:", request.action);
                port.postMessage({ status: 'failed', message: 'Unknown action' });
            }
        });
    }
});

// Listen for messages from content.js
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "retreive") {
        port.onMessage.addListener(async (request, sender) => {
			
			const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;
			
            if (request.action === "retreiveData") {
                try {
                    const result = await retrieveData(request.asin, request.name); 
                    port.postMessage({ status: result.status, message: result.data });
                } catch (error) {
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }else if (request.action === "storesInfo") {
                try {
                    const result = await getProductStoresInfo(); 
                    port.postMessage({ status: 'success', message: result });
                } catch (error) {
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }
						
        });
    }
});


chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "saveSettings") {
        port.onMessage.addListener(async (request, sender) => {
            const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;

            if (request.action === "saveSettings") {
                try {
                    const result = await saveSettings(request.data);  // Ensure addProducts is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status });
                    } else {
                        //console.error("Error: addProducts returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in addProducts result' });
                    }
                } catch (error) {
                    //console.error("storeData action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }
        });
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'closeAndOpen') {
        // Ensure `u` is a string and valid
        if (typeof message.u !== 'string' || message.u.trim() === '') {
            //console.error('Invalid URL provided:', message.u);
            return;
        }

        // Query the current tab and check if it is incognito
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const isIncognito = currentTab?.incognito;

            // Open the new tab in the same mode as the current tab
            chrome.tabs.create({ url: message.u, incognito: isIncognito });
        });
    }
});



// Listen for messages from content.js
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "retrieveSettings") {
        port.onMessage.addListener(async (request, sender) => {
			
			const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;
			
            if (request.action === "retrieveSettings") {
                try {
                    const result = await getSettings(); 
                    port.postMessage({ status: result.status, message: result.data });
                } catch (error) {
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }					
        });
    }
});

// Listen for messages from content.js
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "retreiveChannel") {
        port.onMessage.addListener(async (request, sender) => {
			
			const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;
			
            if (request.action === "retreiveData") {
                try {
                    const result = await retrieveData(request.asin, request.name); 
                    port.postMessage({ status: result.status, message: result.data });
                } catch (error) {
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }else if (request.action === "storesInfo") {
                try {
                    const result = await getProductStoresInfo(); 
                    port.postMessage({ status: 'success', message: result });
                } catch (error) {
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }
						
        });
    }
});


///////////////////////////////////////////////////////////////////////////////////
// Setup store names when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  const storeNames = [
	"Settings",    
	"Serialkey",
    "Products_US_T-Shirts",
    "Products_US_Tank-Tops",
    "Products_US_V-Necks",
    "Products_US_Sweetshirts",
    "Products_US_Hoodies",
    "Products_US_Tumblers",
    "Products_US_Throw_Pillows",
    "Products_DE_T-Shirts",
    "Products_DE_Tank-Tops",
    "Products_DE_V-Necks",
    "Products_DE_Hoodies",
    "Products_UK_T-Shirts",
    "Products_UK_Tank-Tops",
    "Products_UK_V-Necks",
    "Products_UK_Hoodies",
    "Products_ES_T-Shirts",
    "Products_ES_Tank-Tops",
    "Products_ES_V-Necks",
    "Products_ES_Hoodies",
    "Products_FR_T-Shirts",
    "Products_FR_Tank-Tops",
    "Products_FR_V-Necks",
    "Products_FR_Hoodies",
    "Products_IT_T-Shirts",
    "Products_IT_Tank-Tops",
    "Products_IT_V-Necks",
    "Products_IT_Hoodies",
    "UI_Settings"
  ];
  
  initializeStores("UserDataDB", storeNames); // Create stores only once
});

const dbName = "UserDataDB";

// Function to initialize object stores on extension installation
const initializeStores = (dbName, storeNames) => {
  const request = indexedDB.open(dbName, 2); // Open database with version 1

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    storeNames.forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        const objectStore = db.createObjectStore(storeName, { keyPath: "asin" });
        objectStore.createIndex("asin", "asin", { unique: true });
        //console.log(`Object store "${storeName}" created successfully.`);
      }
    });
  };

  request.onerror = (event) => {
    //console.error(`Error initializing stores: ${event.target.errorCode}`);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    db.close(); // Close after setup
  };
};

// Function to open the database for storing products without triggering onupgradeneeded
const openDB = async (dbName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName); // Open database without specifying version

    request.onerror = (event) => {
      reject(`Error opening database: ${event.target.errorCode}`);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  });
};



async function saveSettings(settings) {
  try {
    const db = await openDB(dbName);
    const transaction = db.transaction("Settings", "readwrite");
    const objectStore = transaction.objectStore("Settings");

    return new Promise((resolve, reject) => {
      const addRequest = objectStore.put(settings);

      addRequest.onsuccess = () => {
        resolve({ status: "success" });
      };

      addRequest.onerror = (event) => {
        //console.error(`Error inserting data: ${event.target.error}`);
        reject(new Error(`Insert failed: ${event.target.error}`));
      };
    });
  } catch (error) {
    //console.error("Error in saveSettings:", error);
    throw error; // Propagate error
  }
}


async function getSettings() {
  try {
    const db = await openDB(dbName);
    const transaction = db.transaction("Settings", "readonly");
    const objectStore = transaction.objectStore("Settings");

    return new Promise((resolve, reject) => {
      const request = objectStore.get("resumeState"); // Retrieve by ASIN

      request.onsuccess = (event) => {
        if (event.target.result) {
          resolve({ status: "success", data: event.target.result });
        } else {
          resolve({ status: "noRecords" }); // No record found
        }
      };

      request.onerror = () => {
        reject(new Error(`Error retrieving data: ${request.error}`));
      };
    });
  } catch (error) {
    //console.error("Error in getSettings:", error);
    throw error;
  }
}


async function addProducts(data, storeName) {
    const db = await openDB(dbName); // Pass both database and store name
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    
    try {
        const promises = data.map((n) => {
            return new Promise((resolve, reject) => {
                const getRequest = objectStore.get(n.asin);
                
                getRequest.onsuccess = () => {
						if (getRequest.result) {	
							//console.log(`Data with key ${n.asin} already exists. Skipping insertion.`);
						}
						
                        const addRequest = objectStore.put(n);
                        
                        addRequest.onsuccess = () => {
                            //console.log("Data inserted successfully!");
                            resolve({ status: 'success' });
                        };
                        
                        addRequest.onerror = (event) => {
                            //console.error(`Error inserting data: ${event.target.error}`);
                            reject({ status: 'failed' });
                        };
                    
                };

                getRequest.onerror = (event) => {
                    //console.error(`Error checking existence of data: ${event.target.error}`);
                    reject({ status: 'failed' });
                };
            });
        });

        await Promise.all(promises);
        return { status: 'success' };
        
    } catch (e) {
        //console.error("Error during addProducts:", e);
        return { status: 'failed', error: e.message };
    }
}

///////////////////////////////////////////////////////////////////////////////////////////

// Retrieve data from IndexedDB
function retrieveData(asin,name) {
  return new Promise(async (resolve, reject) => {
  
    const db = await openDB(dbName);
    const transaction = db.transaction([name], 'readonly');
    const objectStore = transaction.objectStore(name);
	
    const countRequest = objectStore.count();

    countRequest.onsuccess = () => {
		if(!countRequest.result || countRequest.result === 0){
			resolve({ status: 'noRecords' });				
		}
                        
    };
	
    if (asin) {
      const request = objectStore.get(asin); // Retrieve by ASIN

      request.onsuccess = function(event) {
      if (event.target.result) {
          resolve({status :'success', data: event.target.result}); // Return the specific record
        } else {
          resolve(null); // No record found
        }
      };

      request.onerror = function() {
        reject('Error retrieving data: ' + request.error);
      };
    } else {
      // If no ASIN provided, retrieve all data
      const request = objectStore.getAll();

      request.onsuccess = function(event) {
        resolve({status :'success', data: event.target.result}); // Return all records
      };

      request.onerror = function() {
        reject('Error retrieving all data: ' + request.error);
      };
    }
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getProductStoresInfo() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
		
        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeNames = Array.from(db.objectStoreNames).filter(storeName =>
                storeName.includes('Product')  // Filter stores containing "Product"
            );
            const storeInfo = [];

            // Create promises to count records in each filtered store
            const countPromises = storeNames.map(storeName => {
                return new Promise((resolveCount, rejectCount) => {
                    const transaction = db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const countRequest = store.count();

                    countRequest.onsuccess = () => {
                        storeInfo.push({ storeName, recordCount: countRequest.result });
                        resolveCount();
                    };

                    countRequest.onerror = () => {
                        rejectCount(`Error counting records in store: ${storeName}`);
                    };
                });
            });

            // Wait for all count promises to complete
            Promise.all(countPromises)
                .then(() => {
                    db.close();
                    resolve(storeInfo);  // Resolve with list of filtered store names and record counts
                })
                .catch(reject);  // Reject if any count fails
        };

        request.onerror = (event) => {
            reject(`Error opening database: ${event.target.errorCode}`);
        };
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to delete all records from a specified object store
async function deleteAllRecords(storeName) {
  return new Promise(async (resolve, reject) => {
    const db = await openDB(dbName);  // Open the database
    const transaction = db.transaction([storeName], 'readwrite');  // Open the transaction in readwrite mode
    const objectStore = transaction.objectStore(storeName);  // Get the object store

    const countRequest = objectStore.count();

    countRequest.onsuccess = () => {
		if(!countRequest.result || countRequest.result === 0){
			resolve({ status: 'noRecords' });				
		}
                        
    };

    const request = objectStore.clear();  // Clear all records in the store

    request.onsuccess = () => {
      //console.log(`All records deleted from store: ${storeName}`);
      resolve({ status: 'success' });  // Return success
    };

    request.onerror = (event) => {
      //console.error(`Error deleting records from store ${storeName}: ${event.target.error}`);
      reject({ status: 'failed', message: event.target.error });  // Return failure
    };
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

//////////////////////////////////////////////////////////////////////////////




chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "UI") {
        port.onMessage.addListener(async (request, sender) => {
            const { tabId } = request;
            const senderTabId = sender.tab ? sender.tab.id : null;

            if (request.action === "saveUI") {
                try {
                    const result = await saveUI(request.data);  // Ensure addProducts is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status });
                    } else {
                        //console.error("Error: addProducts returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in addProducts result' });
                    }
                } catch (error) {
                    //console.error("storeData action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }else if (request.action === "getUI") {
                try {
                    const result = await getUI();  // Ensure addProducts is defined correctly
                    if (result && result.status) {
                        port.postMessage({ status: result.status, message : result.data });
                    } else {
                        //console.error("Error: addProducts returned an undefined or invalid status");
                        port.postMessage({ status: 'failed', message: 'Undefined status in addProducts result' });
                    }
                } catch (error) {
                    //console.error("storeData action failed:", error.message);
                    port.postMessage({ status: 'failed', message: error.message });
                }
            }
        });
    }
});


async function saveUI(settings) {
    try {
      const db = await openDB(dbName);
      const transaction = db.transaction("UI_Settings", "readwrite");
      const objectStore = transaction.objectStore("UI_Settings");
  
      return new Promise((resolve, reject) => {
        const addRequest = objectStore.put(settings);
  
        addRequest.onsuccess = () => {
          resolve({ status: "success" });
        };
  
        addRequest.onerror = (event) => {
          //console.error(`Error inserting data: ${event.target.error}`);
          reject(new Error(`Insert failed: ${event.target.error}`));
        };
      });
    } catch (error) {
      //console.error("Error in saveSettings:", error);
      throw error; // Propagate error
    }
  }
  
  
  async function getUI() {
    try {
      const db = await openDB(dbName);
      const transaction = db.transaction("UI_Settings", "readonly");
      const objectStore = transaction.objectStore("UI_Settings");
  
      return new Promise((resolve, reject) => {
        const request = objectStore.get("state"); // Retrieve by ASIN
  
        request.onsuccess = (event) => {
          if (event.target.result) {
            resolve({ status: "success", data: event.target.result });
          } else {
            resolve({ status: "noRecords" }); // No record found
          }
        };
  
        request.onerror = () => {
          reject(new Error(`Error retrieving data: ${request.error}`));
        };
      });
    } catch (error) {
      //console.error("Error in getSettings:", error);
      throw error;
    }
  }
  