
let chosenProduct = null;
let domainUrl = '/https://www.amazon.com/';
let showbox = false;
let fetched_pages = 1;
let total_pages = 400;
let currentPage = 1;
let index = 0;
let isSearching = false;
let searchMode = true;
let lastPage = 400;
var bsrcheck = false;

// Default values

let products = [];
let failedPages = [];
let filteredProducts = [];
let tableProducts = [];
let asins = [];  

const sr_page = "&ref=sr_pg_";
const current_page ="&page=";
const productsPerPage = 100;

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

const marketConfig = {
	
  us: {
	name : 'US',
    domain: "https://www.amazon.com/",
    products: {
		tshirt: {name: "T-Shirts", rh: "&rh=p_6%3AATVPDKIKX0DER", code: '&hidden-keywords=Lightweight%2C+Classic+fit%2C+Double-needle+sleeve+and+bottom+hem+-Longsleeve+-Raglan+-Vneck+-Tanktop+', category:'&i=fashion-novelty'},
		tanktop: {name: "Tank-Tops", rh: '&rh=p_6%3AATVPDKIKX0DER', code: '&hidden-keywords=Tanktop+-Longsleeve', category:'&i=fashion-novelty'},
		vneck: {name: "V-Necks", rh: '&rh=p_6%3AATVPDKIKX0DER', code: '&hidden-keywords=%22V-Neck+T-Shirt%22+++%22Lightweight%2C+Classic+fit%2C+Double-needle+sleeve+and+bottom+hem%22+', category:'&i=fashion-novelty'},
		sweetshirt: {name: "Sweetshirts", rh: '&rh=p_6%3AATVPDKIKX0DER', code: '&hidden-keywords=\"8.5+oz%2C+Classic+fit%2C+Twill-taped+neck\"+\"sweatshirt\"+-hoodie+', category:'&i=fashion-novelty'},
		hoodie: {name: "Hoodies", rh: '&rh=p_6%3AATVPDKIKX0DER', code: '&hidden-keywords=8.5+oz%2C+Classic+fit%2C+Twill-taped+neck+hoodie+', category:'&i=fashion-novelty'},
		tumbler: {name: "Tumblers", rh: '&rh=n%3A16310091%2Cp_6%3AATVPDKIKX0DER', code: '&hidden-keywords=Dual+wall+insulated%3A+keeps+beverages+hot+or+cold+Stainless+Steel%2C+BPA+Free+Leak+proof+lid+with+clear+slider+', category:'&i=garden'},
		throwpillow: {name: "Throw Pillows", rh: '&rh=n%3A1063252%2Cp_6%3AATVPDKIKX0DER', code: '&hidden-keywords=100%25+spun-polyester+fabric+Double-sided+print+Filled+with+100%25+polyester+and+sewn+closed+Individually+cut+and+sewn+by+hand+Spot+clean%2Fdry+clean+only+', category:''}   
    },
    sortCode: { 
        featured: {name: "Featured", code: '&s=featured'}, 
        reviwes: {name: "Reviwes", code: '&s=review-rank'},
		bestsellers: {name: "Best Sellers", code: '&s=exact-aware-popularity-rank'},
		newest: {name: "Newest Arrivals", code: '&s=date-desc-rank&ref=sr_st_date-desc-rank'},
		pricelowtohigh: {name: "Price: Low to high", code: '&s=price-asc-rank&dc'},
		pricehightolow: {name: "Price: High to low", code: '&s=price-desc-rank&dc'},
	},
	recentCode: {
		defaultvalue: {name: "None", code: ''},
        last30days: {name: "Last 30 Days", code: '%2Cp_n_date_first_available_absolute%3A15196852011'},
        last90days: {name: "Last 90 Days", code: '%2Cp_n_date_first_available_absolute%3A15196853011'}, 
	}
  },
  
  de: {
	name : 'DE',
    domain: "https://www.amazon.de/",
    products: {
		tshirt: {name: "T-Shirts", rh: "&rh=n%2Cp_6%3AA3JWKAKR8XB7XF", code: '&hidden-keywords=%22Unifarben%3A+100%25+Baumwolle%3B+Grau+meliert%22+Alle+anderen+melierten+Farben+-Langarmshirt+', category:'&i=fashion'},
		tanktop: {name: "Tank-Tops", rh: '&rh=n%2Cp_6%3AA3JWKAKR8XB7XF', code: '&hidden-keywords=leichtes%2C+klassisch+geschnittenes+Tank+Top%2C+doppelt+gen%C3%A4hte+%C3%84rmel+und+Saumabschluss+', category:'&i=fashion'},
		vneck: {name: "V-Necks", rh: '&rh=n%2Cp_6%3AA3JWKAKR8XB7XF', code: '&hidden-keywords=leichtes%2C+klassisch+geschnittenes+T-Shirt%2C+doppelt+gen%C3%A4hte+%C3%84rmel+und+Saumabschluss+%22v-ausschnitt%22+', category:'&i=fashion'},
		hoodie: {name: "Hoodies", rh: '&rh=n%2Cp_6%3AA3JWKAKR8XB7XF', code: '&hidden-keywords=8.5 oz, Klassisch geschnitten, doppelt genähter Saum', category:'&i=fashion'}
    },
    sortCode: { 
        featured: {name: "Featured", code: '&s=featured'}, 
        reviwes: {name: "Reviwes", code: '&s=review-rank'},
		bestsellers: {name: "Best Sellers", code: '&s=exact-aware-popularity-rank'},
		newest: {name: "Newest Arrivals", code: '&s=date-desc-rank&ref=sr_st_date-desc-rank'},
		pricelowtohigh: {name: "Price: Low to high", code: '&s=price-asc-rank&dc'},
		pricehightolow: {name: "Price: High to low", code: '&s=price-desc-rank&dc'},
	},
	recentCode: {
		defaultvalue: {name: "None", code: ''}
	}
  },

  uk: {
	name : 'UK',
    domain: "https://www.amazon.co.uk/",
    products: {
		tshirt: {name: "T-Shirts", rh: "&rh=n%2Cp_6%3AA3P5ROKL5A1OLE", code: '&hidden-keywords=Lightweight%2C+Classic+fit%2C+Double-needle+sleeve+and+bottom+hem+-Longsleeve+-Raglan+-Vneck+-Tanktop+Solid+colors%3A+100%25+Cotton%3B+Heather+Grey%3A+90%25+Cotton%2C+10%25+Polyester%3B+All+Other+Heathers%3A+', category:'&i=fashion'},
		tanktop: {name: "Tank-Tops", rh: '&rh=n%2Cp_6%3AA3P5ROKL5A1OLE', code: '&hidden-keywords=Lightweight%2C+Classic+fit%2C+Double-needle+sleeve+and+bottom+hem+"tank+top"+', category:'&i=fashion'},
		vneck: {name: "V-Necks", rh: '&rh=n%2Cp_6%3AA3P5ROKL5A1OLE', code: '&hidden-keywords=Lightweight%2C%20Classic%20fit%2C%20Double-needle%20sleeve%20and%20bottom%20hem+"v-neck"+', category:'&i=fashion'},
		hoodie: {name: "Hoodies", rh: '&rh=n%2Cp_6%3AA3P5ROKL5A1OLE', code: '&hidden-keywords=Solid+colors%3A+80%25+Cotton%2C+20%25+Polyester%3B+Heather+Grey%3A+78%25+Cotton%2C+22%25+Poly%3B+Dark+Heather%3A+50%25+Cotton%2C+50%25+Polyester+\"hoodie\"', category:'&i=fashion'}
    },
    sortCode: { 
        featured: {name: "Featured", code: '&s=featured'}, 
        reviwes: {name: "Reviwes", code: '&s=review-rank'},
		bestsellers: {name: "Best Sellers", code: '&s=exact-aware-popularity-rank'},
		newest: {name: "Newest Arrivals", code: '&s=date-desc-rank&ref=sr_st_date-desc-rank'},
		pricelowtohigh: {name: "Price: Low to high", code: '&s=price-asc-rank&dc'},
		pricehightolow: {name: "Price: High to low", code: '&s=price-desc-rank&dc'}
	},
	recentCode: {
		defaultvalue: {name: "None", code: ''},
		last30days:{name: 'Last 30 days', code: '%2Cp_n_date_first_available_absolute%3A419164031'},
		last90days:{name: 'Last 90 days', code: '%2Cp_n_date_first_available_absolute%3A419165031'}
	}
  },

  es: {
	name : 'ES',
    domain: "https://www.amazon.es/",
    products: {
		tshirt: {name: "T-Shirts", rh: "&rh=n%2Cp_6%3AA1AT7YVPFBWXBL", code: '&hidden-keywords="+Color+solido%3A+100%25+Algodon%3B+Gris%3A+90%25+Algodon%2C+10%25+Poliester%3B+otros+colores%3A+50%25+Algodon%2C+50%25+Poliester"+"Ligero%2C+Encaje+clasico%2C+Manga+de+doble+puntada+y+bastilla+baja"+-sinmangas+-Longsleeve+-Raglan+-Vneck+-Tanktop+-CuelloV+', category:'&i=fashion'},
		tanktop: {name: "Tank-Tops", rh: "&rh=n%2Cp_6%3AA1AT7YVPFBWXBL", code: '&hidden-keywords=%22Colores+solidos%3A+100%25+Algodon%2C+Gris+Jaspeado%3A+90%25+Algodon%2C+10%25+Poliester%2C+Otros+Jaspeados+y+neones%3A+50%25+Algodon%2C+50%25+Poliester%22+', category:'&i=fashion'},
		vneck: {name: "V-Necks", rh: "&rh=n%2Cp_6%3AA1AT7YVPFBWXBL", code: '&hidden-keywords=%22Colores+solidos%3A+100%25+Algodon%2C+Gris+Jaspeado%3A+90%25+Algodon%2C+10%25+Poliester%2C+Otros+Jaspeados%3A+50%25+Algodon%2C+50%25+Poliester%22+-Raglan+', category:'&i=fashion'},
		hoodie: {name: "Hoodies", rh: "&rh=n%2Cp_6%3AA1AT7YVPFBWXBL", code: '&hidden-keywords=\"241+gr%2C+Encaje+clasico%2C+Cinta+de+sarga+en+el+cuello\"+\"Sudadera+con+Capucha\"+', category:'&i=fashion'}
    },
    sortCode: { 
        featured: {name: "Featured", code: '&s=featured'}, 
        reviwes: {name: "Reviwes", code: '&s=review-rank'},
		bestsellers: {name: "Best Sellers", code: '&s=exact-aware-popularity-rank'},
		newest: {name: "Newest Arrivals", code: '&s=date-desc-rank&ref=sr_st_date-desc-rank'},
		pricelowtohigh: {name: "Price: Low to high", code: '&s=price-asc-rank&dc'},
		pricehightolow: {name: "Price: High to low", code: '&s=price-desc-rank&dc'}
	},
	recentCode: {
		defaultvalue: {name: "None", code: ''},
		last30days:{name: 'Last 30 days', code: '%2Cp_n_date_first_available_absolute%3A831288031'},
		last90days:{name: 'Last 90 days', code: '%2Cp_n_date_first_available_absolute%3A831289031'}
	}
  },
  
  fr: {
	name : 'FR',
    domain: "https://www.amazon.fr/",
    products: {
		tshirt: {name: "T-Shirts", rh: "&rh=n%2Cp_6%3AA1X6FK5RDHNB96", code: '&hidden-keywords="+Couleurs+unies%3A+100%25+Coton%3B+Gris+chiné%3A+90%25+Coton%2C+10%25+Polyester%3B+Autres+couleurs+chinées%3A+50%25+Coton%2C+50%25+Polyester"+%2BT-Shirt+-Col+-Raglan+', category:'&i=fashion'},
		tanktop: {name: "Tank-Tops", rh: '&rh=n%2Cp_6%3AA1X6FK5RDHNB96', code: '&hidden-keywords=Couleurs+unies%3A+100%25+Coton%3B+Gris+chiné%3A+90%25+Coton%2C+10%25+Polyester%3B+Autres+couleurs+chinées%3A+50%25+Coton%2C+50%25+Polyester+Débardeur+', category:'&i=fashion'},
		vneck: {name: "V-Necks", rh: '&rh=n%2Cp_6%3AA1X6FK5RDHNB96', code: '&hidden-keywords=Couleurs+unies%3A+100%25+Coton%3B+Gris+chiné%3A+90%25+Coton%2C+10%25+Polyester%3B+Autres+couleurs+chinées%3A+50%25+Coton%2C+50%25+Polyester+Shirt+-Débardeur+Col+', category:'&i=fashion'},
		hoodie: {name: "Hoodies", rh: '&rh=n%3A465094031%2Cp_6%3AA1X6FK5RDHNB96', code: '&hidden-keywords=+', category:'&i=fashion'}
    },
    sortCode: { 
        featured: {name: "Featured", code: '&s=featured'}, 
        reviwes: {name: "Reviwes", code: '&s=review-rank'},
		bestsellers: {name: "Best Sellers", code: '&s=exact-aware-popularity-rank'},
		newest: {name: "Newest Arrivals", code: '&s=date-desc-rank&ref=sr_st_date-desc-rank'},
		pricelowtohigh: {name: "Price: Low to high", code: '&s=price-asc-rank&dc'},
		pricehightolow: {name: "Price: High to low", code: '&s=price-desc-rank&dc'}
	},
	recentCode: {
		defaultvalue: {name: "None", code: ''},
		last30days:{name: 'Last 30 days', code: '%2Cp_n_date_first_available_absolute%3A13827697031'},
		last90days:{name: 'Last 90 days', code: '%2Cp_n_date_first_available_absolute%3A13827698031'}
	}
  },
  
  it: {
	name : 'IT',
    domain: "https://www.amazon.it/",
    products: {
		tshirt: {name: "T-Shirts", rh: "&rh=n%2Cp_6%3AA11IL2PNWYJU7H", code: '&hidden-keywords="+Leggera%2C+taglio+classico%2C+maniche+con+doppia+cucitura+e+orlo+inferiore+"+%2BMaglietta+-lunghe+-Raglan+-Canotta+', category:'&i=fashion'},
		tanktop: {name: "Tank-Tops", rh: '&rh=n%2Cp_6%3AA11IL2PNWYJU7H', code: '&hidden-keywords=Tinta+unita%3A+100%25+Cotone%3B+Grigio+cenere%3A+90%25+Cotone%2C+10%25+Poliestere%3B+Altri+toni%3A+50%25+Cotone%2C+50%25+Poliestere+%2BCanotta+', category:'&i=fashion'},
		vneck: {name: "V-Necks", rh: '&rh=n%2Cp_6%3AA11IL2PNWYJU7H', code: '&hidden-keywords=Tinta+unita%3A+100%25+Cotone%3B+Grigio+Cenere%3A+90%25+Cotone%2C+10%25+Poliestere%3B+Altri+Toni%3A+50%25+Cotone%2C+50%25+Poliestere+Maglietta+Collo+Scollo+a+V+', category:'&i=fashion'},
		hoodie: {name: "Hoodies", rh: '&rh=n%2Cp_6%3AA11IL2PNWYJU7H', code: '&hidden-keywords=Tinta+unita%3A+80%25+Cotone%2C+20%25+Poliestere%2C+Grigio+cenere%3A+78%25+Cotone%2C+22%25+Poly%2C+Grigio+scuro%3A+50%25+Cotone%2C+50%25+Poliestere%2C+Felpa+con+Cappuccio+', category:'&i=fashion'}
    },
    sortCode: { 
        featured: {name: "Featured", code: '&s=featured'}, 
        reviwes: {name: "Reviwes", code: '&s=review-rank'},
		bestsellers: {name: "Best Sellers", code: '&s=exact-aware-popularity-rank'},
		newest: {name: "Newest Arrivals", code: '&s=date-desc-rank&ref=sr_st_date-desc-rank'},
		pricelowtohigh: {name: "Price: Low to high", code: '&s=price-asc-rank&dc'},
		pricehightolow: {name: "Price: High to low", code: '&s=price-desc-rank&dc'}
	},
	recentCode: {
		defaultvalue: {name: "None", code: ''},
		last30days:{name: 'Last 30 days', code: '%2Cp_n_date_first_available_absolute%3A490216031'},
		last90days:{name: 'Last 90 days', code: '%2Cp_n_date_first_available_absolute%3A490217031'}
	}
  }
    
};

