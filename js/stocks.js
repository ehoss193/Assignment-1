document.addEventListener("DOMContentLoaded", function () {
    //API Links
    const companyAPI = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    //localStorage 
    //stores key-value pairs. So to store a entire javascript object we need to serialize it first (with JSON.stringify, for example): 
    //You will need to check to see if local storage exists before you put everything into the array
    let localStorage = window.localStorage;
    function addStorage(company) {
        localStorage.setItem(`${company.symbol}`, `${JSON.stringify(company)}`);
    }
    function retrieveStorage() {
        keys = Object.keys(localStorage);
        for (let x = 0; x < keys.length; x++) {
            loadedCompanies.push(JSON.parse(localStorage.getItem(keys[x])));
        }
        //Sorting companies by symbol following load from local storage
        loadedCompanies = loadedCompanies.sort(function (a, b) {
            if (a.symbol < b.symbol) {
                return -1
            }
            if (a.symbol > b.symbol) {
                return 1;
            }
            return 0;
        });
        populateList(loadedCompanies);
    }

    //Header - Credits

    //List of Companies
    function fetchDataCompanies() {
        fetch(companyAPI)
            .then((resp) => resp.json())
            .then(data => storeCompanies(data))
            .catch(error => console.error(error));
    }
    //will need conditional statement for stored or not stored and if loadedCompanies is empty/full
    function storeCompanies(companies) {
        for (let company of companies) {
            loadedCompanies.push(company);
            addStorage(company);
            console.log(company);
        }
        populateList(loadedCompanies);
    }
    function populateList(companies) {
        //Empty any visible options first
        document.getElementById("companies").innerHTML = "";
        for (company of companies) {
            let option = document.createElement('option');
            let symbol = document.createAttribute("id");
            symbol.value = `${company.symbol}`;
            option.setAttributeNode(symbol);
            option.text = `${company.name}`;
            document.getElementById("companies").add(option);
            //Attribute will be company symbol to be used in search function later
        }
        //Options available after the list has been loaded
        eventListenerOptions();
    }
    //Event listener for filter
    document.getElementById("go").addEventListener("click", function () {
        let re = document.getElementById("field").value;
        const regexEx = loadedCompanies.filter(company => company.name.match(re));
        populateList(regexEx);
    });
    //Event listener for clear
    document.getElementById("clear").addEventListener("click", function () {
        populateList(loadedCompanies);
    });

    //Event listener for option select
    function eventListenerOptions() {
        options = document.querySelectorAll('option');
        for (option of options) {
            option.addEventListener("click", function (e) {
                selectedOption = e.target;
                //Send this option.id to find function
                //find function sends array object to all of the other functions to populate the site
                populateData(selectedOption.id);
            });
        }
    }

    //Populate all elements after finding company based on symbol
    function populateData(symbol){
        let chosenCompany = loadedCompanies.find(company => company.symbol == symbol);
        displayInformation(chosenCompany);
        displayMap(company);
        displayStockData(company);
        displayCharts(company);
        displayNameSymbol(company);
        displayFinancials(company);
    }
    //Company Information
    function displayInformation(company) {
        //Clearing old information
        document.getElementById("generatedInfo").innerHTML = "";
        let logo = document.createElement('img');
        let link = document.createElement('a');
        let info = document.createElement('p');
        info.innerText = `${company.description}
                Symbol: ${company.symbol}
                Name: ${company.name} 
                Sector: ${company.sector} 
                Subindustry: ${company.subindustry} 
                Address: ${company.address} 
                Exchange: ${company.exchange} `
        logo.setAttribute("src", `logos/${company.symbol}.svg`);
        //link.setAttribute("title", `${company.name}: Website Link`);
        link.setAttribute("href", `${company.website}`);
        link.setAttribute("alt", `${company.symbol} website`)
        document.getElementById("generatedInfo").appendChild(logo);
        document.getElementById("generatedInfo").appendChild(info);
        document.getElementById("generatedInfo").appendChild(link);
    }
    //Map
    function displayMap(company) {

    }
    //Stock Data
    function displayStockData(company) {

    }
    //Charts
    function displayCharts(company) {

    }
    //Company Name + Symbol
    function displayNameSymbol(company) {

    }
    //Financials
    function displayFinancials(company) {

    }
    //Active code
    let loadedCompanies = new Array;
    let options = "";
    //Conditional to check for storage if storage is null fetch companies from API, if storage is not null then retrieve local storage.
    if (localStorage.length == 0) {
        fetchDataCompanies();
    }
    else {
        retrieveStorage();
    }
    console.log(loadedCompanies[0]);
});