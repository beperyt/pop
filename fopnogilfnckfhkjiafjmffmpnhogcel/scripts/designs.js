window.addEventListener('load', function() {
    
	createUI();
    setUp();
	
});

document.addEventListener('click', function(event) {
    // To prevent default actions
	
    let className = event.target.className;
    let idName = event.target.id;

	switch (idName || className) {
	  case 'filterBtn':
		filterData();
		break;
	  case 'exportBtn':
		exportData();
		break;
	case 'clearBtn':
		clearFilter();
		break;
	  case 'importBtn':
	    getStoresName(0);
		break;
	  case 'deleteBtn':
		getStoresName(1);;
		break;		
	  case 'show':
	  case 'arrow':
	    showBox();
		break;
	  default:
		return ;
	}	
	
});

let started = false;
let showbox = false;
let filteredProducts = [];
let retrievedProducts = [];

async function setUp() {
    await getStoresName(0);
	await delay(5000);
    await setScrollContainerHeight();
    // Ensure there are products before setting up virtual list
    if (retrievedProducts.length > 0) {
        setVirtualListHeight();
        updateVisibleCards();
    }
	setEventCsv();
}

const cardWidth = 200; // Width of each card including padding/margin
const cardHeight = 360; // Height of each card including padding/margin
const gap = 10; // Gap between cards
const buffer = 5; // Buffer for loading extra cards outside the visible area

const container = document.getElementById('scroll-container');
const virtualList = document.getElementById('virtual-list');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
	  
async function setScrollContainerHeight() {
    const scrollContainer = document.getElementById('scroll-container');
	const divs = document.querySelector('.easy-merch-research-main');
    if (scrollContainer) {
        scrollContainer.style.height = window.innerHeight + 'px';
    }
	
	if (divs) {
        divs.style.height = window.innerHeight + 'px';
    }
}

function calculateColumns() {
    return Math.floor(container.clientWidth / (cardWidth + gap)); // Dynamically calculate columns
}

// Set the virtual list height to simulate all items in the scrollable area
function setVirtualListHeight() {
    const columns = calculateColumns();
    const totalRows = Math.ceil((filteredProducts.length > 0 ? filteredProducts.length :retrievedProducts.length) / columns);
    virtualList.style.height = `${totalRows * (cardHeight + gap)}px`;
}

// Function to create a card element with dynamic content
function createCard(index) {
	
try{
    const isAll = filteredProducts.length === 0;
    const data = isAll ? retrievedProducts : filteredProducts;
	
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-index', index);
	
	let answer = null;
	
    if (data) {
        // Check if we have valid product data
			if (data[index]){
				var e = index + 1;
				card.innerHTML = `
					<a href="${data[index].ahref || '#'}" target="_blank">
					<div class="img_container">
							<img src="${data[index].img || ''}" alt="${data[index].title}"/>
					</div>
					</a>
					<div class="details_container">
						<p>Published:<b class="date"> ${shortDate(data[index].date) || 'N/A'}</b></p>
						<p>Rank(BSR):<b class="bsr">${cleanBsr(data[index].bsr) || 'N/A'}</b></p>
						<p>Price:<b>${extractCurrencyPrice(data[index].price)|| 'N/A'}</b></p>
						<p>Asin:<b>${data[index].asin || 'N/A'}</b></p>
						<p style="color: #ddd; text-transform: uppercase; font-style: italic; font-size: 15px; padding-top: 5px;"> ${'#' + e}</p>
					</div>
				`;
				answer = true;
			} else {
				answer = false;
			}	
	}
    
    return {card: card, answer: answer};
	
}catch(e){
	////console.error('Creating Cards failed :',e);
}

}