let uiSettings = null;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

document.addEventListener('DOMContentLoaded', async () => {

    try{  
        const settings = await getUI();
        settings? uiSettings = settings : null;
             
    }catch(error){}
       
});

window.addEventListener('load', function(){
    if(uiSettings && uiSettings.isEnabled){
        if(checkBrowser()){

                createUI();
        }else if(!checkBrowser()){
            alert("Refresh the and check out the zip code")
        }
    }	
});


document.addEventListener('click', function(event) {
    // To prevent default actions
	
    let className = event.target.className;
    let idName = event.target.id;

	switch (idName || className) {
	  case 'searchBtn':
		search(0); 
		break;
	  case 'newTab':
		search(1); 
		break;		
	  case 'stopBtn':
		pause(); 
		break;
	  case 'filterBtn':
		filterData();
		break;
	  case 'exportBtn':
		exportData(tableProducts);
		break;
	case 'clearBtn':
		clearFilter();
		break;		
	  case 'search':
	  case 'loading':
	  case 'filter':
		searchFilter(className); 
		break;
	  case 'show':
	  case 'arrow':
	    showBox();
		break;
	  default:
		return ;
	}	
	
});

async function checkAndResume() {

    const storedSettings = await getSettings();
	if(!storedSettings) return;
    if (storedSettings && storedSettings.resume || storedSettings.resume ==='true') {
		await delay(5000)
        // Reset resume to false
        storedSettings.resume = false;
        await saveSettings(storedSettings,false);
		
		try{
			document.getElementById('checkCompetition').checked = storedSettings.bsrcheck;
			store_data = document.querySelector(".easy-merch-research-container #storeData").checked;
			document.querySelector(".item-container-row.search-filter").style.pointerEvents = "none";
			document.body.setAttribute("style","scrollbar-width: none; overflow: hidden");
		    document.querySelector(".easy-merch-research-main").style.display = "";
			document.querySelector("#searchBtn").style.display = "none";
			document.querySelector("#stopBtn").style.display = "";
			bsrcheck = storedSettings.bsrcheck;
			isSearching = true;
			showbox = false;
		}catch(e){
			//console.error(e);
			return;
		}
				
		domainUrl = storedSettings.dmUrl;
		chosenProduct =	storedSettings.chP;
        loadMultipleUrls(storedSettings.url,storedSettings.spage,storedSettings.epage,storedSettings.dbName,true)

    }
}

