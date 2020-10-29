// create variable to holddb connection
let db;

//establish a connection to IndexedDB database called 'budget
const request = indexedDB.open('budget_tracker', 1);


//create an object store table called `new_budget` and set it to have an auto incrementing primary key
db.createObjectStore('new_budget', {autoIncrement: true});


request.onsuccess = function(event) {
    // if db was successfully created with object store, 

    db = event.target.result;
    
    //check if app is online

    if (navigator.onLine) {
        uploadBudget();
    }
};

request.error = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
        const transaction = db.transaction(['new_budget'], 'readwrite');

    // acces the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to the store with add method
    budgetObjectStore.add(record);

}

function uploadBudget() {
    //open a transaction inside your new_budget db
    const transaction = db.transaction(["new_budget"], "readwrite")

    // access your budget object store
    const store = transaction.objectStore("new_budget");

    //get all records from storage and set it as a variable
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there's data stored inside indexDB's store, we will send it to the api server
        if(getAll.result.length > 0) {
            fetch('./api/transaction/bulk', {
                method: 'POST', 
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(['new_budget'], 'readwrite');

                    const store = transaction.objectStore("new_budget");

                    // clear all items in the store
                    store.clear();

                    alert('Budget transaction data has been fully submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

}

window.addEventListener("online", uploadBudget);