// Function to update the visible range of cards
function updateVisibleCards() {
try{

    const scrollTop = container.scrollTop;
    const columns = calculateColumns();
    const visibleStartIndex = Math.max(0, Math.floor(scrollTop / (cardHeight + gap)) * columns - buffer * columns);
    const visibleEndIndex = Math.min((filteredProducts.length > 0 ? filteredProducts.length :retrievedProducts.length), visibleStartIndex + (Math.ceil(container.clientHeight / (cardHeight + gap)) + buffer * 2) * columns);

    // Clear old cards
    while (virtualList.firstChild) {
        virtualList.removeChild(virtualList.firstChild);
    }

    // Add new visible cards
    for (let i = visibleStartIndex; i < visibleEndIndex; i++) {
			const card = createCard(i);
			if(card.answer || card.answer === true){
				// Calculate row and column positions
				const row = Math.floor(i / columns);
				const col = i % columns;

				// Set position for each card
				card.card.style.top = `${row * (cardHeight + gap)}px`;
				card.card.style.left = `${col * (cardWidth + gap)}px`;

				virtualList.appendChild(card.card);	
			}
    }

}catch(e){
	////console.error('Updatting Visible Cards failed :',e);
}

}

// Update visible cards on scroll
container.addEventListener('scroll', updateVisibleCards);

// Re-render on resize to adapt to container width changes
window.addEventListener('resize', () => {
    setVirtualListHeight();
    updateVisibleCards();
});

// Content Script: Function to request the sender tab ID from the background script
async function requestTabId() {
try{

    return new Promise((resolve) => {
        const port = chrome.runtime.connect({ name: "TabId" });
        
        // Send request for tab ID
        port.postMessage({ action: "getActiveTabId" });

        // Listen for response on this port
        port.onMessage.addListener((response) => {
            if (response && response.tabId !== undefined) {
                resolve(response.tabId);
            } else {
                ////console.error("Failed to retrieve tab ID");
                resolve(null);
            }
            port.disconnect(); // Disconnect after receiving response
        });

        // Handle disconnection errors
        port.onDisconnect.addListener(() => {
            if (chrome.runtime.lastError) {
                ////console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
            } else {
                ////console.log("Port disconnected successfully.");
            }
        });
    });
	
}catch(e){
	//console.error('Getting Tab ID failed :',e);
}	

}

// Function to retrieve data from the background script
async function getStoresName(n) {
try{

						const tabId = await requestTabId(); // Request tab ID
						
						if(tabId){
							
							// Establish a long-lived connection with the background script
							const port = chrome.runtime.connect({ name: "retreiveChannel" });
							
							// Send `tabId` with data
							port.postMessage({ action: "storesInfo", tabId });

							// Listen for messages from the background script on this port
							port.onMessage.addListener((response) => {
								if (response.status === 'success') {
									createStoreInfoModal(response.message,n);
								} else {
									showAlert(
									'warning',
									'Error', 
									'failed To Get Stored Products!'
									);
									
								}

								// Optionally disconnect the port after receiving the response
								port.disconnect();
							});

							// Handle any errors during message transmission
							port.onDisconnect.addListener(() => {
								if (chrome.runtime.lastError) {
									//console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
								} else {
									//console.log("Port disconnected successfully.");
								}
							});
						}
	
}catch(e){
	//console.error('Getting Stores Name failed !',e);
}
				
}