function generateAndDisplayURL() {
  const market = document.getElementById("market").value.toLowerCase();
  const product = document.getElementById("product").value.toLowerCase();
  const sort = document.getElementById("sortBy").value.toLowerCase();
  const recent = document.getElementById("recent").value.toLowerCase();
  const searchTerm = '&k='+document.getElementById("searchTerm").value;
  const sP = parseInt(document.getElementById("fromPage").value || 1);
  const eP = parseInt(document.getElementById("toPage").value || 400);

  const url = generateURL(market, searchTerm, sort, recent, product, sP, eP);
  
  return url;
}

function generateURL(market, searchTerm, sort, recent, product, sP, eP) {
  const marketInfo = marketConfig[market];

  // Validate if the market and product are valid
  if (!marketInfo || !marketInfo.products[product]) {
    return "Invalid market or product selection.";
  }

  // Retrieve domain and codes based on user selections
  const domain = `${marketInfo.domain}`;
  const sortCode = marketInfo.sortCode[sort].code;  // Access sortCode based on selected sort option
  const recentCode = marketInfo.recentCode[recent].code;
  const keywords = marketInfo.products[product].code;
  const section = `${marketInfo.products[product].category}${marketInfo.products[product].rh}`;
  
  const	cPro = `${marketInfo.products[product].name}`;
  const dbName = `Products_${marketInfo.name}_${marketInfo.products[product].name}`.replace(/ /g, '_');

  const intialUrl = `${domain}s?${searchTerm}${section}${recentCode}${sortCode}${keywords}`;
  // Assemble URL components
  const finalURL = {url: intialUrl, sP: sP, eP: eP , c: cPro, db:dbName, dM: domain};

  return finalURL;
}

function updateProductOptions() {
  const market = document.getElementById("market").value.toLowerCase();
  const productSelect = document.getElementById("product");

  // Clear existing options
  productSelect.innerHTML = "";

  if (marketConfig[market]) {
    // Populate products based on selected market
    Object.keys(marketConfig[market].products).forEach(productKey => {
      const option = document.createElement("option");
      option.value = productKey;
      option.textContent = marketConfig[market].products[productKey].name;
      productSelect.appendChild(option);
    });
  }

  updateSortRecentOptions();
}

function updateSortRecentOptions() {
  const market = document.getElementById("market").value.toLowerCase();
  const product = document.getElementById("product").value.toLowerCase();
  const sortSelect = document.getElementById("sortBy");
  const recentSelect = document.getElementById("recent");

  // Clear existing options
  sortSelect.innerHTML = "";
  recentSelect.innerHTML = "";

  if (marketConfig[market] && marketConfig[market].products[product]) {
    const sortCode = marketConfig[market].sortCode;
    const recentCode = marketConfig[market].recentCode;

    // Populate sort option
    Object.keys(sortCode).forEach(sortKey => {
      const option = document.createElement("option");
      option.value = sortKey;
      option.textContent = marketConfig[market].sortCode[sortKey].name;
      sortSelect.appendChild(option);
    });

    // Populate recent option
    Object.keys(recentCode).forEach(recentKey => {
      const option = document.createElement("option");
      option.value = recentKey;
      option.textContent = marketConfig[market].recentCode[recentKey].name;
      recentSelect.appendChild(option);  // Append to recentSelect
    });
  }
}

