// Check if there data-asin
// Detect url change 
// Collect data-asin

let domainUrl = null;
let allProducts = [];
let fetchedAsins = [];
let lastUrl  = window.location.href;
let loadingImageSrc = null; // Global variable to store the resolved image src
let navImageSrc = null; // Global variable to store the resolved image src
let containerProducts = null ; // Product list container
let winnerProducts = null; // Product list container
let resultCheck = null;
let uiSettings = null;
let resultCounter = null;

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.119 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/12.246",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko",
];

let products = [];
let winners = [];
let filteredProduct =[];


const ITEM_HEIGHT = 260; // Height of each item
const gap = 10;          // Vertical spacing between items
let VISIBLE_ITEMS = null; // Adjust visible items calculation
let start = null;

const WINNER_ITEM_HEIGHT = 100; // Height of each item
let WINNER_VISIBLE_ITEMS = null; // Adjust visible items calculation
let WINNER_start = null;


document.addEventListener('DOMContentLoaded', async () => {

    try{
        const settings = await getUI();
        settings? uiSettings = settings : null;
        await delay(100);     
    }catch(error){}
    
});

window.addEventListener('load', function(){
    if(uiSettings && uiSettings.isEnabled){
        if(checkBrowser()){
            
                enableFeature();
        
        }else if(!checkBrowser()){
            alert("Refresh the and check out the zip code")
        }
    }	
});


async function uiSettingsCheck(){
    try{
        const settings = await getUI();
        settings? uiSettings = settings : null;
        return;    
    }catch(error){}
       
}

async function enableFeature(){
    if(!uiSettings) await uiSettingsCheck();
    let navBoolen = uiSettings.showCompetition;
    let opBoolen = uiSettings.showProductinfo;

    // Global variable for competition checker
    resultCheck = navBoolen;

    // Select the parent element where `data-asin` divs are loaded
    const targetNode = document.querySelector('.s-main-slot');

    // Observer options
    const config = { childList: true, subtree: true };

	// Callback function for when mutations are observed
    const observerCallback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const addedNodes = mutation.addedNodes;
                    addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-asin')) {
                            if(node.getAttribute('data-asin').length > 4){
                                if(opBoolen) createUIfor(node.getAttribute('data-asin'));
								updateResults();
                            }
                        }
                    });
                }
            }
    };

    // Create a MutationObserver
    const observer = new MutationObserver(observerCallback);

    // Start observing
    if (targetNode) {
        observer.observe(targetNode, config);
    } 
	
    if(opBoolen) createUI();
 
    // Optional: Run URL change check on initial page load
    if(!navBoolen) return ;
    createNavUI();  
     
}

async function checkBrowser() {
    const storedSettings = await getSettings();
    const maxRetries = 3; // Maximum number of retries
    let attempt = storedSettings? storedSettings.refresh : 0; // Start from the last saved retry count
    let value = false;

    while (!value && attempt < maxRetries) {
        try {
            const element = document.querySelector('#nav-packard-glow-loc-icon');
            // Check if the element exists and is visible
            value = element && element.offsetParent !== null;

            if (value) {
                break;
            } else {
                attempt++;
                storedSettings.refresh = attempt;
                await saveSettings(storedSettings);

                // Trigger page reload after saving the retry state
                location.reload(true);
                return; // Ensure no further execution after reload
            }
        } catch (error) {
            console.warn(`Error trying to load zipcode ${attempt + 1}`);
        }
    }

    if (!value) {
        //console.error("Check the zipcode please!");
        storedSettings.refresh = 0; // Reset retry count after failure
        await saveSettings(storedSettings);
    }

    return value;
}


////////////////////////////////// UI SECTION ////////////////////////////////////////

async function createUI(){
	try{
        await createProductDetail();     
	}catch(e){
		//console.log("Couldn't Create User Interface",e);
	}
	
}

async function createProductDetail() {
    const infoSections = document.querySelectorAll('.s-result-item.s-asin [data-cy="image-container"]');

    if (infoSections.length === 0) {
        //console.warn("No products available to create UI!");
        return;
    }

    // Ensure the loading image is fetched once
    if (!loadingImageSrc) {
        loadingImageSrc = await getImage("loading.gif");
    }

    // Product Details as an Element
    const createDetailsElement = () => {
        const detailsContainer = document.createElement("div");
        detailsContainer.classList.add("emr_details_container");
        detailsContainer.innerHTML = `
            <p>Published:<b class="date"><img src='${loadingImageSrc}'/></b></p>
            <p>Rank(BSR):<b class="bsr"><img src='${loadingImageSrc}'/></b></p>
            <p>Asin:<b class="asin"><img src='${loadingImageSrc}'/></b></p>
        `;
        return detailsContainer;
    };

    // Insert the "details" element in each infoSection
    infoSections.forEach(info => {
        const detailsElement = createDetailsElement();
        info.parentElement.insertBefore(detailsElement, info);
    });

    await delay(500);

    setTimeout(() => {
        getProductData(); // Run after X seconds
    }, resultCheck? 1000 : 100); 
    
}

async function createNavUI() {

    const searchResultsElement = document.querySelector('[data-component-type="s-search-results"]');

    if (!searchResultsElement) {
        return;
    }

    const navParent = searchResultsElement.parentElement;
    const navContainer = document.createElement("div");
    navContainer.classList.add('emr', 'item-container-row');

    // Fetch images once
    if (!loadingImageSrc) loadingImageSrc = await getImage("loading.gif");
    if (!navImageSrc) navImageSrc = await getImage("navbar_logo.png");

    // Function to create button element
    const loadMultiPages = () => {
        const button = document.createElement('button');
        button.classList.add('multiloader');
        button.textContent = "Load More"; // Add button text
        return button.outerHTML; // Return HTML string for injection
    };


    // Set innerHTML with dynamic content
    navContainer.innerHTML = `
        <img class="navLogo" src="${navImageSrc}" alt="Nav Logo"/>
        <p class="msg">
            Products: <b class="resultProduct"><img src="${loadingImageSrc}" alt="Loading..."/></b>
        </p>
        ${loadMultiPages()}
        <button class="winner">Winners</button>
        <p class="instruction" style="color:#46b8df">
            <i>Contact Us if there's an issue!</i>
            <i class="fas fa-question-circle" aria-hidden="true"></i>
        </p>
    `;

    navParent.prepend(navContainer);
    document.querySelector('.emr.item-container-row .multiloader').addEventListener('click',runLoader);
    document.querySelector('.emr.item-container-row .winner').addEventListener('click', runWinner);

    CheckCompetion(); // Call your custom function
}

async function createUIfor(data_asin){
        
        const elemet = document.querySelector(`.s-result-item.s-asin[data-asin="${data_asin}"]`);

        if(elemet.querySelector('.emr_details_container')) return ;

        // Ensure the loading image is fetched once
        if (!loadingImageSrc) {
            loadingImageSrc = await getImage("loading.gif");
        }

        // Product Details as an Element
        const createDetailsElement = () => {
            const detailsContainer = document.createElement("div");
            detailsContainer.classList.add("emr_details_container");
            detailsContainer.innerHTML = `
                <p>Published:<b class="date"><img src='${loadingImageSrc}'/></b></p>
                <p>Rank(BSR):<b class="bsr"><img src='${loadingImageSrc}'/></b></p>
                <p>Asin:<b class="asin"><img src='${loadingImageSrc}'/></b></p>
            `;
            return detailsContainer;
        };


        const image = elemet.querySelector('[data-cy="image-container"]');

        image.parentElement.insertBefore(createDetailsElement(), image);

        for (const product of allProducts) {
            if (product.asin === data_asin) {
                const item = document.querySelector(`.s-result-item.s-asin[data-asin="${data_asin}"]`);
                if (data_asin.length > 4) {
                    item.querySelector('.emr_details_container .date').textContent = formatShortDate(product.date);
                    item.querySelector('.emr_details_container .bsr').textContent = cleanBsr(product.bsr);
                     item.querySelector('.emr_details_container .asin').textContent = product.asin;
                    return; // Exits the entire function here
                }
            }
        }
        

        getProductDataFor(data_asin);

}

