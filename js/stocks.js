document.addEventListener("DOMContentLoaded", function () {
    //API Links
    const companyAPI = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    //Header - Credits

    //List of Companies
    let loadedCompanies = new Array;
    let options = "";
    function fetchDataCompanies() {
        fetch(companyAPI)
            .then((resp) => resp.json())
            .then(data => storeCompanies(data))
            .catch(error => console.error(error));
    }
    //will need conditional statement for stored or not stored and if loadedCompanies is empty/full
    function storeCompanies(companies){
    for(let company of companies)
      {
        loadedCompanies.push(company);
        console.log(company);
      }
      populateList(loadedCompanies);
    }
    fetchDataCompanies();
    function populateList(companies){
        //Empty any visible options first
        document.getElementById("companies").innerHTML ="";
        for(company of companies){
            let option = document.createElement('option');
            let symbol = document.createAttribute(`${company.symbol}`);
            option.setAttributeNode(symbol);
            option.text = `${company.symbol} | ${company.name}`;
            document.getElementById("companies").add(option);
            //Attribute will be company symbol to be used in search function later
        }
        options = document.querySelectorAll('option'); //Options available after the list has been loaded
    }
    //Event listener for filter
    document.getElementById("go").addEventListener("click", function(){
        //Filter Function
        let re = document.getElementById("field").value;
        const regexEx = loadedCompanies.filter(company => company.name.match(re));
        populateList(regexEx);
    });
    //Event listener for clear
    document.getElementById("clear").addEventListener("click", function(){
        populateList(loadedCompanies);
    });

    //Event listener for option select
    
    for(option of options)
    {
        option.addEventListener("change", function(){
            console.log("Option selected")
        });
    }
    //On go use the text in filter to search through array, use arrayfunction 

    //Find function for retrieving specific company data based on company symbol

    //Company Information

    //Map

    //Stock Data

    //Additional Information

    //Charts

    //Company Name + Symbol

    //Financials

    //localStorage 
    //stores key-value pairs. So to store a entire javascript object we need to serialize it first (with JSON.stringify, for example): 
    //You will need to check to see if local storage exists before you put everything into the array
});