// Function to retrieve data from the background script
async function retreiveAll(storeName,stn,rg) {
try{
	
if(storeName === null){
	showAlert('warning', 'Something went wrong.', 'try again!');
	return;
}
		// Example of how to use the showAlert function with a callback
showAlert('confirm', `Import ${stn}?`, `You're about to import all ${stn} from ${rg} market.`, async function(result) {
			if (result) {
				const tabId = await requestTabId(); // Request tab ID
						
						if(tabId){
							
							// Establish a long-lived connection with the background script
							const port = chrome.runtime.connect({ name: "retreive" });
							
							// Send `tabId` with data
							port.postMessage({ action: "retreiveData", asin: null, name: storeName, tabId });

							// Listen for messages from the background script on this port
							port.onMessage.addListener((response) => {
								if (response.status === 'success') {
									
									closeModal();
									showAlert('success','Great!',response.message.length+` ${stn} successfully imported!`);
									
									retrievedProducts = response.message;
									filteredProducts = [];
									retrievedProducts.reverse();

									// Re-render the virtual list after data retrieval
									setVirtualListHeight();
									updateVisibleCards();
									started = true;
								} else if(response.status === 'noRecords'){
									showAlert('warning','Error',`No ${stn} found in ${rg} market!`);
								}else{
									showAlert(
									'warning',
									'Error', 
									`Failed to import ${stn} from ${rg}!`
									);
									
								}

								// Optionally disconnect the port after receiving the response
								port.disconnect();
							});

							// Handle any errors during message transmission
							port.onDisconnect.addListener(() => {
								if (chrome.runtime.lastError) {
									//console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
								} else {
									//console.log("Port disconnected successfully.");
								}
							});
						}
			}
		});
		
			
}catch(e){
	//console.error('Retriveing data failed !',e);
}		

}

// Function to store data using the retrieved tab ID
async function deleteStore(storeName,stn,rg) {
    try {
		
		if(storeName === null){
			showAlert('warning', 'Something went wrong.', 'try again!');
			return;
		}
		
		// Example of how to use the showAlert function with a callback
		showAlert('confirm', `Delete ${stn}?`,`All ${stn} In ${rg} Market Will Be Deleted.`, async function(result) {
		if (result) {
			const tabId = await requestTabId(); // Request tab ID

				if (tabId) {
					const port = chrome.runtime.connect({ name: "data" });
					
					// Send `tabId` with data
					port.postMessage({ action: "delete", storename: storeName, tabId });

					// Listen for messages from the background script on this port
					port.onMessage.addListener((response) => {
						if (response.status === 'success') {
							closeModal();
							showAlert('success','Great!',`${stn} successfully deleted.` );
						} else if(response.status === 'noRecords'){
							showAlert('warning','Error!',`No ${stn} In ${rg} Market to delete.` );
						} else{
							showAlert('warning','Error!',`Failed to delete ${stn}.` );
						}
						port.disconnect();
					});

					// Handle any errors during message transmission
					port.onDisconnect.addListener(() => {
						if (chrome.runtime.lastError) {
							//console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
						} else {
							//console.log("Port disconnected successfully.");
						}
					});
				}	
			} 
		});			
    } catch (error) {
        //console.error("Error in storeArray function!", error);
    }
}