///////////////////////////////// GETTING PRODUCTS DETAILS SECTION 1st PAGE ////////////////////

async function getProductDataFor(data_asin){


    let dataHTMLs  = await fetchAndCleanContent(data_asin, 0);

    if(!dataHTMLs || dataHTMLs === 'undefined' ) return;

    processProductDetails(dataHTMLs, data_asin);

    // Clean up remaining variables
    dataHTMLs = null;

    return;
		
}

async function getProductData() {
    try {
        let asins = await colectAsins();

        await delay(1000);
 
        await productsHTML(asins);
    

    } catch (error) {
        //console.error("Error fetching product data:", error);
    }
}


async function colectAsins() {
    const asinSet = new Set();
    document.querySelectorAll(".s-result-item.s-asin").forEach(item => {
        const asin = item.getAttribute("data-asin");
        if (asin && asin.length > 4 ) {
            asinSet.add(asin);
        }
    });
    return Array.from(asinSet);
}

async function productsHTML(asinsArray) {
    for (const asin of asinsArray) {
        getProductDataFor(asin);
    }
}


////////////////////////////////////////////////////////////////////////////////


async function processProductDetails(data, data_asin) {
    try {
        let doc = parseHtml(data);
        let product = extractProductInfo(doc, data_asin);

        const items = document.querySelectorAll(`.s-result-item.s-asin[data-asin="${data_asin}"]`);
        if (items.length > 0 && data_asin.length > 4) {
            items.forEach(item => {
                const detailsContainer = item.querySelector('.emr_details_container');
                if (detailsContainer) {
                    detailsContainer.querySelector('.date').textContent = formatShortDate(product.date);
                    detailsContainer.querySelector('.bsr').textContent = cleanBsr(product.bsr);
                    detailsContainer.querySelector('.asin').textContent = product.asin;
                }
            });
            allProducts.push(product);
        }
        doc = product = null; // Clear references explicitly
        await delay(20);
    } catch (error) {
        //console.error("Error processing product details", error);
    } 
    
    doc = null; // Clear references explicitly
}


// Extract product information from the document
function safeValue(value, defaultValue = 'N/A') {
    return (value && value !== null) ? value : defaultValue;
}

function extractProductInfo(doc, asin) {
    try {
        let urlProduct = `${domainUrl}dp/${asin}`;

        // Ensure the URL starts with "https://" or "http://"
        if (!/^https?:\/\//i.test(urlProduct)) {
            urlProduct = `https://${urlProduct}`;
        }

        // Extract product details
        let title = safeValue(extractTitle(doc));
        let src = safeValue(extractSrc(doc));
        let date = safeValue(extractDetailText(doc, "Date"));
        let bestSellers = safeValue(extractDetailText(doc, "Best Sellers"));
        let cleanedAsin = safeValue(cleanString(asin));
        let price = safeValue(extractPrice(doc));
        let manufacturer = safeValue(extractDetailText(doc, "Manufacturer"));

        // Creating the Product object
        let product = new Product(
            title,
            urlProduct,
            src,
            date,
            bestSellers,
            cleanedAsin,
            price,
            manufacturer,
            'N/A'
        );

        // Explicitly nullify variables to avoid memory accumulation
        title = null;
        src = null;
        date = null;
        bestSellers = null;
        cleanedAsin = null;
        price = null;
        manufacturer = null;

        return product;
    } catch (error) {
        // Optionally log the error or handle it in another way
        console.error("Error extracting product info.", error);
    }

    return null;
}


// Check competition for item 
async function extractCompetition(title){

        if(!title) return null;
    
        let urlbase = `${domainUrl}/s?k=${encodeURIComponent(title).replace(/%20/g, '+')}`;

        // Ensure the URL starts with "https://" or "http://"
        if (!/^https?:\/\//i.test(urlbase)) {
            urlbase = `https://${urlbase}`;
        }

        // Fetch the data from the modified URL
        const initialResult = await fetchAndCompetition(urlbase, 1);

    
        if (initialResult && initialResult.totalResultCount) {
            // Process the totalResultCount and clean it
            if (isNaN(initialResult.totalResultCount)) return null;

            return initialResult.totalResultCount;
        }
    
        return null;

}

// Helper function to extract the product title based on specific keywords
function extractTitle(doc) {
	
	const keywords = ["Camiseta","shirt","Sleeve","T-shirt", "Maglietta", "hoodie","Sweat à Capuche", "Sudadera con Capucha", "Felpa con Cappuccio","Débardeur","Camiseta sin Mangas", "tanktop","tank top", "tank-top", "Canotta", "Throw Pillow","Camiseta Cuello V","V-Neck","V-Ausschnitt","T-Shirt avec Col en V", "Maglietta con Collo a V","Sweatshirt","Tumbler"]; // Customize as needed
	
    try {
		
		const full_title = doc.title;
        const titleParts = doc.title?.split(":");
		      
        // Check each part of the title for a keyword match
        for (const part of titleParts) {
            for (const keyword of keywords) {
                if (part.toLowerCase().includes(keyword.toLowerCase())) {
					if(part.toLowerCase().includes('amazon.') && part.toLowerCase().includes('|')){
						const ps = part.split('|');
						for(const p of ps){
							if(p.toLowerCase().includes(keyword.toLowerCase())){
								return p.trim().replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, ''); 
							}
						}
					}
                    return part.trim().replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '');  // Return the matching part if found
                }
            }
        }
		
        doc = null;
		
        // If no keyword matches, return the first part or the entire title as fallback
        return titleParts[0].trim();
    } catch (error) {
       // console.error("Error extracting title.",error);
    }
	return null;
}

function extractSrc(doc){
	try{
		return doc.querySelector("#imgTagWrapperId img")?.getAttribute("source").trim().replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '') || null;
	}catch(e){
		//console.error('No image found for product check the zip code!');
	}
	return null;
}

// Extract detail text based on keyword
function extractDetailText(doc, keyword) {
    try {
		
		let value = null;
		const title = doc.title;
        const detailBullets = doc.querySelector("#detailBulletsWrapper_feature_div");
		const prodDetTable = doc.querySelector(".prodDetTable");

		if(isBook(title) && keyword === 'Date') keyword = 'Publisher';

        if (detailBullets){

			const details = detailBullets.querySelectorAll("ul li");

			// Use 'for...of' loop to break when the keyword is found
			for (const item of details) {
				const text = item.innerText.trim();

				if (text.toLowerCase().includes(keyword.toLowerCase())) { // Case insensitive match
					// Extract relevant text based on keyword
					const extractedText = text.split(":")[1]?.trim();  // Safe split to avoid error

					if (extractedText) {
						if (keyword === 'Date' || keyword === 'Publisher') {
							value = extractedText?.replace(/,/g, "").trim(); 
						}else if (keyword === 'Manufacturer') {
							value = extractedText?.replace(/,/g, "").trim(); 
						} else if (keyword === 'Best Sellers') {
							value = extractedText?.split(" ")[0].replace(/[^\d.]/g, '').trim();
						}
					}

					break; // Exit loop once a match is found 
				}
			}
			
		}else if(prodDetTable ){

			const details = doc.querySelectorAll(".prodDetTable tbody tr");

			// Use 'for...of' loop to break when the keyword is found
			for (const item of details) {
				
				const text = item.innerText.trim();

				if (text.toLowerCase().includes(keyword.toLowerCase())) { // Case insensitive match
					// Extract relevant text based on keyword
					const extractedText = item.querySelector('td')?.innerText.trim();  // Safe split to avoid error

					if (extractedText) {
						if (keyword === 'Date') {
							value = extractedText?.trim().replace(/,/g, "").replace(/\s+/g, ' ').trim();
						} else if (keyword === 'Best Sellers') {
							value = extractedText?.split(" ")[0].replace(/[^\d.]/g, '').trim();
						}
					}

					break; // Exit loop once a match is found
				}
			}			
		}
		
		doc = null;
		value = keyword ==='Publisher'? booksDate(value):value;
        return value? cleanString(value): null;
        
    } catch (e) {
       //console.error("Error extractting details!",e);
    }

    return null;
}
function isBook(title){

     if(!title.toLowerCase().includes('books')) return false;

     const keywords = ["Camiseta","shirt", "T-shirt", "Maglietta", "hoodie","Sweat à Capuche", "Sudadera con Capucha", "Felpa con Cappuccio","Débardeur","Camiseta sin Mangas", "tanktop","tank top", "tank-top", "Canotta", "Throw Pillow","Camiseta Cuello V","V-Neck","V-Ausschnitt","T-Shirt avec Col en V", "Maglietta con Collo a V","Sweatshirt","Tumbler"]; // Customize as needed
     for(let i=0; i < keywords.length ;i++){
        if(title.toLowerCase().includes(keywords[i].toLowerCase())) return false;
     }
      
     return true;
}
function booksDate(text){
    const match = text.match(/\((.*?)\)/); // Regular expression to match text inside parentheses

    if (match) {
      return `${match[1]}`;
    }
    return 'N/A';
}

