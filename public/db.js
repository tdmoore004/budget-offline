let db;
const request = indexedDB.open("budget", 1);

console.log("Hit DB!")

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("pendingTrans", { autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    if (window.navigator.onLine) {
        checkIndexDb();
    };
};

request.onerror = (event) => {
    console.log("Error: " + event.target.error);
};

const saveRecord = (record) => {
    const transaction = db.transaction("pendingTrans", "readwrite");
    const store = transaction.objectStore("pendingTrans");
    store.add(record);
};

const checkIndexDb = () => {
    const transaction = db.transaction("pendingTrans", "readwrite");
    const store = transaction.objectStore("pendingTrans");
    const getAll = store.getAll()

    console.log(getAll);

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                response.json()
            }).then(() => {
                const transaction = db.transaction([ "pendingTrans" ], "readwrite");
                const store = transaction.objectStore("pendingTrans");
                store.clear();
            });
        };
    };
};

window.addEventListener("online", checkIndexDb);