// Function to create and show the modal with store info
function createStoreInfoModal(storeInfo,n) {
try{
    if (!storeInfo || !Array.isArray(storeInfo)) return; // Check if storeInfo is valid

    // Create the modal container
    const modal = document.createElement('div');
    modal.id = 'storeInfoModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';

    // Close modal on Escape key press
    const closeModal = () => document.body.removeChild(modal);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });

    // Create the modal content box
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#f9f9f9';
    modalContent.style.padding = '20px 20px 20px 50px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '720px';
	modalContent.style.minWidth = '450px';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflowY = 'auto';
    modalContent.style.position = 'relative';

    // Close button
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '1.5em';
    closeButton.onclick = closeModal;
    modalContent.appendChild(closeButton);

    // Title
    const title = document.createElement('h2');
    title.style.marginBottom = '20px';
    title.textContent = storeInfo.length === 0 ? 'No Products Found!' : 'Select Products';
    modalContent.appendChild(title);

    // Container for store information
    const storeInfoContainer = document.createElement('div');
    
    // Group stores by region prefix
    const groupedStores = storeInfo.reduce((groups, store) => {
        const [, region, ...rest] = store.storeName.split('_');
        const storeDisplayName = rest.join('_');
        
        if (!groups[region]) groups[region] = [];
        
        groups[region].push({
            name: storeDisplayName,
            recordCount: store.recordCount,
            fullName: store.storeName
        });
        
        return groups;
    }, {});

    // Populate modal with grouped store information
    for (const [region, stores] of Object.entries(groupedStores)) {
        const regionGroup = document.createElement('div');
        regionGroup.style = 'margin: 10px;width: 180px;float: left;';

        // Add a title for the region (like 'US' or 'EU')
        const regionTitle = document.createElement('h3');
        regionTitle.textContent = `${region} Products`;
		regionTitle.style.color = '#2196f3';
        regionGroup.appendChild(regionTitle);

        stores.forEach(store => {
            const storeItem = document.createElement('div');
            storeItem.textContent = `${store.name} (${store.recordCount} Products)`;
            storeItem.style.marginLeft = '20px';
			storeItem.style.padding = '5px';
            storeItem.style.color = 'black';
            storeItem.style.cursor = 'pointer';
			storeItem.style.borderTop = '1px solid #eee';

            // Add hover effect for better UX
            storeItem.onmouseover = () => (
				storeItem.style.backgroundColor = '#ddd'
			);
			
            storeItem.onmouseout = () => (
				storeItem.style.background = 'none'
			);

            // Add event listener to capture the clicked store's full name
            n === 0 ? storeItem.onclick = () => handleStoreRetrieve(store.fullName, store.name.replace('_',' '), region) : storeItem.onclick = () => handleStoreDelete(store.fullName, store.name.replace('_',' '), region);
            regionGroup.appendChild(storeItem);
        });

        storeInfoContainer.appendChild(regionGroup);
    }

    modalContent.appendChild(storeInfoContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);	
}catch(e){
	//console.error('Creating Store Info Modal :',e);
}	
}

function closeModal(){
	document.body.removeChild(document.querySelector('#storeInfoModal'));
}

// Function to handle store click and show the store name
function handleStoreDelete(storeName,stn,rg) {
    //console.log(`User clicked on store: ${storeName} to delete it.`); 
    deleteStore(storeName,stn,rg); // You can trigger any further logic based on the store click
}

// Function to handle store click and show the store name
function handleStoreRetrieve(storeName,stn,rg) {
    //console.log(`User clicked on store: ${storeName} to get data.`); 
    retreiveAll(storeName,stn,rg); // You can trigger any further logic based on the store click
}

function shortDate(longDate) {
    // Parse the long date
    const date = new Date(longDate);

    // Define options for the short format
    const options = { month: 'numeric', day: 'numeric', year: 'numeric' };

    // Use Intl.DateTimeFormat for formatting
    return new Intl.DateTimeFormat('en-US', options).format(date);
}


////////////////////////////////////////////////////////////////////////////////////////////////

async function exportData() {
  try {
    const isAll = filteredProducts.length === 0;
    const data = isAll ? retrievedProducts : filteredProducts;

    if (!data || data.length < 1) {
      showAlert('warning', 'Attention!', 'No Products To Export.');
      return;
    }

    showAlert('confirm', 'Export Producst?', isAll ? 'Export all products?' : 'Export filtered products?', async function (result) {
      if (!result) {
        showAlert('announce', 'Attention!', 'If you want to export only specific products, go to Extension Icon => My Designs.');
        return;
      }

      const BATCH_SIZE = 50000; // Max rows per CSV
      let csv = [];

      for (const product of data) {
        if (product.img && product.img.length > 10) {
          let row = [
            cleanString(product.title),
            cleanString(product.date),
            cleanString(product.bsr),
            cleanString(product.price),
            cleanString(product.asin),
            cleanString(product.ahref),
            cleanString(product.img)
          ];
          csv.push(row.join(","));
        }
      }

      if (csv.length > 0) {
        for (let i = 0; i < csv.length; i += BATCH_SIZE) {
          const batch = csv.slice(i, i + BATCH_SIZE);
          const csvContent = batch.join("\n");

          // Create Blob and URL for each batch
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);

          // Send a message to the background script for each batch download
          const filename = `table-data-part${Math.floor(i / BATCH_SIZE) + 1}.csv`;
          chrome.runtime.sendMessage({
            action: "downloadCSV",
            url: url,
            filename: filename
          });
        }
      } else {
        showAlert('warning', 'Attention!', 'No valid product data to export.');
      }
    });
  } catch (e) {
    //console.error(e);
  }
}