// Main function to extract product price using multiple selectors
function extractPrice(doc) {
	try{
		
		const priceSelectors = ["#corePrice_feature_div", ".priceToPay", "#corePriceDisplay_desktop_feature_div", ".apexPriceToPay"];

		for (const selector of priceSelectors) {
			const priceElem = doc.querySelector(selector);

			if (priceElem) {
				const priceText = priceElem.innerText;
				const extractedPrice = extractCurrencyPrice(priceText);
				
				if (extractedPrice) {
					doc = null;
					return extractedPrice;
				}
				// Price not found
			}
			// Element not found
		}
		
		doc = null;
	}catch(e){
		//console.error("Price not found check zip code");
	}
	
    return null;
}

// Helper function to extract the price from text, with support for multiple currencies
function extractCurrencyPrice(text) {
	try{
		const cleanedText = text.replace(/\n/g, '').trim();
    
		// Match currency symbols followed by a price, allowing for multiple currencies
		const match = cleanedText.match(/([$€£])(\d+(\.\d{2})?)/);
		
		if (match) {
			const currencySymbol = match[1];
			const priceAmount = match[2];
			return `${currencySymbol}${priceAmount}`.trim();
		}

	}catch(e){
		//console.log(`No valid currency price found in text: ${e}`);
	}
	
    return null;
}

function parseHtml(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, "text/html");
}

function cleanString(str) {
    return  str
      ? str.replace(/,/g, "") // Remove commas to avoid CSV format issues
      .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '') // Remove invisible characters
      .normalize('NFC') // Normalize string to standard form
      .trim() : null;
}

function updateResults() {
    const msg = document.querySelector('.emr.item-container-row .resultProduct');
    if (!msg) return;

    const parts = msg.textContent?.split('/');
    if (!parts || parts.length < 2) return;
	
    // Clean both parts to remove non-numeric characters
    const cleanresult = parseInt(parts[1].replace(/[^0-9]/g, ''), 10);
    if (isNaN(cleanresult)) return;

    msg.textContent = cleanComp(cleanresult);
}

function cleanComp(result) {
	
    if (isNaN(result)) return result;

    const url = new URL(window.location.href);
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const range = Math.min(Math.ceil(result / 48) * 48, page * 48, result);

    return `${range.toLocaleString()}/${result.toLocaleString()}`;
}




function cleanBsr(bs) {
	// Check if bs is a valid number, otherwise return 'N/A'
	if (typeof bs !== 'string' || bs.trim() === '' || isNaN(bs.trim()) || isNaN(bs) || bs === null || bs === undefined) {
		return 'N/A';
	}
	// Format the number with a '#' prefix and commas
	return "#" + Number(bs).toLocaleString();
}
function cleanCompetition(bs) {
	// Check if bs is a valid number, otherwise return 'N/A'
	if (typeof bs !== 'string' || bs.trim() === '' || isNaN(bs.trim()) || isNaN(bs) || bs === null || bs === undefined) {
		return 'N/A';
	}
	// Format the number with a '#' prefix and commas
	return Number(bs).toLocaleString();
}
function formatShortDate(longDate) {

    try {
        // Check if valid 
        if(!longDate || longDate.includes('N/A')) return longDate;
        // Parse the long date
        const date = new Date(longDate);
    
        // Define options for the short format
        const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
    
        // Use Intl.DateTimeFormat for formatting
        return new Intl.DateTimeFormat('en-US', options).format(date);  
    } catch (error) {}

}


async function getImage(imageName) {
	return chrome.runtime.getURL(`assets/images/${imageName}`);
}

///////////////////////////////// CHECKING FOR COMPETITION //////////////////////////////

async function CheckCompetion() {

    await delay(50);

    const msgBox = document.querySelector('.emr.item-container-row .resultProduct');
    let results = [];
    let aproxs = [];
    let lastPages = [];
    let initialResult;
    let finalResult;

    let urlbase = new URL(window.location.href);

    // Ensure the URL starts with "https://" or "http://"
    if (!/^https?:\/\//i.test(urlbase)) {
        urlbase = `https://${urlbase}`;
    }

    // Modify URL search parameters
    urlbase.searchParams.set('ref', 'sr_pg_2');
    urlbase.searchParams.set('page', 3);

    let firstResult = 0 ;
    
    // Fetch the data from the modified URL
    initialResult = await fetchAndCompetition(urlbase.href, 1);

    for(let i = 0; i < 6; i++){
        if (initialResult && initialResult.totalResultCount) {
            // Getting number of pages
            firstResult = initialResult.totalResultCount;

            // Modify URL search parameters
            urlbase.searchParams.set('ref', `sr_pg_${Math.floor(firstResult/48)-1}`);
            urlbase.searchParams.set('page', `${Math.floor(firstResult/48)}`);

            // Fetch the data from the modified URL
            initialResult = await fetchAndCompetition(urlbase.href, 1);
  
            if(initialResult.totalResultCount === firstResult) break;

        }
    }

    if (initialResult && initialResult.totalResultCount) {
        // Process the totalResultCount and clean it
        const result = cleanComp(initialResult.totalResultCount);

        // Assign resutl to global variable..
        resultCounter = initialResult.totalResultCount;
    
        // Update the message box with the cleaned result
        msgBox.textContent = `${result}`;
        return;
    }



    let url = new URL(window.location.href);
    
    // Ensure the URL starts with "https://" or "http://"
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }
    
    let refParam = url.searchParams.get('ref');
    
    if (refParam) url.searchParams.delete('ref');
                  url.searchParams.set('page', 1000);
    try {
		
		const a = await fetchAndCompetition(url.href, 1);
		if(a.apro) url.searchParams.set('page', Math.ceil(a.apro / 48) + 9);
		
		for (let i = 0; i < 2; i++) {
			const data = await fetchAndCompetition(url.href, 1);

			if (data.result) results.push(data.result);
			if (data.apro) aproxs.push(data.apro);
			if (data.lastPage) lastPages.push(data.lastPage);
			if (!data.lastPage) {
					let lastApro = data.apro;
					let c = Math.ceil(data.apro / 48);
					if(data.apro > 20000){
						for (let j = 1; j <= 3; j++) {

							url.searchParams.set('page', c > 0 ? c : 1);
							const data1 = await fetchAndCompetition(url.href, 1);
							if (data1.result) results.push(data1.result);
							if (data1.apro) aproxs.push(data1.apro);
							if (data1.lastPage) lastPages.push(data1.lastPage);
							if (data1.apro === lastApro) break;
							c = Math.ceil(data1.apro / 48);
							lastApro = data1.apro;

						}
					}
			}
			
			if(isDuplicated(aproxs)) break;
			
		}
        //console.log(`Results: ${results}, Last Pages: ${lastPages} Ranges: ${aproxs}`);
        
    
        const maxResults = results.length > 0 ? Math.max(...results) : 0;
        const maxAproxs = aproxs.length > 0 ? Math.max(...aproxs) : 0;
    
        finalResult = maxAproxs >= 20000? Math.max(maxResults,maxAproxs) : maxAproxs ;

    } catch (error) {
        finalResult = `Error!`;
    }

    if(finalResult === 0 && results.length > 0 && aproxs.length === 0 && lastPages.length === 0) finalResult = Math.max(...results);
    
    finalResult = finalResult? finalResult : `0`;
   
    const cleanresult = cleanComp(finalResult);

    msgBox.textContent= `${cleanresult}`;

    // Assign resutl to global variable..
    resultCounter = finalResult;

    return;
}

