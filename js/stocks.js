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
            .then(data => verifyStockData(data))
            .catch(error => console.error(error));
    }
    function verifyStockData(data) {
        //Check to see if data exists for the company
        if (data.length == 0) {
            //Hide the stock data element if there is no data
            document.querySelector('#stockData').classList.add("error");
        }
        else {
            document.querySelector('#stockData').classList.remove('error');
            companyData = data;
            sortStockData(companyData, "Date");
            //Creating line Chart before data is sorted
            lineChart(companyData);
        }
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
                populateData(selectedOption.id);
            });
        }
    }
    //Event listener for stock data 
    function eventListenerSort() {
        let sortBy;
        stockTableHeadings = document.querySelectorAll("#dataList th");
        for (heading of stockTableHeadings) {
            heading.addEventListener("click", function (e) {
                sortBy = e.target.innerHTML;
                sortStockData(companyData, sortBy);
            });
        };
    }
    //Event listeners for credits
    document.getElementById("creditsLabel").addEventListener("mouseover", function () {
        //Need to remove initial class, if hidecredits was on at the start would fade in on refresh.
        document.getElementById("credits").classList.remove("invisibleCredits");
        document.getElementById("credits").classList.toggle("showCredits");
        document.getElementById("credits").classList.toggle("hideCredits");
    });
    document.getElementById("creditsLabel").addEventListener("mouseout", function () {
        setTimeout(function () {
            document.getElementById("credits").classList.toggle("showCredits");
            document.getElementById("credits").classList.toggle("hideCredits");
        }, 5000);
    });
    //Event listeners for view chart
    document.getElementById("viewcharts").addEventListener("click", function () {
        document.querySelector(".grid-container-a").classList.toggle("hidden");
        document.querySelector(".grid-container-a").classList.toggle("visible");
        document.querySelector(".grid-container-b").classList.toggle("hidden");
        document.querySelector(".grid-container-b").classList.toggle("visible");
    });
    document.getElementById("close").addEventListener("click", function () {
        document.querySelector(".grid-container-a").classList.toggle("hidden");
        document.querySelector(".grid-container-a").classList.toggle("visible");
        document.querySelector(".grid-container-b").classList.toggle("hidden");
        document.querySelector(".grid-container-b").classList.toggle("visible");
    });
    //Populate all elements after finding company based on symbol
    function populateData(symbol) {
        //Once a company is selected view charts button is visible
        document.querySelector('#viewcharts').classList.remove("hidden");
        let chosenCompany = loadedCompanies.find(company => company.symbol == symbol);
        displayInformation(chosenCompany);
        displayMap(chosenCompany);
        fetchStockData(symbol);
        //Add event listener to headings once the company has been selected
        eventListenerSort();
        //displayStockData(chosenCompany);
        //displayCharts(chosenCompany, companyData);
        displayNameSymbol(chosenCompany);
        barChart(chosenCompany);
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
        info.innerHTML = `${company.description}<br>
        <b>Symbol:</b> ${company.symbol} <br>
        <b>Name:</b> ${company.name} <br>
        <b>Sector:</b> ${company.sector} <br>
        <b>Subindustry:</b> ${company.subindustry} <br>
        <b>Address:</b> ${company.address} <br>
        <b>Exchange:</b> ${company.exchange} <br>
        <b>Website:</b> `
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
    //Sort Stock Data
    function sortStockData(data, sortBy) {
        let sortedData;
        if (sortBy == "Open") {
            sortedData = data.sort((a, b) => {
                return a.open < b.open ? -1 : 1;
            });
        }
        else if (sortBy == "Close") {
            sortedData = data.sort((a, b) => {
                return a.close < b.close ? -1 : 1;
            });
        }
        else if (sortBy == "Low") {
            sortedData = data.sort((a, b) => {
                return a.low < b.low ? -1 : 1;
            });
        }
        else if (sortBy == "High") {
            sortedData = data.sort((a, b) => {
                return a.high > b.high ? -1 : 1;
            });
        }
        else if (sortBy == "Volume") {
            sortedData = data.sort((a, b) => {
                return a.volume < b.volume ? -1 : 1;
            });
        }
        else {
            //Default is to sort by date
            sortedData = data.sort((a, b) => {
                return a.date < b.date ? -1 : 1;
            });
        }
        displayStockData(sortedData);
    }
    //Stock Data
    function displayStockData(data) {
        let stockTable = document.getElementById('dataList');
        let openValues = [], closeValues = [], lowValues = [], highValues = [], volumeValues = [];
        //Clearing table from previous company
        while (stockTable.rows.length > 1) {
            stockTable.deleteRow(1);
        }
        //Clear avg row from previous company
        deleteCells('average');
        //Clear min row from previous company
        deleteCells('min');
        //Clear max row from previous company
        deleteCells('max');
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
        //Creating minMax chart with data given already put into arrays
        minmaxChart(openValues, closeValues, lowValues, highValues);
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
    //Bar Chart
    function barChart(company) {
        let revenue = [], earnings = [], assets = [], liabilities = [];
        if (company.financials == null) {
            for (let x = 0; x < 3; x++) {
                revenue[x] = "0";
                earnings[x] = "0";
                assets[x] = "0";
                liabilities[x] = "0";
            }
        }
        else {
            for (let x = 0; x < 3; x++) {
                revenue[x] = `${company.financials.revenue[x]}`;
                earnings[x] = `${company.financials.earnings[x]}`;
                assets[x] = `${company.financials.assets[x]}`;
                liabilities[x] = `${company.financials.liabilities[x]}`;
            }
        }
        //Removing old canvas if one exists and creating new one
        let barDiv = document.getElementById("barChart");
        while (barDiv.hasChildNodes()) {
            barDiv.removeChild(barDiv.firstChild);
        }
        let barCanvas = document.createElement('canvas');
        barCanvas.id = "bar";
        barDiv.appendChild(barCanvas);
        let myBarChart = new Chart(document.getElementById("bar"), {
            type: 'bar',
            data: {
                labels: ['2017', '2018', '2019'],
                datasets: [
                    {
                        label: ": Revenue",
                        backgroundColor: "LightCyan",
                        hoverBackgroundColor: "LightCyan",
                        data: [revenue[0], revenue[1], revenue[2]]
                    },
                    {
                        label: ": Earnings",
                        backgroundColor: "LightSalmon",
                        hoverBackgroundColor: "LightSalmon",
                        data: [earnings[0], earnings[1], earnings[2]]
                    },
                    {
                        label: ": Assets",
                        backgroundColor: "LightYellow",
                        hoverBackgroundColor: "LightYellow",
                        data: [assets[0], assets[1], assets[2]]
                    },
                    {
                        label: ": Liabilities",
                        backgroundColor: "PowderBlue",
                        hoverBackgroundColor: "PowderBlue",
                        data: [liabilities[0], liabilities[1], liabilities[2]]
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        }
                    }]
                }
            }
        });
    }
    //Replacement for candle chart since installation of plugin failed repeatedly
    function minmaxChart(openValues, closeValues, lowValues, highValues) {
        let minmaxDiv = document.getElementById("minmaxChart");
        while (minmaxDiv.hasChildNodes()) {
            minmaxDiv.removeChild(minmaxDiv.firstChild);
        }
        let minmaxCanvas = document.createElement('canvas');
        minmaxCanvas.id = "minmax";
        minmaxDiv.appendChild(minmaxCanvas);
        let myMinMaxChart = new Chart(document.getElementById("minmax"), {
            type: 'horizontalBar',
            data: {
                labels: ['Min', 'Max', 'Avg'],
                datasets: [
                    {
                        label: ": Open",
                        backgroundColor: "Cornsilk",
                        hoverBackgroundColor: "Cornsilk",
                        data: [getMin(openValues), getMax(openValues), getAverage(openValues)]
                    },
                    {
                        label: ": Close",
                        backgroundColor: "DarkSlateGrey",
                        hoverBackgroundColor: "DarkSlateGrey",
                        data: [getMin(closeValues), getMax(closeValues), getAverage(closeValues)]
                    },
                    {
                        label: ": Low",
                        backgroundColor: "Tomato",
                        hoverBackgroundColor: "Tomato",
                        data: [getMin(lowValues), getMax(lowValues), getAverage(lowValues)]
                    },
                    {
                        label: ": High",
                        backgroundColor: "MediumSeaGreen",
                        hoverBackgroundColor: "MediumSeaGreen",
                        data: [getMin(highValues), getMax(highValues), getAverage(highValues)]
                    }
                ]
            },
            options: {
                indexAxis: 'y'
            }
        });
    }
    //Line chart
    function lineChart(data) {
        let lineDiv = document.getElementById("lineChart");
        let closeData = [], volumeData = [];
        //Removing old canvas if one exists and creating new one
        while (lineDiv.hasChildNodes()) {
            lineDiv.removeChild(lineDiv.firstChild);
        }
        //Retrieving Data
        for (let x = 0; x <= 60; x += 10) {
            closeData.push(data[x].close);
            volumeData.push(data[x].volume);

        }
        let lineCanvas = document.createElement('canvas');
        lineCanvas.id = "line";
        lineDiv.appendChild(lineCanvas);
        let myLineChart = new Chart(document.getElementById("line"), {
            type: 'line',
            data: {
                labels: ["2019-01-02", "2019-01-16", "2019-01-31", "2019-02-14", "2019-03-01", "2019-03-15", "2019-03-28"],
                datasets: [{
                    data: [closeData[0], closeData[1], closeData[2], closeData[3], closeData[4], closeData[5], closeData[6]],
                    label: "Close (Left)",
                    yAxisID: 'A',
                    borderColor: "SkyBlue",
                    borderWidth: 10,
                    fill: false
                }, {
                    data: [volumeData[0], volumeData[1], volumeData[2], volumeData[3], volumeData[4], volumeData[5], volumeData[6]],
                    label: "Volume (Right)",
                    yAxisID: 'B',
                    borderColor: "SandyBrown",
                    borderWidth: 10,
                    fill: false
                }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        position: 'left',
                    }, {
                        id: 'B',
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            max: 10000000,
                            min: 0
                        }
                    }]
                }
            }
        });
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
    //Financials
    function displayFinancials(company) {
        let financialTable = document.getElementById('financialdata');
        //Clearing table from previous company
        while (financialTable.rows.length > 1) {
            financialTable.deleteRow(1);
        }
        //Error thrown if financials is null
        if (company.financials == null) {
            let row = financialTable.insertRow();
            //Displaying does not exist (DNE) when no financials exist
            for (let x = 0; x < 5; x++) {
                let errorCell = row.insertCell(x);
                errorCell.innerHTML = "DNE";
            }
            throw new Error('Company finacials do not exist.');
        }
        //Financials is three years of data so array iterates 3 times
        for (let x = 2; x >= 0; x--) {
            let row = financialTable.insertRow();
            let yearCell = row.insertCell(0);
            yearCell.innerHTML = `$${company.financials.years[x].toFixed(2)}`;
            let revenueCell = row.insertCell(1);
            revenueCell.innerHTML = `$${company.financials.revenue[x].toFixed(2)}`;
            let earningsCell = row.insertCell(2);
            earningsCell.innerHTML = `$${company.financials.earnings[x].toFixed(2)}`;
            let assetsCell = row.insertCell(3);
            assetsCell.innerHTML = `$${company.financials.assets[x].toFixed(2)}`;
            let liabilitiesCell = row.insertCell(4);
            liabilitiesCell.innerHTML = `$${company.financials.liabilities[x].toFixed(2)}`;
        }
    }
    //Speech
    document.querySelector('#speak').addEventListener('click', (e) => {
        let speech = document.querySelector('#name-symbol p');
        const utterance = new SpeechSynthesisUtterance(`${speech.textContent}`);
        speechSynthesis.speak(utterance);
    });
    //Active 
    let loadedCompanies = [];
    let companyData = [];
    let options = "";
    //Conditional to check for storage if storage is null fetch companies from API, if storage is not null then retrieve local storage.
    if (localStorage.length == 0) {
        fetchDataCompanies();
    }
    else {
        retrieveStorage();
    }
    //Need to add event listener for table headings to change sort order 
    //We can send the data to a function called sort data with the initial sort type being 'date'
    //The sort function can then send the data to the display function
    //Need to add css to indicate the headings are clickable
    //Need to make company Information, stock data and map hidden until company is clicked.
    //Need to reorganize code so like items and related items are together
    //For loading just make a function
    //If the financial data does not exist you must hide the financial grid item
});