document.addEventListener("DOMContentLoaded", function () {
    //API Links
    const companyAPI = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    let stockAPI = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=' //Add xxx to end of link (company symbol)
    //Add company to localStorage 
    let localStorage = window.localStorage;
    function addStorage(company) {
        localStorage.setItem(`${company.symbol}`, `${JSON.stringify(company)}`);
    }
    //Retrieve companies from local storage
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
    function fetchStockData(symbol) {
        fetch(`${stockAPI}${symbol}`)
            .then((resp) => resp.json())
            .then(data => displayStockData(data))
            .catch(error => console.error(error));
    }
    //If there is no storage this function is called to store each company value
    function storeCompanies(companies) {
        for (let company of companies) {
            loadedCompanies.push(company);
            addStorage(company);
        }
        populateList(loadedCompanies);
    }
    //Populates the list of companies from data obtained from API or local storage
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
            //Attribute is company symbol to be used in search function later
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
    function populateData(symbol) {
        console.log(symbol);
        let chosenCompany = loadedCompanies.find(company => company.symbol == symbol);
        console.log(chosenCompany);
        displayInformation(chosenCompany);
        displayMap(chosenCompany);
        fetchStockData(symbol);
        //displayStockData(chosenCompany);
        displayCharts(chosenCompany);
        displayNameSymbol(chosenCompany);
        displayFinancials(chosenCompany);
    }
    //Company Information
    function displayInformation(company) {
        //Clearing old information
        document.getElementById("generatedInfo").innerHTML = "";
        let logo = document.createElement('img');
        let link = document.createElement('a');
        let info = document.createElement('p');
        let linkText = document.createTextNode(`${company.name}`);
        info.innerText = `${company.description}
                Symbol: ${company.symbol}
                Name: ${company.name} 
                Sector: ${company.sector} 
                Subindustry: ${company.subindustry} 
                Address: ${company.address} 
                Exchange: ${company.exchange} 
                Website: `
        logo.setAttribute("src", `logos/${company.symbol}.svg`);
        //link.setAttribute("title", `${company.name}: Website Link`);
        link.setAttribute("href", `${company.website}`);
        link.setAttribute("alt", `${company.symbol} website`)
        link.appendChild(linkText);
        document.getElementById("generatedInfo").appendChild(logo);
        document.getElementById("generatedInfo").appendChild(info);
        info.appendChild(link);
        //document.getElementById("generatedInfo").appendChild(link);
    }
    //Map Generation
    function displayMap(company) {
        let map;
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: company.latitude, lng: company.longitude },
            zoom: 15
        });
    }
    //Stock Data
    function displayStockData(data) {
        let stockTable = document.getElementById('dataList');
        let openValues = [], closeValues = [], lowValues = [], highValues = [], volumeValues = [];
        //Clearing table from previous company
        while (stockTable.rows.length > 1) {
            stockTable.deleteRow(1);
        }
        //Clear avg table from previous company
        deleteCells('average');
        //Clear min table from previous company
        deleteCells('min');
        //Clear max table from previous company
        deleteCells('max');
        //Throw error if company symbol returned no result
        if (data.length == 0) {
            throw new Error('Company does not exist in company data API');
        }
        //Populate Stock Data Table
        for (d of data) {
            //Creating new row in table
            let row = stockTable.insertRow();
            //Creating new data cells in table from company API data
            let dateCell = row.insertCell(0);
            dateCell.innerHTML = `${d.date}`;
            let openCell = row.insertCell(1);
            openCell.innerHTML = `${d.open}`;
            let closeCell = row.insertCell(2);
            closeCell.innerHTML = `${d.close}`;
            let lowCell = row.insertCell(3);
            lowCell.innerHTML = `${d.low}`;
            let highCell = row.insertCell(4);
            highCell.innerHTML = `${d.high}`;
            let volumeCell = row.insertCell(5);
            volumeCell.innerHTML = `${d.volume}`;
            //Values put into an array for each datacell for max min and average calculation
            openValues.push(parseFloat(d.open));
            closeValues.push(parseFloat(d.close));
            lowValues.push(parseFloat(d.low));
            highValues.push(parseFloat(d.high));
            volumeValues.push(parseFloat(d.volume));
        }
        //Populate avg table row
        addCells('average', openValues, closeValues, lowValues, highValues, volumeValues);
        //Populate min table row
        addCells('min', openValues, closeValues, lowValues, highValues, volumeValues);
        //Populate max table row
        addCells('max', openValues, closeValues, lowValues, highValues, volumeValues);
    }
    //Function to delete cells added to minmaxavg
    function deleteCells(rowName) {
        let row = document.getElementById(`${rowName}`);
        let cells = row.cells;
        if (cells.length > 1) {
            for (let x = 0; x < 5; x++) {
                row.deleteCell(1);
            }
        }
    }
    //Function to add cells to minmaxavg
    function addCells(rowName, openValues, closeValues, lowValues, highValues, volumeValues) {
        let row = document.getElementById(`${rowName}`);
        let open = row.insertCell(1);
        let close = row.insertCell(2);
        let low = row.insertCell(3);
        let high = row.insertCell(4);
        let volume = row.insertCell(5);
        if (rowName == 'average') {
            open.innerHTML = getAverage(openValues, 7);
            close.innerHTML = getAverage(closeValues, 7);
            low.innerHTML = getAverage(lowValues, 7);
            high.innerHTML = getAverage(highValues), 7;
            volume.innerHTML = getAverage(volumeValues, 0);
        }
        else if (rowName == 'min') {
            open.innerHTML = getMin(openValues);
            close.innerHTML = getMin(closeValues);
            low.innerHTML = getMin(lowValues);
            high.innerHTML = getMin(highValues);
            volume.innerHTML = getMin(volumeValues);
        }
        else if (rowName == 'max') {
            open.innerHTML = getMax(openValues);
            close.innerHTML = getMax(closeValues);
            low.innerHTML = getMax(lowValues);
            high.innerHTML = getMax(highValues);
            volume.innerHTML = getMax(volumeValues);
        }
    }
    //Calculate the average from an array of numbers
    function getAverage(numbers, parseValue) {
        let avg = 0;
        for (let x = 0; x < numbers.length; x++) {
            avg += numbers[x];
        }
        avg = avg / numbers.length;
        return avg.toFixed(parseValue);
    }
    //Calculate the max from an array of numbers
    function getMax(numbers) {
        let max = 0;
        for (let x = 0; x < numbers.length; x++) {
            if (max < numbers[x]) {
                max = numbers[x];
            }
        }
        return max;
    }
    //Calculate the min from an array of numbers
    function getMin(numbers) {
        let min = numbers[0];
        for (let x = 0; x < numbers.length; x++) {
            if (min > numbers[x]) {
                min = numbers[x];
            }
        }
        return min;
    }
    //Charts
    function displayCharts(company) {

    }
    //Company Name + Symbol
    function displayNameSymbol(company) {
        //Clearing previous company data
        document.getElementById("name-symbol").innerHTML = '';
        let nameSymbol = document.createElement('h3');
        let description = document.createElement('p');
        description.innerText = `${company.description}`;
        nameSymbol.innerText = `${company.name} (${company.symbol})`;
        document.getElementById("name-symbol").appendChild(nameSymbol);
        document.getElementById("name-symbol").appendChild(description);
    }
    //Financials Needs to be a formatted table
    function displayFinancials(company) {
        let financialTable = document.getElementById('financialdata');
        if (company.financials == null) {
            throw new Error('Company finacials do not exist.');
        }
    }
    //Speech
    document.querySelector('#speak').addEventListener('click', (e) => {
        let speech = document.querySelector('#name-symbol p');
        const utterance = new SpeechSynthesisUtterance(`${speech.textContent}`);
        speechSynthesis.speak(utterance);
    });
    //Active 
    let loadedCompanies = new Array;
    let options = "";
    //Conditional to check for storage if storage is null fetch companies from API, if storage is not null then retrieve local storage.
    if (localStorage.length == 0) {
        fetchDataCompanies();
    }
    else {
        retrieveStorage();
    }
    console.log(loadedCompanies);
    for(let company of loadedCompanies){
        console.log(company.financials);
    }
});