function isDuplicated(array) {
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] === array[i + 1]) {
      return true; // Found consecutive duplicates
    }
  }
  return false; // No consecutive duplicates found
}

async function findWithinRange(aproxs, target) {

    const range = 48;

    if(aproxs.length === 0) return target;

    for (let i = 0; i < aproxs.length; i++) {
        let diff = Math.abs(aproxs[i] - target);
        if (diff <= range) {
            return aproxs[i]; // Return the first number within the range
        }
    }
    return target; // Return null if no match is found
}

// Fetch and clean HTML content
async function fetchAndCleanSearch(url, retryMode, asin) {
 
    // Fetch raw content with retry logic
    let rawContent = await fetchWithRetry(url, retryMode);

    // Extract the title tag from raw content
    let titleMatch = rawContent.match(/<title.*?<\/title>/is);

    // Clean and transform the content
    const cleanedContent = rawContent
        .replace(/<head.*?<\/head>/is, titleMatch ? titleMatch[0] : '')
        .replace(/<style.*?<\/style>/gs, '')
        .replace(/<script.*?<\/script>/gs, '')
        .replace(/<noscript.*?<\/noscript>/gs, '')
        .replace(/<header.*?<\/header>/gs, '')
        .replace(/href=/gs, 'momo=')
        .replace(/src=/gs, 'source=')
        .replace(/data-/gs, 'mama-')
        .replace(/onload/gs, 'onslow');

    rawContent = titleMatch = null;
    // Return the cleaned content
    return cleanedContent;
}

// Fetch and clean HTML content
async function fetchAndTitle(url, retryMode) {
    try {
        // Fetch raw content with retry logic
        let rawContent = await fetchWithRetry(url, retryMode);

        // Extract the image `src` with id="landingImage"
        const imgRegex = /<img[^<>]*id="landingImage"[^<>]*\/?>/;
        const srcRegex = /src="([^"]+)"/;

        let imgTagMatch = rawContent.match(imgRegex);
        const img = imgTagMatch ? (imgTagMatch[0].match(srcRegex)?.[1] || null) : null;

        // Extract the title tag from raw content
        let titleMatch = rawContent.match(/<title.*?<\/title>/is);
        const title = await handleTitle(titleMatch ? titleMatch[0] : null);

        // Nulifying Variables 
        rawContent = imgTagMatch = titleMatch = null;

        // Return the extracted data
        return { title, image: img };

    } catch (error) {
        return { title: null, image: null };
    }
}


async function handleTitle(title) {

	if(!title) return null;

	const keywords = ["Camiseta","shirt", "T-shirt", "Maglietta", "hoodie","Sweat à Capuche", "Sudadera con Capucha", "Felpa con Cappuccio","Débardeur","Camiseta sin Mangas", "tanktop","tank top", "tank-top", "Canotta", "Throw Pillow","Camiseta Cuello V","V-Neck","V-Ausschnitt","T-Shirt avec Col en V", "Maglietta con Collo a V","Sweatshirt","Tumbler"]; // Customize as needed
	
    try {
		
		const full_title = title;
        const titleParts = title?.split(":");
		      
        // Check each part of the title for a keyword match
        for (const part of titleParts) {
            for (const keyword of keywords) {
                if (part.toLowerCase().includes(keyword.toLowerCase())) {
					if(part.toLowerCase().includes('amazon.') && part.toLowerCase().includes('|')){
						const ps = part.split('|');
						for(const p of ps){
							if(p.toLowerCase().includes(keyword.toLowerCase())){
								return p.trim().replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, ''); 
							}
						}
					}
                    return part.trim().replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '');  // Return the matching part if found
                }
            }
        }
		
		
        // If no keyword matches, return the first part or the entire title as fallback
        return titleParts[0].trim();
    } catch (error) {
       // console.error("Error extracting title.",error);
    }
	return null;
}


// Fetch and clean HTML content
async function fetchAndCleanContent(url, retryMode) {
 
    // Fetch raw content with retry logic
    let rawContent = await fetchWithRetry(url, retryMode);

    // Extract the title tag from raw content
    let titleMatch = rawContent.match(/<title.*?<\/title>/is);

    // Clean and transform the content
    const cleanedContent = rawContent
        .replace(/<head.*?<\/head>/is, titleMatch ? titleMatch[0] : '')
        .replace(/<style.*?<\/style>/gs, '')
        .replace(/<script.*?<\/script>/gs, '')
        .replace(/<noscript.*?<\/noscript>/gs, '')
        .replace(/<header.*?<\/header>/gs, '')
        .replace(/href=/gs, 'momo=')
        .replace(/src=/gs, 'source=')
        .replace(/data-/gs, 'mama-')
        .replace(/onload/gs, 'onslow');

    rawContent = titleMatch = null;
    // Return the cleaned content
    return cleanedContent;
}