async function search(n) {
    try {
        let store_data = false;
        const language = '&language=en_GB';
        const eneratedUrlOb = generateAndDisplayURL();
        const { sP, eP, db, url, dM, c } = eneratedUrlOb;

        const [price, includeExclude] = await Promise.all([getPrice(), getHiddenKeys()]);
        const urlBase = `${url}${includeExclude}${price}${language}`;

        // Open new tab for quick search
        if (n === 1) {
            window.open(`${urlBase}${current_page}${sP}`, "_blank");
            return;
        }

        // Validate URL
        const full_url = await checkUrl(urlBase);
        if (!full_url.lien) {
            const market = full_url.market || 'amazon';
            showAlert('warning', '', `Please Go To (${market}) First!`);
            return;
        }

        // Prepare for search
        bsrcheck = document.querySelector(".easy-merch-research-container #checkCompetition").checked;
        store_data = document.querySelector(".easy-merch-research-container #storeData").checked;

        document.querySelector(".item-container-row.search-filter").style.pointerEvents = "none";
        document.querySelector("#searchBtn").style.display = "none";
        document.querySelector("#stopBtn").style.display = "";
        isSearching = true;

        // Save settings
        saveSettings(new Settings(null, null, null, null, false, null, null, null, null,0), false);

        // Perform search
        domainUrl = dM;
        chosenProduct = c;
        loadMultipleUrls(full_url.lien, sP, eP, db, store_data);
		
    } catch (error) {
        //console.error("Search function error:", error);
    }
}

async function checkUrl(u_s) {
    try {
        const currentUrl = window.location.href;
        const domainRegex = /([a-zA-Z0-9.-]+(?:\.com|\.de|\.es|\.it|\.fr|\.co\.uk))/;

        const currentMatch = currentUrl.match(domainRegex); // Match domain in current URL
        const inputMatch = u_s.match(domainRegex); // Match domain in provided URL (u_s)

        if (currentMatch) {
            if (u_s.toLowerCase().includes(currentMatch[0].toLowerCase())) {
                return { lien: u_s, market: inputMatch ? inputMatch[0] : null };
            }
        }

        return { lien: null, market: inputMatch ? inputMatch[0] : null };
    } catch (error) {
        //console.error("Error in checkUrl:", error);
    }

    return { lien: null, market: null };
}

async function getTerm(){

	const value = document.getElementById("searchTerm").value;
	const selectedValue = "&k="+value;
	return selectedValue;
	
}

async function getHiddenKeys(){

	const keys = (document.getElementById("hiddenKeywords").value).trim().replace(/[^a-zA-Z-]+/g, "+");
	const hideTM = document.getElementById("hideTrademarks").checked;
	const hidePL = document.getElementById("hidePolitics").checked;
	
	const politics = "+-voting+-vote+-kamala+-harris+-trump+-election+-biden+-joe";
	const tms = "+-marvel+-tupac+-tylor+-disney+-mtv+-barbie+-Nickelodeon+-Beetlejuice+-FanPrint+-Nickelodeon+-Peanuts+-NBC+-Mademark+-Pixar+-Hasbro+-Booba+-Daria+-DUNKIN+-Entrepreneur+-Kabillion+-LyricVerse+-MTV+-MYTHICAL+-ROBLOX+-ShibSibs+-TheSoul+-UglyDolls+-Barbie+-SANRIO+-Aerosmith+-Bengals+-Rebelde+-Fender+-Coors+-Pantera+-Pinkfong+-CampusLab+-Jeep+-Mattel+-Slayer+-Korn+-Sonic+-NBA+-NFL";
	let  keywords = "+"+keys;
	
	if(hidePL || hideTM){
		if(hidePL){keywords = keywords+ politics;}
		if(hideTM){keywords = keywords+tms}
	}
	
	return keywords;
}

async function getPrice(){

	const minPrice = parseFloat(document.getElementById("minPrice").value || 1);
	const maxPrice = parseFloat(document.getElementById("maxPrice").value || 100);
	
	if(parseFloat(maxPrice) >= parseFloat(minPrice)){ 
	
		return "&low-price="+minPrice+"&high-price="+maxPrice; 
		
	}	
}

function searchFilter(n){

const s = document.querySelector(".easy-merch-research-container .search-panel");
const f = document.querySelector(".easy-merch-research-container .filter-panel");
const sBtn = document.querySelector(".easy-merch-research-container .search-filter .search");
const fBtn = document.querySelector(".easy-merch-research-container .search-filter .filter");
const table = document.querySelector(".easy-merch-research-container .content-table");

// Toggle display based on checkbox state
if(n.includes("search")){
	s.style.display = "";
	f.style.display = "none";
	try{
		sBtn.classList.add("innerShadow");
		fBtn.classList.remove("innerShadow");
	}catch(a){//
	}

	searchMode = true;
}else if(n.includes("filter")){
	f.style.display = "";
	s.style.display = "none";
	try{
		fBtn.classList.add("innerShadow");
		sBtn.classList.remove("innerShadow");
	}catch(v){//
	}

	searchMode = false;
}

}

async function clearFilter() {
			var j=0;
				try{
					
					if (!filteredProducts || filteredProducts.length < 1) {
					  showAlert('warning', 'Attention!', 'No Filtred Products!');
					  return;
					}
					
					// Example of how to use the showAlert function with a callback
					showAlert('confirm', 'Clear All Filters', 'Are you sure you want to proceed?', async  function(result) {
						if (result) {
							
							document.querySelector(".easy-merch-research-container .content-table #table-body").innerHTML = '';
							await addRow(tableProducts.slice(1,100));
							filteredProducts = [];

						}
					});	
				}catch(e){
					//console.error("Filter Tabe By Search Term Failed: "+e);
				}

}

async function filterData() {
			var j=0;
				
				try{
					
					if (!tableProducts || tableProducts.length < 1) {
					  showAlert('warning', 'Attention!', 'No Products To Filter, Import Them First!');
					  return;
					}
					
					// Example of how to use the showAlert function with a callback
					showAlert('confirm', 'Apply Filters?', 'Are you sure you want to proceed?', async  function(result) {
						if (result) {
							
							filteredProducts = [];
							
							// Cleaning table 
							document.querySelector(".easy-merch-research-main #table-body").innerHTML="";
							
							var minDate = await customDate(document.getElementById("minDate").value || "01/01/2000", 1);
							var maxDate = await customDate(document.getElementById("maxDate").value || "12/12/2050", 1);
							var minBsr = parseFloat(document.getElementById("minBsr").value) || 0;
							var maxBsr = parseFloat(document.getElementById("maxBsr").value) || 10000000;
							var minPrice = parseFloat(document.getElementById("minfPrice").value) || 13;
							var maxPrice = parseFloat(document.getElementById("maxfPrice").value) || 55;
							var input = document.getElementById("filterTerm");
							var filter = input.value.toUpperCase();
								
							// Iterate over the table rows (start from 1 to skip header row)
							for (i= 0 ; i < tableProducts.length;i++) {
								try{
									
									let match = false;
									var title = tableProducts[i].title;
									var date = await customDate(tableProducts[i].date.trim(), 0);
									var price = parseFloat(tableProducts[i].price.replace(/[^\d\.]/g, ''));
									var bsr = parseFloat(tableProducts[i].bsr.replace(/[^\d\.]/g, ''));


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
									
									match? await filteredProducts.push(tableProducts[i]) : '';

									j++;
									
									if(j == 100){
										await delay(10);
										j = 0;
									}
								}catch(ee){
									////console.log("Something went wrong when filtering "+ee);
								}
							}
							// Show or hide the row based on match result
							await addRow(filteredProducts);
							showAlert('success',(filteredProducts.length > 0) ? 'Nice Job!':'Attention', filteredProducts.length+" Products found!");
					
							} else {
							////console.log("User canceled the action.");
							// Add code here to handle cancellation
						}
					});
				}catch(e){
					//console.error("Filter Table Failed: "+e);
				}
	
}

