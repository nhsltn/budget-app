// Function buat record button value
let val = 'inc'; // default value
function getButtonValue() {
    const type = document.getElementsByName("type");
    if (type[0].checked) {
        val = type[0].value
    } else if (type[1].checked) {
        val = type[1].value
    }
}

const budgetController = (function () {


    // Data Constructor
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = function (type) {
        let sum = 0; // default value
        // dari array sesuai tipe data diambil valuenya dan ditambahkan ke sum
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        // data sum disimpen ke datastructure lewat totals
        data.totals[type] = sum;
    }

    // Data Structure
    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
    };

    return {
        addItem: function (type, desc, val) {
            let newItem, ID;

            // buat id yang membedakan satu input dengan yang lain berdasarkan array.length
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }

            // Masukin item dari input field ke constructor berdasarkan input type
            if (type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val);
            }

            // push item baru yang tadi kedalem array
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index;


            ids = data.allItems[type].map(function (current) {
                return current.id
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                // splice is used to remove elements
                data.allItems[type].splice(index, 1);
            }


        },

        calculateBudget: function () {

            // Hitung Total Income dan Expense
            calculateTotal("inc");
            calculateTotal("exp");

            // Hitung Budget tersedia(current balance)
            data.budget = data.totals.inc - data.totals.exp
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
            };
        },

        testing: function () {
            console.log(data);

        }
    }

})();

const DOMController = (function () {

    const DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".input_description",
        inputValue: ".input_value",
        inputButton: ".addbtn",
        clearButton: ".clear",
        incomeContainer: ".income_list",
        expensesContainer: ".expenses_list",
        budgetLabel: ".budget_value",
        incomeLabel: ".budget-income_value",
        expensesLabel: ".budget-expense_value",
        container: ".table_incex",
    };

    const formatNumber = function (num, type) {

        var number_string = num.toString(),
            sisa = number_string.length % 3,
            rupiah = number_string.substr(0, sisa),
            ribuan = number_string.substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        return (type === "exp" ? "-" : "+") + " Rp. " + " " + rupiah;
    };

    return {
        getInput: function () {
            return {
                type: val,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            let htmlInject, newHTML, element;

            // Nambahin semantic HTML buat ditambahin ke file html
            if (type === "inc") {
                element = DOMStrings.incomeContainer
                htmlInject = '<div class="item clearfix" id="inc-%id%"> <div class="item_description">%description%</div> <div class="right clearfix"> <div class="item_value">%value%</div> <div class="item_delete"> <button class="item_delete-btn"> <i class="far fa-times-circle"></i></i> </button> </div> </div> </div>'
            } else if (type === "exp") {
                element = DOMStrings.expensesContainer
                htmlInject = '<div class="expenses_list"> <div class="item clearfix" id="exp-%id%"> <div class="item_description">%description%</div> <div class="right clearfix"> <div class="item_value">%value%</div> <div class="item_delete"> <button class="item_delete-btn"><i class="far fa-times-circle"></i></button> </div> </div> </div>'

            }
            // replace placeholder di html injectkan make data asli dari input field
            newHTML = htmlInject.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

            // nambahin semantic yang td dibuat dan udah direplace ke file html dengan DOM insertadjacentHTML
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);

        },

        deleteListItem: function (itemID) {
            const element = document.getElementById(itemID);
            element.parentNode.removeChild(element)

        },

        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);

            // ngubah hasil dari queryselectorall yg berupa list menjadi array
            fieldsArr = Array.prototype.slice.call(fields);

            // current value dari array yakni input desc dan value dikosongkan
            fieldsArr.forEach(function (current) {
                current.value = "";
            });
            // Stelah input focus langsung ke field pertama(Description)
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    }

})();


const controller = (function (budget, UI) {


    const setupEventListeners = function () {
        const DOM = UI.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.clearButton).addEventListener("click", UI.clearFields);


    };

    const updateBudget = function () {

        // Calculate Budget
        budget.calculateBudget();

        // Return Budgetnya
        const saldo = budget.getBudget();

        // Display Updated Budget ke UI
        UI.displayBudget(saldo);


    };

    const ctrlAddItem = function () {
        let input, newItem;

        // Get Input Value
        input = UI.getInput();

        // Menghindari tidak terisinya value dari kedua input fields
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // Dari Item dari input field di oper ke budget controller
            newItem = budget.addItem(input.type, input.description, input.value)

            // Display tambahan item ke UI berdasarkan budget controller ke UI
            UI.addListItem(newItem, input.type);

            // Clear fields setelah di input
            UI.clearFields();

            // Update Budget setiap kita add item
            updateBudget();
        }
    };

    const ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {

            //inc-1, dengan method split dipisahkan dengan (-) sehingga menjadi menjadi array ["inc", 1]
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item dari data sturcture di budget controller
            budget.deleteItem(type, ID);

            // Delete item list dari UI
            UI.deleteListItem(itemID);

            // Update Budget setelah salah satu item didelete
            updateBudget();


        }

    }



    return {
        init: function () {
            UI.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };



})(budgetController, DOMController);

controller.init();