async function fetchAndCompetition(url, retryMode) {
    let lastPage = null;
    let totalProducts = null;

    // Fetch raw content with retry logic
    let rawContent = await fetchWithRetry(url, retryMode);

    let match = rawContent.match(/"totalResultCount":\s*(\d+)/);
    const totalResultCount = match ? parseInt(match[1], 10) : null;
    
    if (totalResultCount !== null) {
      rawContent = match = null;
      return { totalResultCount }; // No need to continue if the answer found.
    }
    
    const regex = /(\d{1,3}(?:,\d{3})*)\s*results?/; // Regex for extracting number of results
    const pattern = /<span[^<]*?(result|results)[^>]*?<\/span>/gi; // Regex to find <span> containing "result" or "results"

    const reg = /(\d{1,3}(,\d{3})*|\d+)-(\d{1,3}(,\d{3})*|\d+)/; /// 4,454-4556
    let aprox = null;

    try {
        // Match the pattern to find the results
        const match = rawContent.match(pattern)[0];
        if (match && match.length > 0) {

                const result = match.match(regex)[1]; // Extract the number from each matched span

                if (result) {
                    const n = result.replace(/,/g, ''); // Remove commas if present
                    totalProducts = !isNaN(Number(n)) ? Number(n) : null; // Convert to number if valid, else null
                    try {
                        const apro = match.match(reg)?.[3] || null;
                        if(apro){
                            const s = apro.replace(/,/g, ''); // Remove commas if present
                            apro? (aprox = !isNaN(Number(s)) ? Number(s) : null): null;
                        }                       
                    } catch (error) {
                        aprox = 0;
                    }

                } 

        } 
    } catch (error) {
        //console.error(`No results or bad query!`);
    }


    const pattern1 = /<span[^>]*class=["']s-pagination-item s-pagination-disabled["'][^>]*>(.*?)<\/span>/gi;

    // Match for the last page number
    let match1 = rawContent.match(pattern1);

    if (match1 && match1.length > 0) {
        match1.forEach((element, index) => {
            const content = element.match(/>(.*?)<\/span>/i)[1]; // Extract inner content
            const numberContent = Number(content); // Convert to number

            if (!isNaN(numberContent)) { // Check if conversion is successful
                lastPage = numberContent;
            } 
        });
    } 
    rawContent = match = match1 = null;
    // Return the cleaned content
    return { result: totalProducts, apro : aprox, lastPage: lastPage, totalResultCount: totalResultCount };
}



// Function to get a random user agent from the array
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Ensure fetchWithRetry checks for retryMode
async function fetchWithRetry(asin, retryMode, retries = 3, delayMs = 500) {
    for (let i = 0; i < retries; i++) {
        try {
            await delay((Math.floor(Math.random() * 1) + 50));  // Small delay between requests

            // Choose URL based on retryMode
			let url = retryMode === 0 ? `/dp/${asin.replace(/\s+/g, '').replace(/\u200E/g, '')}` : asin;
           
            let response = await fetch(url, {
                method: 'GET',
                headers: {
					'User-Agent': getRandomUserAgent(),
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Clear-Site-Data': 'cache',
					'Accept-Encoding': 'br, zstd, gzip ,deflate',
                    'accept-language':'en-US,en'
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.text();
			response = null;
            return data;  // Return data directly as a string

        } catch (error) {
            //console.error(`Attempt ${i + 1} failed: ${error}`);
            if (i < retries - 1) {
                await delay(delayMs * (i + 1));
            } else {
                throw new Error(`Failed to fetch ${retryMode === 0? ASIN : 'Url' } ${asin} after ${retries} retries.`);
            }
        }
    }
}
////////////////////////////////// INDEXED DB SECTION ////////////////////////////////////

setDomain();

async function setDomain(){
    const url = window.location.href;
    const match = url.match(/https?:\/\/?(www\.?amazon\.(com|es|fr|it|de|co\.uk))/);
    if (match) {
        domainUrl = `${match[1]}/`;

        // Ensure the URL starts with "https://" or "http://"
        if (!/^https?:\/\//i.test(domainUrl)) {
            domainUrl = `https://${domainUrl}`;
        }
    }
}

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
                        //console.error("Failed to retrieve tab ID");
                        reject("Tab ID not found");
                    }
                    port.disconnect(); // Disconnect after receiving response
                });

                // Handle disconnection errors
                port.onDisconnect.addListener(() => {
                    if (chrome.runtime.lastError) {
                        //console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError.message);
                    } 
                });
            });
        } catch (error) {
            attempt++;
            //console.warn(`Attempt ${attempt} failed: ${error}`);

            if (attempt >= maxRetries) {
                //console.error("All retry attempts failed.");
                break;
            }

            // Optional: Add a small delay between retries
            await new Promise((resolve) => setTimeout(resolve, 500)); // 1-second delay
        }
    }

    // If all retries fail, return null
    return null;
}


async function saveSettings(settings, newtab) {

    const maxRetries = 3; // Maximum number of retries
    let attempt = 0;
    let opened = false;

    while (attempt < maxRetries) {
        try {
            if (!settings) {
                //console.error("No settings provided.");
                return;
            }

            const tabId = await requestTabId(); // Request tab ID

            if (!tabId) {
                throw new Error("Tab ID retrieval failed.");
            }

            // Establish a long-lived connection with the background script
            const port = chrome.runtime.connect({ name: "saveSettings" });

            // Send `tabId` with data
            port.postMessage({ action: "saveSettings", data: settings, tabId });

            // Setup a timeout to close the port if no response within a specified time
            const timeoutId = setTimeout(() => {
                //console.warn("Port disconnected due to timeout.");
                port.disconnect();
            }, 30000); // 30-second timeout

            // Listen for messages from the background script on this port
            const response = await new Promise((resolve, reject) => {
                port.onMessage.addListener((response) => {
                    clearTimeout(timeoutId); // Clear timeout on response
                    resolve(response);
                    port.disconnect();
                });

                port.onDisconnect.addListener(() => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(`Disconnected due to an error: ${chrome.runtime.lastError.message}`));
                    } else {
                        reject(new Error("Port disconnected without a response."));
                    }
                });
            });

            // Handle the response
            if (response.status === "success") {
             
                if (!opened && newtab) {
                    closeTabAndOpenNew(settings.dmUrl);
                    opened = true;
                }
                return; // Exit the loop on success
            } else {
                throw new Error(`Settings storage failed: ${response.message}`);
            }
        } catch (error) {
            attempt++;
            //console.warn(`Attempt ${attempt} failed: ${error.message}`);

            if (attempt >= maxRetries) {
                //console.error("All retry attempts failed.");
                break;
            }

            // Optional: Add a small delay between retries
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
        }
    }
}

// Function to retrieve data from the background script
async function getSettings() {
    try {
        const tabId = await requestTabId(); // Request tab ID
                        
        if (tabId) {
            return new Promise((resolve, reject) => {
                // Establish a long-lived connection with the background script
                const port = chrome.runtime.connect({ name: "retrieveSettings" });

                // Send `tabId` with data
                port.postMessage({ action: "retrieveSettings", tabId });

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
                        //console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(new Error("Disconnected due to an error"));
                    } 
                });
            });
        } else {
            throw new Error("tabId is undefined");
        }

    } catch (e) {
        //console.error('Retrieving data failed!', e);
        return null;  // Return null in case of any failure
    }
}
// Function to retrieve data from the background script
async function getUI() {
    try {
        const tabId = await requestTabId(); // Request tab ID
                        
        if (tabId) {
            return new Promise((resolve, reject) => {
                // Establish a long-lived connection with the background script
                const port = chrome.runtime.connect({ name: "UI" });

                // Send `tabId` with data
                port.postMessage({ action: "getUI", tabId });

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
                        //console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(new Error("Disconnected due to an error"));
                    } 
                });
            });
        } else {
            throw new Error("tabId is undefined");
        }

    } catch (e) {
        return null;  // Return null in case of any failure
    }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


////////////////////////////// MULTIPAGES LOADER /////////////////////////////////////////////////