async function customDate(date,n){
	try{
			
		if(n == 0){
			
			// Create a Date object from the string
			const dateObject = new Date(date);
			// Format the date to YYYY/MM/DD
			const formattedDate = `
			${dateObject.getFullYear()}${(dateObject.getMonth() + 1).toString().padStart(2, '0')}${dateObject.getDate().toString().padStart(2, '0')}`;
			return formattedDate.replace(/[^\d\.]/g, '');
				
		}
		
		if(n == 1){
			return date.split("/")[2]+date.split("/")[0]+date.split("/")[1];	
		}
	}catch(e){
		////console.log("Invalid input");
	}

}

// Display loading message
function displayLoadingMessage(message) {
    document.querySelector("#msg").innerText = message;
}

// Sequentially load multiple URLs
async function loadMultipleUrls(url,sP,eP,dbName,store) {
    
	lastPage = eP;
	displayLoadingMessage("Processing......");
	
	let executions = 0;
	
    for (let i = sP; i <= total_pages && i <= lastPage && searchMode; i++) {

        if (!isSearching) break;
		if (executions > 20){
			if(store){
				saveSettings(new Settings(url,i,lastPage,dbName,true,domainUrl,chosenProduct,bsrcheck,0),true);
				pause();
				break;
			}
			executions = 0;
			await delay(1000);
		} 
		
        let sr = i > 1 ? i - 1 : i;
        await searchPageFetch(url+ sr_page + sr + current_page + i);

		if(document.querySelectorAll('#table-body tr').length < 100 ){
			addRow(products);
		}
		
		navigationRender(currentPage);

        if(store) await storeArray(products,dbName);

        displayLoadingMessage(`Current Page : ${i} Total Products : ${tableProducts.length}`);
		
		executions++;
					
    }

    stopSearch();
}


async function searchPageFetch(url) {
    try {

        // Pass the correct retryMode as the second argument
        let rawContent = await fetchAndCleanContent(url, 1, false);

        // Ensure rawContent is a string before applying replace
        if (typeof rawContent !== "string") {
            //console.error("Expected string but received:", typeof rawContent);
            return;
        }

        let asins = await asinList(rawContent);
        let productsContent = await loadProducts(asins);

        // Process and nullify each item
        for (let i = 0; i < productsContent.length; i++) {
            const product = productsContent[i];
            if (product) {
                processProductDetails(product.data, product.asin);
                // Nullify the processed item
                productsContent[i] = null;
            }
        }

        // Clean up remaining variables
        rawContent = asins = productsContent = null;

    } catch (error) {
        //console.error("Data fetch error: " + error);
    }
}

// Process the HTML content for ASINs and pagination details
async function asinList(content) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(content, "text/html");
    const asinSet = extractAsins(doc);
    var totalPages = extractTotalPages(doc);

    if (totalPages) {
        total_pages = parseInt(totalPages, 10);
    } 

	parser = doc = totalPages = null;
	return Array.from(asinSet);
}

// Extract ASINs from document
function extractAsins(doc) {
    const asinSet = new Set();
    doc.querySelectorAll(".s-result-item.s-asin:not(.AdHolder)").forEach(item => {
        const asin = item.getAttribute("mama-asin");
        if (asin && !asins.includes(asin) && asin.length > 4) {
            asinSet.add(asin);
        }
    });
    return asinSet;
}

// Extract pagination details
function extractTotalPages(doc) {
    const pagesElem = doc.querySelector(".s-pagination-item.s-pagination-disabled:not(.s-pagination-previous)");
    return pagesElem ? pagesElem.innerText : null;
}

// Load product data with retry logic and delay
async function loadProducts(asinsArray) {
    const productPromises = asinsArray.map(async (asin, index) => {
        if (!asins.includes(asin)) {
            return { data: await fetchAndCleanContent(asin, 0, true), asin: asin };
        }
    });

    return await Promise.all(productPromises);

}

// Function to get a random user agent from the array
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Process product details and extract relevant information
async function processProductDetails(data, asin) {
    try {
        let doc = parseHtml(data);
        let product = extractProductInfo(doc, asin);
        if (shouldAddProduct(product.bsr)) {
			////console.log(product);
            products.push(product);
			tableProducts.push(product);		
        }
		doc = product = null;
    } catch (error) {
		//console.error("Error processing product details for ASIN:", asin);
	}
}

// Parse HTML string into a document
function parseHtml(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, "text/html");
}

// Helper function to extract the product title based on specific keywords
function extractTitle(doc) {
	
	const keywords = ["Camiseta","shirt", "T-shirt", "Maglietta", "hoodie","Sweat à Capuche", "Sudadera con Capucha", "Felpa con Cappuccio","Débardeur","Camiseta sin Mangas", "tanktop","tank top", "tank-top", "Canotta", "Throw Pillow","Camiseta Cuello V","V-Neck","V-Ausschnitt","T-Shirt avec Col en V", "Maglietta con Collo a V","Sweatshirt","Tumbler"]; // Customize as needed
	
    try {
		
		const full_title = doc.title;
        const titleParts = doc.title.split(":");
		      
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
        //console.error("Error extracting title.");
    }
	return null;
}

