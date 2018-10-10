// BUDGET CONTROLLER
var budgetController = (function() {
    
    var data = {
        allItems: {
            income: [],
            expense: []
        },
        totals: {
            income: 0,
            expense:0
        },
        budget: 0,
        percentage: -1
    }
    
    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur, index, arr){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    return {
        addItem: function(type, desc, val) {
            
            var newItem, ID;
            
            //create id; get the last id plus one
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            //create new item (income or expense)
            if (type === 'income') {
                newItem = new Income(ID, desc, val);
            } else if (type === 'expense') {
                newItem = new Expense(ID, desc, val);
            }
            
            // add item to the array
            data.allItems[type].push(newItem);
            
            //return the item
            return newItem;
        },
        
        removeItem: function (type, id) {
            
            var ids, index;
            
            //get all elements
            ids = data.allItems[type].map(function(cur, index, arr) {
                return cur.id;
            });
            
            //find position of the one we want to delete
            index = ids.indexOf(id);
            
            if (index !== -1) {
                //remove it
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function () {
          
            // 1. calculate total income and expenses
            calculateTotal('expense');
            calculateTotal('income');
            
            // 2. calculate budget
            data.budget = data.totals.income - data.totals.expense;
            
            // 3. calculate percentage
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        getBudget: function() {
            return {
                budget:  data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.income,
                totalExpenses: data.totals.expense
            }
        },
        
        calculatePercentages: function () {
            
            data.allItems.expense.forEach(function(cur){
                cur.calcPercentage(data.totals.income);
            });
            
        },
        
        getPercentages: function () {
            
            var allPerc = data.allItems.expense.map(function(cur){
                return cur.getPercentage();
            });
            
            return allPerc;
            
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();


// UI CONTROLLER
var UIController = (function (){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncome: '.budget__income--value',
        budgetExpenses: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container: '.container',
        percentage: '.item__percentage',
        date: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            
            var splitNum, int;
            
            // get the absolute value
            num = Math.abs(num);
            
            // exactly to decimals
            num = num.toFixed(2);
            
            // comma separating
            splitNum = num.split('.');
            
        int = splitNum[0];
            if (splitNum[0].lenght > 3) {
                int = int.substr(0, int.lenght - 3) + ',' + int.substr(int.lenght - 3, int.lenght);
            }
            
            type === 'expense' ? sign = '-' : sign = '+';
            
            return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + splitNum[1]
            
    };
    
    var nodeListforEach = function(list, callback) {
        
        for (var i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        
        getDOMStrings: function() {
            return DOMstrings;
        },
        
        addListItem: function(obj, type) {
            
            var html, newHtml, element;
            
            // create html string
            if (type === 'income') {
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
                element = DOMstrings.incomeContainer;
                
            } else if (type === 'expense') {
                html = '<div class="item clearfix" id="expense-0%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
                element = DOMstrings.expenseContainer;
            }
            
            // replace data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));
            
            //insert html to the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            //get the fields
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            //convert them to array
            fieldsArr = Array.prototype.slice.call(fields);
            
            //clear each one
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            
            var type;
            type = (obj.budget > 0 ? 'income' : 'expense');
            
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncome).textContent = obj.totalIncome;
            document.querySelector(DOMstrings.budgetExpenses).textContent = obj.totalExpenses;
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.budgetPercentage).textContent = '--';
            }
            
            
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.percentage);
            
            nodeListforEach(fields, function(cur, index){
                
                if (percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '--';
                }
                
            });
            
        },
        
        displayMonth: function() {
            
            var now, year, month, months;
            
            months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
            
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            

            document.querySelector(DOMstrings.date).textContent = months[month] + ' ' + year;
            
        },
        
        changeType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListforEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.addBtn).classList.toggle('red');
            
        },
    
        getInput: function() {
            
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        
        }
    };
    
})();


// MAIN APP CONTROLLER
var appController = (function(budgetC,UIC){
    
    var setupEventListeners = function() {
        
        var DOM = UIC.getDOMStrings();
        
        document.querySelector(DOM.addBtn).addEventListener('click', addItem);
        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                addItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', deleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIC.changeType);
        
        
        console.log('listeners on place..')
        
    }
    
    var updateBudget = function () {
        
        // 1. calculate budget
        budgetC.calculateBudget();
        
        // 2. update budget on UI
        var budget = budgetC.getBudget();
        
        // 3. return the budget
        UIC.displayBudget(budget);
        
    };
    
    var updatePercentages = function () {
        
        // 1. Calculate percentages
        budgetC.calculatePercentages();
        
        // 2. Read them from budgetC
        var percentages = budgetC.getPercentages();
        
        // 3. Update UI
        UIC.displayPercentages(percentages);
        
    };
    
    var addItem = function() {
        
        // 1. get input data
        var input = UIC.getInput();
        //console.log(input);
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add item to budget controller
            var newItem = budgetC.addItem(input.type, input.description, input.value);
            //console.log(newItem);

            // 3. add item to UI
            UIC.addListItem(newItem, input.type);

            // 4. clear fields
            UIC.clearFields();

            // 5. calculate and update budget
            updateBudget();
            
            // 6. calculate and update percentages
            updatePercentages();
        }
        
    }
    
    var deleteItem = function (e) {
        
        var itemID, splitArr, type, ID;
        
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitArr = itemID.split('-');
            type = splitArr[0];
            ID = parseInt(splitArr[1]);

            // 1. delete item from data
            budgetC.removeItem(type, ID);
            
            // 2. delete item from UI
            UIC.deleteListItem(itemID);
        
            // 3. recalculate budget
            updateBudget();
            
            // 4. calculate and update percentages
            updatePercentages();
        }
           
    };

    return {
        init: function(){
            console.log('app running..');
            setupEventListeners();
            UIC.displayMonth();
            UIC.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
        }
    }

})(budgetController,UIController);

appController.init();