async function runLoader() {

    const lDiv = document.querySelector('div.loaderContainer');

    // Check if the loader already exists to avoid duplicates
    if(lDiv){      
        // Check if the loader is hidden
        if (lDiv.style.display.includes('none')){
            lDiv.style.display = 'flex';
            lDiv.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        return;
    }

    // Create the loader container
    const loaderContainer = document.createElement('div');
    loaderContainer.classList.add('loaderContainer','show');

    // Style the loader container
    loaderContainer.style.position = 'fixed';
    loaderContainer.style.top = '0';
    loaderContainer.style.left = '0';
    loaderContainer.style.width = '100%';
    loaderContainer.style.height = `${document.documentElement.clientHeight}px`; // Set height dynamically
    loaderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // Black background with opacity
    loaderContainer.style.zIndex = '9999'; // Ensure it's on top of other elements

    // Example: Simulate loading process and remove after 5 seconds

    loaderContainer.innerHTML = `
    <!-- Filter section -->
    <div class="filter-container" style="display:none">
        <div class="advanced-options">
            <div class="filter-group search">
                <label>Search Term & Date 
                    <p class="instruction" style="color:#46b8df">
                        <i>.....</i>
                    </p>
                </label>
                <input type="text" id='filter-term' placeholder="Search term.. keyword" class="search-input"/>
                <input type="datetime" id='minDate' placeholder="Published after MM/DD/YYY e.g 25/12/2024" class="search-input"/>
            </div>
            <div class="filter-group">
                <label>BRS Range</label>
                <input type="number" id='minBsr' placeholder="Min" class="min-input"/>
                <input type="number" id='maxBsr' placeholder="Max" class="max-input"/>
            </div>
            <div class="filter-group">
                <label>Price Range</label>
                <input type="number" id='minfPrice' placeholder="Min" class="min-input"/>
                <input type="number" id='maxfPrice' placeholder="Max" class="max-input"/>
            </div>
        </div>

        <div class="filter-actions">
            <button class="btn filter-btn">Filter</button>
            <button class="btn reset-btn">Reset</button>
        </div>
    </div>
</div>       
    <div class="container" style='overflow:hidden'>
        <div class="header">
            <div class="loader item-container-row">
                <span class="item-container-row">
                    <label for="firstCount">Pages:</label>
                    <input type="number" value="1" id="firstCount"/>
                    <label for="lastCount">-</label>
                    <input type="number" value="10" id="lastCount"/>
                    <p class="progress">Progress:<i class='progressValue'>0/10</i></p>
                    <button class="multiload">Load</button>
                    <button class="filters">Show Filter Panel</button>  
                </span>
            </div> 
        </div>          
        <div class="body" id="productList">
        </div>
        <button id="closeButton">Close</button>
    </div>
    `;

    // Append the loader container to the body
    document.body.appendChild(loaderContainer);
    // Delay until DOM is ready
    await delay(1000);

    // Setting event listeneers
    const filterBtn = document.querySelector('.loaderContainer button.filters');
    const loadBtn = document.querySelector('.loaderContainer button.multiload');
    const closeBtn = document.querySelector('.loaderContainer button#closeButton');

    const filterButton = document.querySelector('.loaderContainer button.btn.filter-btn');
    const resetButton = document.querySelector('.loaderContainer button.btn.reset-btn');

    filterBtn.addEventListener('click', filtersHandler);
    loadBtn.addEventListener('click', loadHandler);
    closeBtn.addEventListener('click', closeHandler);

    filterButton.addEventListener('click', filter);
    resetButton.addEventListener('click', reset);
    
    // Deactivate scrolling
    document.body.style.overflow = 'hidden';

    containerProducts = document.getElementById('productList');
    // Set the height of the container to match the total list height

    const isAll = filteredProduct.length === 0;
    const data = isAll ? products : filteredProduct;

    containerProducts.innerHTML = `<div class="spacer" style="height: ${data.length * (ITEM_HEIGHT + gap)}px;"></div>`;
    containerProducts.style.width =( containerProducts.parentElement.clientWidth -30 )+'px';
    containerProducts.style.height =( containerProducts.parentElement.clientHeight -50 )+'px';

    VISIBLE_ITEMS = Math.ceil(containerProducts.clientHeight / (ITEM_HEIGHT + gap)); // Adjust visible items calculation
    start = 0;

    let scrollTimeout;
    containerProducts.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollTop = containerProducts.scrollTop;
            start = Math.floor(scrollTop / (ITEM_HEIGHT + gap));
            renderVirtualizedList();
        }, 50); // Adjust debounce interval as needed
    });

    containerProducts.addEventListener('click', (e) => {
        if (e.target.closest('.deletes')) {
            const deleteIcon = e.target.closest('.deletes');
            const indexInVisible = parseInt(deleteIcon.getAttribute('data-row-index'), 10);
    
            // Calculate the actual index in the main array
            const index = start + indexInVisible;
    
            // Remove the item from the main 'products' array
            products.splice(index, 1);
    
            // If filteredProduct is in use, update it as well
            if (filteredProduct.length > 0) {
                filteredProduct.splice(index, 1);
            }
    
            // Re-render the list to reflect changes
            renderVirtualizedList();
        }
    });
    
    
    
    

    renderVirtualizedList();

}