async function clearFilter() {
	try{
		
		if (!filteredProducts || filteredProducts.length < 1) {
		  showAlert('warning', 'Attention!', 'No Filtred Products To Clear!');
		  return;
		}
		
		showAlert('confirm', 'Clear Filters', '', function(result) {
			if (result) {

				filteredProducts = [];
				setVirtualListHeight();
				updateVisibleCards();

			} 
		});
	}catch(e){
		//console.error("Filter Tabe By Search Term Failed: "+e);
	}
}

async function filterData() {
	
	var j=0;
	
	try{
		
		if (!retrievedProducts || retrievedProducts.length < 1) {
		  showAlert('warning', 'Attention!', 'No Products To Filter, Import Them First!');
		  return;
		}
		
		showAlert('confirm', 'Apply Filters?', '',async function(result) {
		if (result) {
		filteredProducts = [];
		// Cleaning table 
		document.querySelector("#scroll-container #virtual-list").innerHTML="";
		
		var minDate = await customDate(document.getElementById("minDate").value || "01/01/2000", 1);
		var maxDate = await customDate(document.getElementById("maxDate").value || "12/12/2050", 1);
		var minBsr = parseFloat(document.getElementById("minBsr").value) || 0;
		var maxBsr = parseFloat(document.getElementById("maxBsr").value) || 10000000;
		var minPrice = parseFloat(document.getElementById("minfPrice").value) || 13;
		var maxPrice = parseFloat(document.getElementById("maxfPrice").value) || 55;
		var input = document.getElementById("filterTerm");
		var filter = input.value.toUpperCase();
		
		// Iterate over the table rows (start from 1 to skip header row)
		for (i= 0 ; i < retrievedProducts.length;i++) {
			try{
				var title = retrievedProducts[i].title;
				var date = await customDate(retrievedProducts[i].date.trim(), 0);
				var price = parseFloat(retrievedProducts[i].price.replace(/[^\d\.]/g, ''));
				var bsr = parseFloat(retrievedProducts[i].bsr.replace(/[^\d\.]/g, ''));
                var match = false;

				// Compare the row data with filter criteria
				if (
					(parseInt(date) >= parseInt(minDate) && parseInt(date) <= parseInt(maxDate)) &&
					title.toUpperCase().indexOf(filter) > -1 &&
					(price >= minPrice && price <= maxPrice))
				{
					if(
						(minBsr == 0 && maxBsr == 10000000)||
						((minBsr != 0 || maxBsr != 10000000) && typeof bsr === 'number' && bsr >= minBsr && bsr <= maxBsr)					
					){
						match = true;
					}			
								
				}
				
				match? await filteredProducts.push(retrievedProducts[i]) : '';
				j++;
				
				if(j == 100){
					await delay(10);
					j = 0;
				}
			}catch(ee){
				//console.log("Something went wrong when filtering "+ee);
			}
		}
		
		setVirtualListHeight();
		updateVisibleCards();
		
		showAlert('success',(filteredProducts.length > 0) ? filteredProducts.length+" products found!" : 'No Product Found!', '');

			} 
		});
		
	}catch(e){
		//console.error("Filter Table Failed: "+e);
	}
}