// Extract product information from the document
function extractProductInfo(doc, asin) {
    
    try {
		
        const urlProduct = `${domainUrl}dp/${asin}`;

        return new Product(
            extractTitle(doc) || 'N/A',
            urlProduct,
            extractSrc(doc) || 'N/A',
            extractDetailText(doc, "Date") || "N/A",
            extractDetailText(doc, "Best Sellers") || "N/A",
            cleanString(asin) || 'N/A',
            extractPrice(doc) || "N/A"
        );
    } catch (error) {
        //console.error("Error extracting product info.");
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
		
        if (detailBullets && !chosenProduct.includes('Throw Pillows') && !chosenProduct.includes('Tumblers')){

			const details = detailBullets.querySelectorAll("ul li");

			// Use 'for...of' loop to break when the keyword is found
			for (const item of details) {
				const text = item.innerText.trim();

				if (text.toLowerCase().includes(keyword.toLowerCase())) { // Case insensitive match
					// Extract relevant text based on keyword
					const extractedText = text.split(":")[1]?.trim();  // Safe split to avoid error

					if (extractedText) {
						if (keyword === 'Date') {
							value = extractedText?.replace(/,/g, "").trim();
						} else if (keyword === 'Best Sellers') {
							value = extractedText?.split(" ")[0].replace(/[^\d.]/g, '').trim();
						}
					}

					break; // Exit loop once a match is found
				}
			}
			
		}else if(prodDetTable && (chosenProduct.includes('Throw Pillows') || chosenProduct.includes('Tumblers') ) ){

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
		
        return cleanString(value);
        
    } catch (e) {
        //console.error("Error extractting details!");
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

// Check if product should be added based on BSR
function shouldAddProduct(bsr) {
    try {
        const maxBsrInput = document.querySelector('#maxsBsr');
        const minBsrInput = document.querySelector('#minsBsr');

        const maxBsr = maxBsrInput ? parseFloat(maxBsrInput.value) : 100000000;
        const minBsr = minBsrInput ? parseFloat(minBsrInput.value) : 0;

        if (isNaN(maxBsr) || isNaN(minBsr)) {
            return true; // Return true to avoid excluding products due to an invalid range
        }

        return bsrcheck ? (parseFloat(bsr) >= minBsr && parseFloat(bsr) <= maxBsr) : true;
        
    } catch (e) {
        //console.error("Error in best sellers rank filter :", e);
    }
    
    return true;
}

// Fetch and clean HTML content
async function fetchAndCleanContent(url, retryMode, isProductPage) {
    // Fetch raw content with retry logic
    const rawContent = await fetchWithRetry(url, retryMode);

    // Extract the title tag from raw content
    const titleMatch = rawContent.match(/<title.*?<\/title>/is);

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

    // Return the cleaned content
    return cleanedContent;
}


// Ensure fetchWithRetry checks for retryMode
async function fetchWithRetry(asin, retryMode, retries = 3, delayMs = 500) {
    for (let i = 0; i < retries; i++) {
        try {
            await delay((Math.floor(Math.random() * 1) + 50));  // Small delay between requests

            // Choose URL based on retryMode
			let url = retryMode === 0 ? `${domainUrl}dp/${asin.replace(/\s+/g, '').replace(/\u200E/g, '')}` : asin;
           
            let response = await fetch(url, {
                method: 'GET',
                headers: {
					'User-Agent': getRandomUserAgent(),
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Clear-Site-Data': 'cache',
					'Accept-Encoding': 'br, zstd, gzip ,deflate'
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

// Modify addRow to accept only the products array needed for rendering
async function addRow(productsArray) {
    try {
        const tableBody = document.getElementById('table-body');

        // Create all rows in a batch first
        const rows = productsArray.map(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="${product.ahref}" alt="${product.img}" target="_blank">${shortenTitle(product.title)}</a></td>
                <td>${product.date}</td>
                <td>${cleanBsr(product.bsr)}</td>
                <td>${product.asin}</td>
                <td>${product.price}</td>
            `;
            return row;
        });

        // Append rows in a single batch for better performance
        rows.forEach(row => tableBody.appendChild(row));

        // Preview image on mouseover (non-blocking)
        rows.forEach(row => preview(row));

        // Optional delay to control UI load time without blocking
        await delay(10);
    } catch (e) {
        //console.error(e);
    }
}

async function navigationRender(page){
    try {
        const isAll = filteredProducts.length === 0;
        const data = isAll ? tableProducts : filteredProducts; // Use tableProducts or filteredProducts
        
        const start = (page - 1) * productsPerPage;
        const end = Math.min(page * productsPerPage, data.length);
		
		// Function to render pagination controls
		renderPagination()
		
        // Update total results text
        document.getElementById('total_results').textContent = `${start + 1}-${end} of ${data.length} results`;

    } catch (e) {
        //console.error('Render Products ', e);
    } 
	
}

// Function to render products for the current page
async function renderProducts(page) {
    try {
        const isAll = filteredProducts.length === 0;
        const data = isAll ? tableProducts : filteredProducts; // Use tableProducts or filteredProducts
        
        const start = (page - 1) * productsPerPage;
        const end = Math.min(page * productsPerPage, data.length);
        const productsToShow = data.slice(start, end);
        
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear existing rows

        await addRow(productsToShow); // Add new rows

        // Update total results text
        document.getElementById('total_results').textContent = `${start + 1}-${end} of ${data.length} results`;

    } catch (e) {
        //console.error('Render Products ', e);
    }    
}

// Function to render pagination controls
async function renderPagination() {
    try {
        const isAll = filteredProducts.length === 0;
        const data = isAll ? tableProducts : filteredProducts; // Use tableProducts or filteredProducts
        
        const paginationContainer = document.querySelector('.easy-merch-research-container .pagination');
        paginationContainer.innerHTML = ''; // Clear previous pagination controls

        const totalPages = Math.ceil(data.length / productsPerPage);
        const maxVisiblePages = 10;
        
        // Calculate start and end page numbers to display based on the current page
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if at the end of the pagination
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        const prevButton = document.createElement('span');
        prevButton.id = 'previous';
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => goToPage(currentPage - 1);
        prevButton.disabled = currentPage <= 1; // Disable if currentPage is 1
        prevButton.style.opacity = currentPage > 1 ? 1 : 0.5;
        paginationContainer.appendChild(prevButton);

        // Page buttons based on the calculated range
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('span');
            pageButton.textContent = i;
            pageButton.classList.add('page-button');
            pageButton.onclick = () => goToPage(i);
            if (i === currentPage) pageButton.classList.add('active');
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('span');
        nextButton.id = 'next';
        nextButton.textContent = 'Next';
        nextButton.onclick = () => goToPage(currentPage + 1);
        nextButton.disabled = currentPage >= totalPages; // Disable if currentPage is last page
        nextButton.style.opacity = currentPage < totalPages ? 1 : 0.5;
        paginationContainer.appendChild(nextButton);

    } catch (e) {
        //console.error('renderPagination error:', e);
    }
}

// Function to navigate to a specific page
function goToPage(page) {
    try {
        const isAll = filteredProducts.length === 0;
        const data = isAll ? tableProducts : filteredProducts; // Use tableProducts or filteredProducts
        
        // Check if the page is valid
        if (page < 1 || page > Math.ceil(data.length / productsPerPage)) return;
        currentPage = page;

        renderProducts(currentPage); // Render products for the current page
        renderPagination(); // Re-render pagination controls

    } catch (e) {
        //console.error('Go to page error:', e);
    }    
}

/////////////////////////////////////////////////////////////////////////////

function shortenTitle(title, maxLength = 70) {
	// Check if the title length exceeds the max length
	if (title.length <= maxLength) return title;

	// Find the last space within the allowed length to avoid cutting words in half
	const trimmedTitle = title.substring(0, maxLength).trim();
	const lastSpaceIndex = trimmedTitle.lastIndexOf(" ");

	// Return the title up to the last full word, followed by ellipsis
	return (lastSpaceIndex > 0 ? trimmedTitle.substring(0, lastSpaceIndex) : trimmedTitle) + '...';
}

// Function to add a new row to the table
async function appendProduct(pro) {
	try{
		  // Get the table body
		  const tableBody = document.getElementById('table-body');
	  
		  // Create a new row element
		  const row = document.createElement('tr');
		  
		  // Add new data cells to the row
		  row.innerHTML = `
			<td><a href="${pro.ahref}" alt="${pro.img}" target="_blank">${shortenTitle(pro.title)}</a></td>
			<td>${pro.date}</td>
			<td>${cleanBsr(pro.bsr)}</td>
			<td>${pro.asin}</td>
			<td>${pro.price}</td>
		  `;
		  // Append the new row to the table body
		  await tableBody.appendChild(row);
		  
		  // Add event listener for mouseover to preview the image
		  preview(row);	
		  
	}catch(e){
		//console.error(e);
	}	  
}

// Function to create a preview popup
function preview(row) {
	try{

		const tr = row.querySelector("td a");

		tr.addEventListener('mouseover', function() {

			// Prevent multiple popups from being created by checking if one already exists
			let existingPopup = document.querySelector('.popup');
			if (existingPopup) {
				existingPopup.remove();
			}

			const rect = tr.getBoundingClientRect();

			// Get the image source from the link's alt attribute
			const imageSrc = tr.getAttribute('alt');

			// Create the popup element
			const root = document.documentElement;
			const popup = document.createElement('div');
			popup.classList.add('popup','arrow');
			popup.innerHTML = `<div class="popup-wrapper"><img src="${imageSrc}" alt="Image" /></div>`;
							   
			// Set popup position relative to the link
			popup.style.position = 'absolute';
			let popupLeft = rect.right; // Right of the link
			let popupTop = rect.top - 20; // Align with the link's top
			let arrowTop = 20 ; // Align with the arrow's top

			// Append the popup to the body (but not visible yet)
			document.body.appendChild(popup);

			// Adjust if the popup overflows the viewport (on the bottom)
			if (rect.top > 300) {
				popupTop = rect.top - 300 + 30; // Shift upwards
				arrowTop = 270 ;
			}

			// Apply the adjusted position
			popup.style.left = popupLeft + 'px';
			popup.style.top = popupTop + 'px';

			// Style the arrow (optional: adjust based on the popup position)
			root.style.setProperty('--arrow', arrowTop + 'px');

			// Remove the popup when the mouse leaves
			tr.addEventListener('mouseout', () => {
				popup.remove();
			}, { once: true });
			
		});
		
	}catch(e){
		//console.error(e);
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
			</div>`;
		container.innerHTML = `
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
</div>
	<div class="easy-merch-research-container">
	<div class="item-container-row search-filter">
				<span class="search innerShadow">Search</span>
				<span class="filter">Filter</span>
	</div>
<!-- scroll container -->
<div class="scroller">
	<div class="item-container-row logo" style="margin-bottom:25px">
			<img src=''/>
	</div>	
    <!--- Search Panel -->
    <div class="search-panel" >
        <!-- First two fields - Search Term and Hidden Keywords -->
        <div class="item-container-column">
            <input type="text" id="searchTerm" placeholder="Search term"/>
            <textarea type="text" id="hiddenKeywords" placeholder="Hidden keywords........"></textarea>
        </div>

        <!-- Filters for Pages, Sort By, and Price Range -->
        <div class="item-container-row">
			<!-- Filters market place and product type -->
			<div class="item-container-column" id="mp">
					<label for="mp">Market and Product type :</label>
					<div class="item-container-row">
					<select id="market">
						<option value="US">US</option>
						<option value="UK">UK</option>
						<option value="DE">DE</option>
						<option value="ES">ES</option>
						<option value="FR">FR</option>
						<option value="IT">IT</option>
					</select>
					<select id="product">
						<option value="tshirt">T-Shirts</option>
						<option value="tanktop">Tank-Tops</option>
						<option value="vneck">V-Necks</option>
						<option value="sweetshirt">Sweetshirts</option>
						<option value="hoodie">Hoodies</option>
						<option value="tumbler">Tumblers</option>
						<option value="throwpillow">Throw-Pillows</option>
					</select>
					</div>
			</div>
            <div class="item-container-column">
                <label for="sorts">Sort By:</label>
				<div class="item-container-row" id="sorts">
					<select id="sortBy">
						<option value="featured">Featured</option>
						<option value="reviwes">Reviews</option>
						<option value="bestSellers">Best sellers</option>
						<option value="newest">Newest arrivals</option>
						<option value="priceLowToHigh">Price : Low to high</option>
						<option value="priceHighToLow">Price : High to low</option>
					</select>
					<select id="recent">
						<option value="defaultValue">None</option>
						<option value="last30days">Last 30 days</option>
						<option value="last90days">Last 90 days</option>
					</select>
				</div>
            </div>
            <div class="item-container-column">
                <label for="price_container">Price range:</label>
                <div class="item-container-row">
                    <input type="number" id="minPrice" placeholder="$1" value="1" min="0"/>
					<label for="maxPrice">To :</label>
                    <input type="number" id="maxPrice" placeholder="$33+" value="100" min="0"/>
                </div>
            </div>
			<div class="item-container-column">
                <label for="pages_container">Pages to scan :</label>
                <div class="item-container-row" id="pages_container">
                    <input type="number" id="fromPage" placeholder="1" value="1" min="1"/>
				    <label for="toPage">To :</label>
                    <input type="number" id="toPage" placeholder="400" value="400" min="1"/>
                </div>
            </div>
			<div class="item-container-column">
				<label for="bR">Bsr range :</label>
				<div class="item-container-row" id="bR">
					<input type="number" id="minsBsr" class="minBsr" placeholder="0" min="0" required="">
					<label for="maxsBsr">-</label>
					<input type="number" id="maxsBsr" class="maxBsr" placeholder="10000000+" min="0" required="">
				</div>
			</div>
        </div>

        <!-- Checkbox Options -->
        <div class="item-container-row">
			<div class="switch-container">
				<label class="switch" for="hideTrademarks">
					<input type="checkbox" id="hideTrademarks" checked/>
					<span class="slider round"></span>
				</label>
				<label for="hideTrademarks" >Hide Trademarks</label>
			</div>
			<div class="switch-container">
				<label class="switch" for="hidePolitics">
					<input type="checkbox" id="hidePolitics" checked/> 
					<span class="slider round"></span>
				</label>
				<label for="hidePolitics">Hide Politics</label>
			</div>
			<div class="switch-container">
				<label class="switch" for="storeData">
					<input type="checkbox" id="storeData" checked/> 
					<span class="slider round"></span>
				</label>
				<label for="storeData">Store Data</label>
			</div>
			<div class="switch-container">
				<label class="switch" for="checkCompetition">
					<input type="checkbox" id="checkCompetition" checked/> 
					<span class="slider round"></span>
				</label>
				<label for="checkCompetition">Filter BSRs </label>
			</div>
        </div>

        <!-- Search Button -->
        <div class="item-container-row">
            <button id="searchBtn">Search</button>
			<button id="stopBtn" style="display:none">Pause</button>
			<button id="newTab" style="display:flex;">Open<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 4px;"><path d="M14 3h7v7h-2V6.414l-8.293 8.293-1.414-1.414L17.586 5H14V3zM5 5h6V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-6h-2v6H5V5z"/></svg></button>
			<p id="msg"></p>
        </div>
    </div>
	
	 
	<!--- Filter Panel --->
	
	 <div class="filter-panel" style="display:none">
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
			<span id="clearBtn">Clear Filters</span>
			<span id="exportBtn">Export Csv</span>				
        </div>
    </div>

	
	
    <!-- Results Table -->
    <table class="content-table" id="sortableTable">
	
        <thead>
            <tr>
			    <th>Title</th>
				<th>Release Date</th>
				<th>BSR</th>
				<th>Asin</th>
				<th>Price</th>
            </tr>
        </thead>
        <tbody id="table-body">
        </tbody>
    </table>
	
	<!-- Windowing or pagination -->
	<div class="pagination-container item-container-row">
        <div class="pagination item-container-row">
		
        </div>

        <div class="results item-container-row">
			<span id="total_results"></span>		
        </div>		
    </div>
</div>
</div>
		`;
		document.body.appendChild(div);
		document.body.appendChild(container);
		
		// setting up listeners ///////////////////////////////////////////////////
		
		document.querySelector(".close-btn").onclick = closeAlert;
		document.querySelector(".logo img").src = getImage('logo1');
		document.getElementById("market").addEventListener("change", updateProductOptions);
		document.getElementById("product").addEventListener("change", updateSortRecentOptions);
		
		checkAndResume();
		
		
	
	}catch(e){
		//console.log("Couldn't Create User Interface",e);
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
	try{
		document.body.setAttribute("style","scrollbar-width: none; overflow: hidden");
		document.querySelector(".easy-merch-research-main").style.display = "";
		showbox = false;	
	}catch(e){
		//console.error(e);
	}	
}

async function removeAtt(){
	try{
		document.body.removeAttribute('style');
		document.querySelector(".easy-merch-research-main").style.display = "none";
		showbox = true;	
	}catch(e){
		//console.error(e);
	}	
}

async function pause(){
	try{
		isSearching = false;
		document.querySelector("#stopBtn").innerText = "Wait...";
	}catch(e){
		//console.log("Can't stop search process ... "+e)
	}
   
}
 
async function stopSearch(){
	try{
		isSearching = false;
		document.querySelector(".item-container-row.search-filter").style.pointerEvents = "";
		document.querySelector("#searchBtn").style.display = "";
		document.querySelector("#stopBtn").style.display = "none";
		
		if(document.querySelector("#msg").innerText.includes("Processing.......")){
			document.querySelector("#searchBtn").style.pointerEvents = "none";
		}
		
		if(!document.querySelector("#msg").innerText.includes("Processing.........")){
			document.querySelector("#searchBtn").style.pointerEvents = "";
		}
	}catch(e){
		//console.log("Can't stop search process ... "+e)
	}
   
}    

async function exportData() {
  try {
    const isAll = filteredProducts.length === 0;
    const data = isAll ? tableProducts : filteredProducts;

    if (!data || data.length < 1) {
      showAlert('warning', 'Attention!', 'No Products To Export.');
      return;
    }

    showAlert('confirm', 'Export Products?', isAll ? 'Export all products?' : 'Export filtered products?', async function (result) {
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
            //console.warn(`Error trying to load zipcode ${attempt + 1}`);
        }
    }

    if (!value) {
        //console.error("Check the zipcode please!");
        storedSettings.refresh = 0; // Reset retry count after failure
        await saveSettings(storedSettings);
    }

    return value;
}

////////////////////////////////////////////////////////////////////////////////////////////

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
                    } else {
                       // console.log("Port disconnected successfully.");
                    }
                });
            });
        } catch (error) {
            attempt++;
           // console.warn(`Attempt ${attempt} failed: ${error}`);

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

// Function to store data using the retrieved tab ID
async function storeArray(dataArray, databaseName) {
    try {
        if (!databaseName || typeof databaseName !== 'string') {
            //console.error('Invalid database name!');
            return;
        }

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            //console.warn('Data array is empty or invalid!');
            return;
        }

        const tabId = await requestTabId(); // Request tab ID

        if (tabId) {
            const port = chrome.runtime.connect({ name: "dataChannel" });

            // Send `tabId` with data
            port.postMessage({ action: "storeData", data: dataArray, name: databaseName, tabId });

            // Setup a timeout to close the port if no response within a specified time
            const timeoutId = setTimeout(() => {
                //console.warn("Port disconnected due to timeout.");
                port.disconnect();
            }, 30000); // Adjust timeout duration as needed

            // Listen for messages from the background script on this port
            port.onMessage.addListener((response) => {
                clearTimeout(timeoutId); // Clear timeout if response is received

                if (response.status === 'success') {
                    products = [];
                } else {
                    //console.error("Data storage failed", response.message);
                }

                port.disconnect(); // Close port after handling the response
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
    } catch (error) {
        //console.error("Error in storeArray function:", error);
    }
}


// Function to store data using the retrieved tab ID
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
                //console.log("Settings saved successfully");

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

async function closeTabAndOpenNew(url) {
        try {
            return await new Promise((resolve, reject) => {
                const port = chrome.runtime.connect({ name: "closeTabs" });
				
				// Open new page
                window.open(`${url}`, "_blank");
				
                // Send request for tab ID
                port.postMessage({ action: "closeTabs",url : url });

				port.disconnect();
				
                // Handle disconnection errors
                port.onDisconnect.addListener(() => {
                    if (chrome.runtime.lastError) {
                        //console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError.message);
                    } else {
                        //console.log("Port disconnected successfully.");
                    }
                });
            });
        } catch (error) {
            //console.warn(`failed: ${error}`);
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
                       // console.error("Disconnected due to an error:", chrome.runtime.lastError.message);
                        reject(new Error("Disconnected due to an error"));
                    } else {
                       // console.log("Port disconnected successfully.");
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


// Function to show the custom alert
function showAlert(type, title, message, callback) {
	
	try{
		
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
				alertTitle.style.color = "#74cf31"; // Checkmark 
				alertIcon.innerHTML = "";
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
			closeAlert();
			if (callback) callback(true);  // Call the callback with `true` for confirmation
		};

		cancelBtn.onclick = () => {
			closeAlert();
			if (callback) callback(false);  // Call the callback with `false` for cancellation
		};	
		
	}catch(e){
		//console.error(e);
	}

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

/// Classes 
	
class Product {
    constructor(title, ahref, img, date, bsr, asin, price) {
        this.title = this.cleanString(title);  // Product title
        this.date = this.cleanString(date);    // Date of listing or creation
        this.asin = this.cleanString(asin);    // ASIN
        this.bsr = this.cleanString(bsr);      // Best Sellers Rank
        this.ahref = this.cleanString(ahref);  // Product link
        this.img = this.cleanString(img);                        // Don't clean image URL
        this.price = this.cleanString(price);   // Handle price with currency
    }

    cleanString(value) {
        return typeof value === 'string'
            ? value
                .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\u200B\u200C\u2028\u2029]/g, '')  // Remove invisible chars
                .normalize('NFC')  // Normalize to a standard form
            : value;
    }

}

//Since the browser does't give the ability for developers to free memory
//After fetching x pages should save the last page and close tab to free memory
//Resume in a new tab

class Settings {
    constructor(url, spage, epage, dbName, resume, dmUrl, chP,bsrcheck, retries) {
        this.url = url;           // The starting URL
        this.spage = spage;       // Start page
        this.epage = epage;       // End page
        this.dbName = dbName;     // Database name
        this.chP = chP;           // Custom property
        this.dmUrl = dmUrl;       // Download manager URL
        this.resume = resume;     // Resume flag (boolean)
        this.asin = "resumeState"; // Key property for IndexedDB
		this.bsrcheck = bsrcheck; // Bsr filter (boolen)
		this.refresh = retries;
    }
}