async function runWinner() {

    const lDiv = document.querySelector('div.winnerContainer');

    // Check if the loader already exists to avoid duplicates
    if(lDiv){      
        // Check if the loader is hidden
        if (lDiv.style.display.includes('none')){
            lDiv.style.display = 'flex';
            lDiv.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        return;
    }

    // Create the loader container
    const loaderContainer = document.createElement('div');
    loaderContainer.classList.add('winnerContainer','show');

    // Style the loader container
    loaderContainer.style.position = 'fixed';
    loaderContainer.style.top = '0';
    loaderContainer.style.left = '0';
    loaderContainer.style.width = '100%';
    loaderContainer.style.height = `${document.documentElement.clientHeight}px`; // Set height dynamically
    loaderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // Black background with opacity
    loaderContainer.style.zIndex = '9999'; // Ensure it's on top of other elements

    // Example: Simulate loading process and remove after 5 seconds

    loaderContainer.innerHTML = `
    <div class="container" style='overflow:hidden'>
        <div class="header">
            <div class="loader item-container-row">
                <span class="item-container-row">
                    <label for="maxResult">Maximum Competition :</label>
                    <input type="number" value="1000" placeholder="1K" id="maxResult">
                    <label for="firstPage">Pages:</label>
                    <input type="number" value="1" placeholder="Page 1 " id="firstPage"/>
                    <label for="lastPage">-</label>
                    <input type="number" value="10" placeholder="Page 10 " id="lastPage"/>
                    <p class="progress">Progress:<i class='progressValue'>0/10</i></p>
                    <button class="multiload" id="loadWinner">Load</button> 
                </span>
            </div> 
        </div>          
        <div class="body" id="winnersList">
        </div>
        <button id="closeButton">Close</button>
    </div>
    `;

    // Append the loader container to the body
    document.body.appendChild(loaderContainer);
    // Delay until DOM is ready
    await delay(1000);

    // Setting event listeneers
    const loadBtn = document.querySelector('.winnerContainer button#loadWinner');
    const closeBtn = document.querySelector('.winnerContainer button#closeButton');

    loadBtn.addEventListener('click', loadWinners);
    closeBtn.addEventListener('click', closeWinners);

    
    // Deactivate scrolling
    document.body.style.overflow = 'hidden';

    winnerProducts = document.getElementById('winnersList');
    // Set the height of the container to match the total list height

    winnerProducts.innerHTML = `<div class="spacer" style="height: ${winners.length * (WINNER_ITEM_HEIGHT + gap)}px;"></div>`;
    winnerProducts.style.width =( winnerProducts.parentElement.clientWidth -30 )+'px';
    winnerProducts.style.height =( winnerProducts.parentElement.clientHeight -50 )+'px';

}

async function filter() {
    try {
        if (!Array.isArray(products) || products.length === 0) {
            return;
        }

        filteredProduct = [];
        document.querySelector("#productList").innerHTML = "";

        // Pre-validate input values
        const minDate = await customDate(document.getElementById("minDate").value || "01/01/2000", 1);
        const maxDate = await customDate("12/31/3000", 1);
        const minBsr = parseFloat(document.getElementById("minBsr").value) || 0;
        const maxBsr = parseFloat(document.getElementById("maxBsr").value) || 10000000;
        const minPrice = parseFloat(document.getElementById("minfPrice").value) || 0;
        const maxPrice = parseFloat(document.getElementById("maxfPrice").value) || 300;
        const filterTerm = document.getElementById("filter-term").value.toUpperCase();

        let j = 0;

        // Iterate over products
        for (let i = 0; i < products.length; i++) {
            try {
                const product = products[i];
                const title = product.title ? product.title.toUpperCase() : '';
                const brand = product.brand ? product.brand.toUpperCase() : '';
                const date = await customDate(product.date.trim(), 0);
                const price = parseFloat(product.price.replace(/[^\d\.]/g, '')) || 0;
                const bsr = product.bsr === 'N/A' ? NaN : parseFloat(product.bsr.replace(/[^\d\.]/g, '')) || NaN;
                
                let match = true;

                // Date range check
                if ((minDate && parseInt(date) < parseInt(minDate)) || (maxDate && parseInt(date) > parseInt(maxDate))) {
                    match = false; // If date doesn't fall within the range, don't include
                }

                // Search term match - check title OR brand
                if (filterTerm && !(title.includes(filterTerm) || brand.includes(filterTerm))) {
                    match = false; // If neither title nor brand match the filter term
                }

                // Price range check
                if ((isNaN(price) || price < minPrice || price > maxPrice) && (minPrice != 0 || maxPrice != 300)) {
                    match = false; // If price is outside range, don't include
                }

                // BSR range check
                if ((isNaN(bsr) || bsr < minBsr || bsr > maxBsr) && ( minBsr != 0 || maxBsr != 10000000)) {
                    match = false; // If BSR is invalid or out of range, don't include
                }

                // If the product matches all conditions, add to filteredProduct
                if (match) {
                    filteredProduct.push(product);
                }

                // Process batches of 100 to avoid UI freezing
                j++;
                if (j === 100) {
                    await delay(10); // Slight delay to avoid UI freezing
                    j = 0;
                }
            } catch (ee) {
                //console.error("Error filtering product", ee);
            }
        }

        // Handle case when no products match
        if (filteredProduct.length === 0) {
            document.querySelector("#productList").innerHTML = `<span class="notFound">NO PRODUCTS FOUND. TRY AGAIN!</span>`;
            return;
        }

        // Render the filtered product list
        renderVirtualizedList();

    } catch (e) {
        //console.error("Filter operation failed:", e);
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

function reset(){

    filteredProduct =[];
    document.getElementById("minDate").value ='';
    document.getElementById("minBsr").value ='';
    document.getElementById("maxBsr").value = '';
    document.getElementById("minfPrice").value = '';
    document.getElementById("maxfPrice").value = '';
    document.getElementById("filter-term").value = '';

    document.getElementById("minDate").textContent ='';
    document.getElementById("minBsr").textContent ='';
    document.getElementById("maxBsr").textContent ='';
    document.getElementById("minfPrice").textContent ='';
    document.getElementById("maxfPrice").textContent ='';
    document.getElementById("filter-term").textContent ='';

    renderVirtualizedList();
}

function filtersHandler(){
    const filterDiv = document.querySelector('.loaderContainer .filter-container');
    if(!filterDiv) return;
    const isNone = filterDiv.style.display.includes('none');

    filterDiv.style.display = isNone? 'flex': showWithAnimation(filterDiv);

    const fBtn = document.querySelector('.loaderContainer button.filters');
    fBtn.textContent = !isNone? 'Show Filter Panel':'Hide Filter Panel';
    
    isNone? filterDiv.classList.add('show'):'';

}

function showWithAnimation(elemet){
        elemet.classList.remove('show');
        setTimeout(() => {
          elemet.style.display = 'none'; // Hide after animation
        }, 600); // Match the transition duration (0.6s)
}

let isRunning = false;
let isPaused = false;

async function loadHandler() {

    // Get page range from user input
    const startPage = parseInt(document.querySelector('#firstCount').value) || 1;
    const endPage = parseInt(document.querySelector('#lastCount').value) || 10;

    // Update button state
    const button = document.querySelector('.loaderContainer .multiload');
    const progress = document.querySelector('.loaderContainer p.progress .progressValue');
    
    if (isRunning){pause(button); return} 

    await delay(200); // Prevents double-clicks
    button.textContent = 'Pause';

    if (resultCounter && !isNaN(resultCounter)) {
        resultCounter = Math.abs(resultCounter);  // Ensure resultCounter is positive
        endSearch = Math.ceil((resultCounter / 48) + 1); // Calculate number of pages
    }
    
    if(!endSearch || endSearch === 'undefined') endSearch = endPage;

    // Initialize state
    isRunning = true;
    isPaused = false;

    try {
        const urlbase = new URL(window.location.href);

        let i = startPage;

        // Ensure the loading image is fetched once
        if (!loadingImageSrc) {
            loadingImageSrc = await getImage("loading.gif");
        }

        // Display loading image...
        const span = document.createElement('span');
        span.classList.add('notFound');
        span.innerHTML=`<img style="width:40px;height:40px" src="${loadingImageSrc}"/>`;
        
        document.querySelector("#productList").appendChild(span);

        //Reset fetched asins if not products available..
        if(products.length === 0 ) fetchedAsins = [];

        for ( i ; i <= endPage && !isPaused && i <= endSearch; i++) {
            // Modify URL parameters for the current page
            urlbase.searchParams.set('ref', `sr_pg_${i}`);
            urlbase.searchParams.set('page', i);

            // Display progress...
            progress.textContent =`${i}/${endPage}`; 

            if(isPaused) break;
            // Process the current page and update the UI concurrently
            
            // Process the current page
            await multiPageLoader(urlbase.href);
            renderVirtualizedList(); // Update winners list in the UI

            // Remove loading image...
            document.querySelector("#productList .notFound")?.remove();
           
        }

    } catch (error) {
        //console.error('Error in loadHandler:', error);
    } finally {
        // Reset state and UI
        isRunning = false;
        isPaused = false;
        button.textContent = 'Load';
        button.style.pointerEvents = "";
    }
}


let isWinnerRunning = false;
let isWinnersPaused = false;

async function loadWinners() {



    // Get page range from user input
    const startPage = parseInt(document.querySelector('#firstPage').value) || 1;
    const endPage = parseInt(document.querySelector('#lastPage').value) || 10;

    // Update button state
    const button = document.querySelector('.winnerContainer #loadWinner');
    const progress = document.querySelector('.winnerContainer p.progress .progressValue');

    if (isWinnerRunning){pauseWinners(button); return} 

    await delay(200); // Prevents double-clicks
    button.textContent = 'Pause';

    if (resultCounter && !isNaN(resultCounter)) {
        resultCounter = Math.abs(resultCounter);  // Ensure resultCounter is positive
        endSearch = Math.ceil((resultCounter / 48) + 1); // Calculate number of pages
    }

    if(!endSearch || endSearch === 'undefined') endSearch = endPage;

    // Initialize state
    isWinnerRunning = true;
    isWinnersPaused = false;

    try {
        const urlbase = new URL(window.location.href);
        
        let i = startPage;

        // Ensure the loading image is fetched once
        if (!loadingImageSrc) {
            loadingImageSrc = await getImage("loading.gif");
        }

        // Display loading image...
        const span = document.createElement('span');
        span.classList.add('notFound');
        span.innerHTML=`<img style="width:40px;height:40px" src="${loadingImageSrc}"/>`;
        
        document.querySelector("#winnersList").appendChild(span);


        for (i ; i <= endPage && !isWinnersPaused && i <= endSearch ; i++) {

            // Modify URL parameters for the current page
            urlbase.searchParams.set('ref', `sr_pg_${i}`);
            urlbase.searchParams.set('page', i);

            // Display progress...
            progress.textContent =`${i}/${endPage}`;

            if(isWinnersPaused) break;

            // Process the current page and update the UI concurrently
            
            await multiPageLessCompetitive(urlbase.href); // Process the current page

            // Remove loading image...
            document.querySelector("#winnersList .notFound")?.remove();
            

        }
    } catch (error) {
        //console.error('Error loading winners:', error);
    } finally {
        // Reset state and UI
        isWinnerRunning = false;
        isWinnersPaused = false;
        button.textContent = 'Load';
        button.style.pointerEvents = "";
    }
}


function pauseWinners(button){
    isWinnersPaused = true;
    button.style.pointerEvents = "none";
}

function pause(button){
    isPaused = true;
    button.style.pointerEvents = "none";
}

async function multiPageLoader(url) {
    const asins = await loadAsins(url);

    // Load all product data concurrently
    const loadPromises = asins.map(asin => loadProductDataFor(asin));
    await Promise.all(loadPromises);
    return true;
}

async function multiPageLessCompetitive(url) {
    const asins = await loadAsins(url);

    // Load all product data concurrently
    const loadPromises = asins.map(asin => loadProductLessCompetitive(asin));
    await Promise.all(loadPromises);
    return true;
}

async function loadProductLessCompetitive(asin) {
    try {
        // Fetch the product title
        const data = await fetchAndTitle(asin, 0);

        if (!data || !data.title || data.title === 'undefined') return; // Early exit for invalid titles

        // Extract competition level
        const result = await extractCompetition(data.title);

        // Construct product link
        let link = `${domainUrl}dp/${asin}`;

        // Ensure the URL starts with "https://" or "http://"
        if (!/^https?:\/\//i.test(link)) {
            link = `https://${link}`;
        }

        const image = data.image || 'N/A';

        // Retrieve and parse maxResult
        const maxResltInput = document.querySelector('#maxResult')?.value;
        let maxReslt = parseInt(maxResltInput, 10);

        // Ensure maxReslt is a positive number or fallback to the default
        if (isNaN(maxReslt) || maxReslt <= 0) {
            maxReslt = 1000; // Default to 1000 for invalid or non-positive input
        } else {
            maxReslt = Math.abs(maxReslt); // Convert to absolute value
        }

        // Validate and process the result
        if (typeof result === 'number' && result <= maxReslt) {
            addWinner(new Winner(data.title, link, asin, result, image));
        }

        return ;

    } catch (error) {
        //console.error(`Error loading product for ASIN ${asin}:`, error);
    }
}


function closeHandler() {
    const filterDiv = document.querySelector('div.loaderContainer');
    if(!filterDiv) return;

    filterDiv.classList.remove('show');
    setTimeout(() => {
        filterDiv.style.display ='none';
        document.body.style.overflow ='auto';
    }, 600); // Match the transition duration (0.6s)

}

function closeWinners() {
    const filterDiv = document.querySelector('div.winnerContainer');
    if(!filterDiv) return;

    filterDiv.classList.remove('show');
    setTimeout(() => {
        filterDiv.style.display ='none';
        document.body.style.overflow ='auto';
    }, 600); // Match the transition duration (0.6s)

}


function renderVirtualizedList() {
    const isAll = filteredProduct.length === 0;
    const data = isAll ? products : filteredProduct;

    const visibleItems = data.slice(start, start + VISIBLE_ITEMS + 10);
    const listHTML = visibleItems.map((product, index) => `
        <div class="item" 
            style="
                top: ${(ITEM_HEIGHT + gap) * (start + index)}px; 
                position: absolute; 
                width: calc(100% - 40px); 
                left: 0;
            ">
            <a href="${product.ahref}" target="_blank"><img src="${product.img}" alt="Product Image"></a>
            <div class="info">
                <p><strong>Title:</strong><a href="${product.ahref}" target="_blank"> ${product.title}</a></p>
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Published:</strong> ${formatShortDate(product.date)}</p>
                <p><strong>Rank:</strong><span class="bsr"> ${cleanBsr(product.bsr)}<span></p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p style="justify-content: space-between !important;">
                    <span class='asin'><strong>ASIN:</strong> ${product.asin}</span>
                    <span class='deletes' data-row-index="${index}" style="cursor: pointer">
                        <i class="fas fa-trash-alt" aria-hidden="true"></i>
                    </span>
                </p>
            </div>
        </div>
    `).join('');

    containerProducts.innerHTML = `
        <div class="spacer" style="height: ${data.length * (ITEM_HEIGHT + gap)}px;">
            ${listHTML}
        </div>
    `;
}



function addWinner(product) {
    const listItem = document.createElement('div');
    listItem.classList.add('item');
    listItem.style.position = 'relative';
    listItem.style.width = 'calc(100% - 40px)';
    listItem.style.left = '0';

    // Create the inner HTML with a delete button and icon
    listItem.innerHTML = `
        <div class="info">
            <p><strong>Title:</strong><a href="${product.ahref}" data-image="${product.image}" target="_blank"> ${product.title}</a></p>
            <p><strong>Competition:</strong><span class="bsr">${product.competition} Products</span></p>
            <p style="justify-content: space-between !important;">
                <span class='asin'><strong>ASIN:</strong> ${product.asin}</span>
                <span class='delete' style="cursor: pointer">
                    <i class="fas fa-trash-alt" aria-hidden="true"></i>
                </span>
            </p>
        </div>
    `;

    // Append the item to the container
    winnerProducts.appendChild(listItem);

    // Add event listener to delete icon
    const deleteIcon = listItem.querySelector('.delete');
    deleteIcon.addEventListener('click', () => {
        listItem.remove();
    });

    preview(listItem);
}



function preview(element) {
    try {
        const tr = element.querySelector(".info p a");

        tr.addEventListener('mouseover', function () {
            if (!tr.getAttribute('data-image')) return;

            let existingPopup = document.querySelector('.popup');
            if (existingPopup) {
                existingPopup.remove();
            }

            const rect = tr.getBoundingClientRect();
            const imageSrc = tr.getAttribute('data-image');
            const root = document.documentElement;

            const popup = document.createElement('div');
            popup.classList.add('popup', 'arrow');
            popup.innerHTML = `<div class="popup-wrapper"><img src="${imageSrc}" alt="Preview of ${tr.textContent.trim()}" /></div>`;

            popup.style.position = 'absolute';
            let popupLeft = rect.right + 10;
            let popupTop = rect.top - 20;
            let arrowTop = 20;

            document.querySelector('.winnerContainer').appendChild(popup);

            if (rect.top > 300) {
                popupTop = rect.top - 270 ;
                arrowTop = 270;
            }
            if (popupLeft + popup.offsetWidth > window.innerWidth) {
                popupLeft = rect.left - popup.offsetWidth;
            }

            popup.style.left = popupLeft + 'px';
            popup.style.top = popupTop + 'px';
            root.style.setProperty('--arrow', arrowTop + 'px');

            tr.addEventListener('mouseout', (event) => {
                if (!popup.contains(event.relatedTarget)) {
                    popup.remove();
                }
            }, { once: true });
        });
    } catch (e) {
        //console.error(e);
    }
}


/*////////////////// CLASSES ///////////////////////////////*/

class Winner {
    constructor(title, ahref, asin, result , image) {
        this.title = this.cleanString(title);  // Product title
        this.asin = this.cleanString(asin);    // ASIN
        this.ahref = this.cleanString(ahref);  // Product link  // Brand name
        this.competition = this.cleanString(result);   // Competion for item
        this.image = this.cleanString(image);   // Competion for item
    }

    cleanString(value) {
        return typeof value === 'string'
            ? value
                .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '')  // Remove invisible chars
                .normalize('NFC')  // Normalize to a standard form
            : value;
    }

}

class Product {
    constructor(title, ahref, img, date, bsr, asin, price, brand,result) {
        this.title = this.cleanString(title);  // Product title
        this.date = this.cleanString(date);    // Date of listing or creation
        this.asin = this.cleanString(asin);    // ASIN
        this.bsr = this.cleanString(bsr);      // Best Sellers Rank
        this.ahref = this.cleanString(ahref);  // Product link
        this.img = this.cleanString(img);      // Item image
        this.price = this.cleanString(price);   // List price
        this.brand = this.cleanString(brand);   // Brand name
        this.competition = this.cleanString(result);   // Competion for item
    }

    cleanString(value) {
        return typeof value === 'string'
            ? value
                .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '')  // Remove invisible chars
                .normalize('NFC')  // Normalize to a standard form
            : value;
    }

}


/*//////////////////////////////// LOADING DATA ///////////////////////////////*/

async function loadAsins(url) {
    const asinSet = new Set();
    let dataHTMLs  = await fetchAndCleanContent(url, 1);
    let doc = parseHtml(dataHTMLs);
    doc.querySelectorAll(".s-result-item.s-asin").forEach(item => {
        const asin = item.getAttribute("mama-asin");
        if (asin && asin.length > 4 && !fetchedAsins.includes(asin)) {
            asinSet.add(asin);
        }
    });
    return Array.from(asinSet);
}

async function loadProductDataFor(data_asin){


    let dataHTMLs  = await fetchAndCleanContent(data_asin, 0);

    if(!dataHTMLs || dataHTMLs === 'undefined' ) return;

    loadProductDetails(dataHTMLs, data_asin);

    // Clean up remaining variables
    dataHTMLs = null;

    return;
		
}

async function loadProductDetails(data, data_asin) {
    try {
        let doc = parseHtml(data);
        let product = extractProductInfo(doc, data_asin);

        if(product){
            products.push(product);
            fetchedAsins.push(product.asin)
        }

        doc = product = null; // Clear references explicitly
        await delay(20);
    } catch (error) {
        //console.error("Error processing product details", error);
    } 
    
    doc = null; // Clear references explicitly
}