async function customDate(date,n){
	try{
			
		if(n == 0){
			try{
				// Create a Date object from the string
				const dateObject = new Date(date);
				// Format the date to YYYY/MM/DD
				const formattedDate = `
				${dateObject.getFullYear()}${(dateObject.getMonth() + 1).toString().padStart(2, '0')}${dateObject.getDate().toString().padStart(2, '0')}`;
				return formattedDate.replace(/[^\d\.]/g, '');
			}catch(f){
				//console.log("Invalid Date : "+date+' => '+f );
				return 0;				
			}	
		}
		
		if(n == 1){
			return date.split("/")[2]+date.split("/")[0]+date.split("/")[1];	
		}
	}catch(e){
		//console.log("Invalid input");
	}

}

async function createUI(){
	try{
	
		const container = document.createElement("div");
		container.className ="easy-merch-research-main";
		const div = document.createElement("div");
		div.setAttribute('style',"position: fixed;top: 50%; left:0; z-index: 99999999999");
		container.style.display = "none";
		
		div.innerHTML =`<div class="switch-container onOff" id="show"><i class="arrow right" id="show"></i><i class="arrow left" id="show"></i>
			</div>
					<div id="customAlert" class="modal">
    <div class="modal-content">
        <span class="close-btn">&times;</span>
        <div id="alertIcon" class="alert-icon"></div>
        <h2 id="alertTitle"></h2>
        <p id="alertMessage"></p>
        <div id="confirmButtons" class="button-group">
            <button id="confirmBtn">Confirm</button>
            <button id="cancelBtn">Cancel</button>
        </div>
    </div>
</div>`;
		container.innerHTML = `
		
		
	<div class="easy-merch-research-container">
<!-- scroll container -->
        <div class="item-container-row logo">
			<img src=''/>
		</div>
     <div class="scroller">
	
	<!--- Filter Panel --->
	
	 <div class="filter-panel">
        <!-- First two fields - Search Term and Hidden Keywords -->
        <div class="item-container-column">
            <input type="text" id="filterTerm" placeholder="Search term"/>
        </div>
		<div class="item-container-row">
			<div class="item-container-column">
				<label for="pR">Price range :</label>
				<div class="item-container-row" id="pR">
					<input type="number" id="minfPrice" placeholder="$13.38" min="0" required/>
					<label for="maxfPrice">-</label>
					<input type="number" id="maxfPrice" placeholder="$33+" min="0" required/>
				</div>
			</div>
			<div class="item-container-column">
				<label for="bR">Bsr range :</label>
				<div class="item-container-row" id="bR">
					<input type="number" id="minBsr" class="minBsr" placeholder="0" min="0" required/>
					<label for="maxBsr">-</label>
					<input type="number" id="maxBsr" class="maxBsr" placeholder="10000000+" min="0" required/>
				</div>
			</div>
			<div class="item-container-column">
				<label for="dR">Date range :</label>
				<div class="item-container-row" id="dR">
					<input type="datetime" id="minDate" class="minDate" placeholder="MM/DD/YYYY" min="0" required/>
					<label for="maxDate">-</label>
					<input type="datetime" id="maxDate" class="maxDate" placeholder="MM/DD/YYYY" min="0" required/>
				</div>
			</div>
		</div>
        <!-- Search Button -->
        <div class="item-container-row">
			<button id="filterBtn">Filter</button>
			<span id="exportBtn">Export Csv</span>
			<span id="importBtn">Import From Database</span>			
			<span id="clearBtn">Clear Filters</span>
            <span id="deleteBtn">Delete Database</span>			
        </div>
		 <h2 style='align-items: center;align-self: center; margin-bottom: 0px;margin-top: 40px;'>Upload CSV File</h2>
        <div class='item-container-row' style='align-items: center;align-self: center;     margin-bottom: 40px;'>
        <input accept='.csv' id='csvFile' type='file' multiple/>
        <br/>	
    </div>

	
</div>
</div>
		`;
		document.body.appendChild(div);
		document.body.appendChild(container);
		
		// Close modal when clicking the close button or outside of the modal
		document.querySelector(".close-btn").onclick = closeAlert;
		document.querySelector(".logo img").src = getImage('logo1');
	
	}catch(e){
		//console.log("Couldn't Create User Interface");
	}
}

