let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore('newBudgetStore', {autoIncrement: true});
}

request.onsuccess = function(event){
    db = event.target.result;
    if(navigator.online){uploadTransaction();}
}

request.onerror = function(event){console.log(event.target.errorCode);}

function saveRecord(record){
    const transaction = db.transaction(['newBudgetStore'], 'readWrite');
    const budgetObjectStore = transaction.objectStore('newBudgetStore');
    budgetObjectStore.add(record);
}

function uploadTransaction(){
    const transaction = db.transaction(['newBudgetStore'], 'readWrite');
    const budgetObjectStore = transaction.objectStore('newBudgetStore');
    const getAll = budgetObjectStore.getAll();
    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {Accept: 'application/json, text/plain, */*',}
            }).then((response) => response.json())
            .then(() => {
                const transaction = db.transaction(['newBudgetStore'], 'readWrite');
                const store = transaction.objectStore('newBudgetStore');
                store.clear;
            });
        }
    }
}

window.addEventListener('online', uploadTransaction);