function getImage(imageName) {
	return chrome.runtime.getURL(`assets/images/${imageName}.png`);
}

async function showBox(){ 
        var value = showbox;
		value ? setAtt(): removeAtt(); 						
};

async function setAtt(){ 
		document.body.setAttribute("style","scrollbar-width: none; overflow: hidden");
		document.querySelector(".easy-merch-research-main").style.display = "";
		showbox = false;
}

async function removeAtt(){ 
		document.body.removeAttribute('style');
		document.querySelector(".easy-merch-research-main").style.display = "none";
		showbox = true;
}

// Utility function to clean strings of special characters and invisible encoding issues
function cleanString(str) {
  return  str
    ? str.replace(/,/g, "") // Remove commas to avoid CSV format issues
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '') // Remove invisible characters
    .normalize('NFC') // Normalize string to standard form
	.trim() : null;
}

function cleanBsr(bs) {
	// Check if bs is a valid number, otherwise return 'N/A'
	if (typeof bs !== 'string' || bs.trim() === '' || isNaN(bs.trim()) || isNaN(bs) || bs === null || bs === undefined) {
		return 'N/A';
	}
	// Format the number with a '#' prefix and commas
	return "#" + Number(bs).toLocaleString();
}

// Helper function to extract the price from text, with support for multiple currencies
function extractCurrencyPrice(text) {
    try {
        const cleanedText = text.replace(/\n/g, '').trim();
        
        // Match currency symbols followed by a price, allowing for multiple currencies
        const currencyMatch = cleanedText.match(/([$€£])(\d+(\.\d{2})?)/);
        
        if (currencyMatch) {
            const currencySymbol = currencyMatch[1];
            const priceAmount = currencyMatch[2];
            return `${currencySymbol}${priceAmount}`;
        }

        // If no currency symbol is found, match plain numbers with a decimal
        const numberMatch = cleanedText.match(/(\d+(\.\d{2})?)/);
        if (numberMatch) {
            return numberMatch[0]; // Returns only the price if no currency symbol is present
        }

    } catch (e) {
        //console.log(`Error extracting price from text: ${e}`);
    }

    return null;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

function setEventCsv() {
  try {
    document.getElementById('csvFile').addEventListener('change', function(event) {
      const files = event.target.files;
      
      if (!files || files.length === 0) {
        return;
      }

      // Array to hold all products from multiple files
      let allProducts = [];

      // Function to handle file reading and merging
      const handleFile = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function(e) {
            const csvContent = e.target.result;
            const products = csvToArray(csvContent); // Parse CSV data
            resolve(products);
          };
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      };

      // Use Promise.all to wait for all files to be read
      Promise.all(Array.from(files).map(handleFile))
        .then(results => {
          results.forEach(products => allProducts.push(...products)); // Combine all products
          retrievedProducts = allProducts;
          filteredProducts = [];
		  retrievedProducts.reverse();

          // Trigger updates to display visible cards
          setVirtualListHeight();
          updateVisibleCards();
        })
        .catch(error => console.error('Reading CSV files failed!', error));
    });
  } catch (e) {
    //console.error('Setting CSV Event Failed!', e);
  }
}

function csvToArray(csvContent) {
  try {
    const rows = csvContent.trim().split('\n');

    const parseRow = (row) => {
      const values = row.split(',').map(value => value.trim());

      return {
        title: values[0] || '',
        date: values[1] || '',
        bsr: values[2] || '',
        price: values[3] || '',
        asin: values[4] || '',
        ahref: values[5] || '',
        img: values[6] || ''
      };
    };

    return rows.map(parseRow).filter(row => row !== null);
  } catch (e) {
    //console.error('Converting CSV to Array Failed!', e);
  }
}


////////////////////////////////////////////////////////////////////////

function showAlert(type, title, message, callback) {
    const modal = document.getElementById("customAlert");
    const alertTitle = document.getElementById("alertTitle");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");
    const confirmButtons = document.getElementById("confirmButtons");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    // Set alert text
    alertTitle.innerText = title;
    alertMessage.innerText = message;

    // Reset modal classes and hide confirm buttons
    modal.classList.remove("success", "warning", "confirm", "announce");
    confirmButtons.style.display = "none";

    // Set modal type-specific styles
    modal.classList.add(type);
    switch (type) {
        case "success":
            alertTitle.style.color = "#74cf31"; // Checkmark icon
            break;
        case "warning":
		    alertTitle.style.color = "#ffa500";
            alertIcon.innerHTML = "&#9888;"; // Warning icon
            break;
        case "confirm":
		    alertTitle.style.color = "rgb(0, 123, 255)";
            alertIcon.innerHTML = ""; // Question mark icon
            confirmButtons.style = "display: flex; flex-wrap: nowrap; justify-content: center;";
            break;
        case "announce":
		    alertTitle.style.color = "rgb(0, 123, 255)";
            alertIcon.innerHTML = ""; // Announcement icon
            break;
    }

    // Show modal
    modal.style.display = "flex";

    // Event listeners for buttons
    confirmBtn.onclick = () => {
        //console.log("Confirmed!");
        closeAlert();
        if (callback) callback(true);  // Call the callback with `true` for confirmation
    };

    cancelBtn.onclick = () => {
        //console.log("Cancelled!");
        closeAlert();
        if (callback) callback(false);  // Call the callback with `false` for cancellation
    };
}

// Function to close the custom alert
function closeAlert() {
    const modal = document.getElementById("customAlert");
    modal.style.display = "none";
}

// Close modal when clicking outside of the modal content
window.onclick = function(event) {
    const modal = document.getElementById("customAlert");
    if (event.target === modal) {
        closeAlert();
    }
};

async function getNeededImage(inputUrl) {
    const baseUrl = "https://m.media-amazon.com/images/I/";

    // Check if the input URL includes the base URL
    if (!inputUrl.includes(baseUrl)) {
        return { s: inputUrl, c: "#fff" }; // Default color for invalid URLs
    }

    // Extract the part after the base URL
    const urlPart = inputUrl.split(baseUrl)[1];

    if (urlPart) {
        // Split the remaining URL by the encoded "|"
        const parts = urlPart.split("%7C");

        // Find the part that ends with ".png"
        const imageFilename = parts.find((part) => part.endsWith(".png"));

        if (imageFilename) {
            // Construct the simplified URL
            const shortImage = baseUrl + imageFilename;

            // Get the center color
            const color = await loadImageAndGetColor(shortImage);
			//console.log(`URL: ${shortImage} Color: ${color}`);
            return { s: shortImage, c: color }; // Return both URL and color
        }
    }
	
    //console.log(`URL: ${inputUrl} Color: #fff`);
    // Return the original URL with a default color if processing fails
    return { s: inputUrl, c: "#fff" };
}

// Helper function to load an image and get its center color
function loadImageAndGetColor(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Avoid cross-origin issues
        img.src = url;

        img.onload = () => {
            try {
                const color = getColorFromImage(img);
                resolve(color); // Resolve with the extracted color
            } catch (error) {
                //console.error("Error extracting color:", error.message);
                resolve("#fff"); // Default color on error
            }
        };

        img.onerror = () => {
            //console.error("Error loading image:", url);
            resolve("#fff"); // Default color if image loading fails
        };
    });
}

// Function to extract color from the center of an image
function getColorFromImage(image) {
    // Create a hidden canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0);

    // Get the color at the center
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor((canvas.height / 100) * 70); // 80% height from the top
    const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;

    // Return the color
    return `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
}

