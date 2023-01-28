/** @format */

//******************************* */
//  BUDGET CONTROLLER MODULE
//******************************* */
var budgetController = (function () {
  // EXPENSE CONSTRUCTOR
  var Expense = function (id, description, value, currency) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.currency = currency;
    this.percentage = -1;
  };
  Expense.prototype.calculatePres = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPers = function () {
    return this.percentage;
  };
  // INCOME CONSTRUCTOR
  var Income = function (id, description, value, currency) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.currency = currency;
  };

  function calculateTotal(type) {
    var sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    currency: '$',
    budget: 0,
    percentage: -1,
  };

  return {
    addNewItem: function (type, desc, val, currency) {
      var newItem, ID;
      // CREATE NEW ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //   CREATE NEW ITEM BASED ON INCOME OR EXPENSE
      if (type === 'inc') {
        newItem = new Income(ID, desc, val, currency);
      } else if (type === 'exp') {
        newItem = new Expense(ID, desc, val, currency);
      }
      // PUSH TO OUR DATA STRUCTURE
      data.allItems[type].push(newItem);
      // Add Currency to DATA STRUCTURE
      data.currency = currency;
      //   RETURN NEW ITEM
      return newItem;
    },
    calculateBudget: function () {
      //   Calculate total incomes and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //   Calculate the budget: (incomes -expenses)
      data.budget = data.totals.inc - data.totals.exp;
      //   Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getData: function () {
      return {
        income: data.totals.inc,
        expense: data.totals.exp,
        currency: data.currency,
        budget: data.budget,
        percentage: data.percentage,
      };
    },
    addCurrency: function (currency) {
      data.currency = currency;
      return {
        income: data.totals.inc,
        expense: data.totals.exp,
        currency: data.currency,
        budget: data.budget,
        percentage: data.percentage,
      };
    },
    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (curr, index, array) {
        return curr.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calculatePres(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPers();
      });
      return allPerc;
    },
    testing: function () {
      return data;
    },
  };
})();

//******************************* */
// UI CONTROLLER MODULE
//******************************* */
var UIController = (function () {
  // Create DOM STRINGS
  var DOMstring = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputVal: '.add__value',
    inputBtn: '.add__btn',
    errorMessage: '.error__message',
    errorMessageParent: '.operator__list',
    incomeContainer: '.income__list',
    expenseContainer: '.expense__list',
    budgetValue: '.budget__value',
    totalIncome: '.budget__income--value',
    totalExpense: '.budget__expense--value',
    expensePerc: '.budget__expenses--percentage',
    container: '.bubuling',
    percentage: '.item__percentage',
    dateLabel: '.budget__title__month',
    setCurrency: '.set__currency',
    currencyResult: '.currency__result',
  };

  // FORMAT NUMBERS AND CURRENCY
  var formatNumbers = function (num, currency, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    function numberWithCommas(x) {
      var parts = x.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    int = numberWithCommas(int);
    dec = numSplit[1];
    return (type === 'exp' ? `-` : `+`) + currency + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // GET INPUT DATA
    getInput: function () {
      var event = document.getElementById('currency');
      var result = event.options[event.selectedIndex].text;
      return {
        type: document.querySelector(DOMstring.inputType).value,
        desc: document.querySelector(DOMstring.inputDesc).value,
        val: parseFloat(document.querySelector(DOMstring.inputVal).value),
        currency: result,
      };
    },

    // GET DOM STRING
    getDOMstrings: function () {
      return DOMstring;
    },

    // Clear Input
    clearFields: function () {
      var inputsValue, inputsValueArr;
      inputsValue = document.querySelectorAll(
        DOMstring.inputDesc + ', ' + DOMstring.inputVal
      );
      inputsValueArr = Array.prototype.slice.call(inputsValue);
      inputsValueArr.forEach(function (current, index, array) {
        current.value = '';
      });
      inputsValueArr[0].focus();
    },

    // Delete Error Message
    deleteErrorMessage() {
      var element = document.querySelector(DOMstring.errorMessage);
      if (element) {
        element.parentNode.removeChild(element);
      } else {
        return;
      }
    },

    // Show Error Message
    showErrorMessage() {
      var element = document.querySelector(DOMstring.errorMessageParent);
      var newHtml = `<h6 class="error__message text-danger text-center pt-3 m-0">Your fields are empty.</h6>`;
      element.insertAdjacentHTML('beforeend', newHtml);
    },

    // Add Items to the UI
    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text

      if (type == 'exp') {
        element = document.querySelector(DOMstring.expenseContainer);
        html = `<div class="item d-flex row-hl p-0" id="exp-%id%">
                    <div class="item__description item-hl flex-grow-1 py-3">%description%</div>
                    <div class="item-hl py-3">
                        <div class="d-flex row-hl text-danger">
                            <div class="item__value">%value%</div>
                            <div class="item__percentage">25%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn">
                                  <i class="fa-regular fa-circle-xmark text-danger">
                                  </i>
                                </button>
                            </div>
                        </div>
                    </div>
            </div>`;
      } else if (type == 'inc') {
        element = document.querySelector(DOMstring.incomeContainer);
        html = `<div class="item d-flex row-hl p-0" id="inc-%id%">
                    <div class="item__description item-hl flex-grow-1 py-3">%description%</div>
                    <div class="item-hl py-3">
                        <div class="d-flex row-hl text-info">
                            <div class="item__value">%value%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn">
                                    <i class="fa-regular fa-circle-xmark text-info"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
      }
      // Replace  placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace(
        '%value%',
        formatNumbers(obj.value, obj.currency, type)
      );
      // Insert the HTML into DOM
      element.insertAdjacentHTML('beforeend', newHtml);
    },

    // Display Budget
    displayBudget: function (data) {
      var type;
      data.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMstring.budgetValue).textContent = formatNumbers(
        data.budget,
        data.currency,
        type
      );
      document.querySelector(DOMstring.totalExpense).textContent =
        formatNumbers(data.expense, data.currency, 'exp');
      document.querySelector(DOMstring.totalIncome).textContent = formatNumbers(
        data.income,
        data.currency,
        'inc'
      );
      var container = document.querySelector('.item__value');
      if (container) {
        var content = container.textContent;
        var splitContent = content.split(' ');
        var cur = splitContent[0];
        var num = splitContent[1];
        var signs = cur.split('');
        signs[1] = data.currency;
        splitContent[0] = signs.join('');
        var finalContent = splitContent.join(' ');
        container.innerHTML = finalContent;
      }

      if (data.percentage > 0) {
        document.querySelector(DOMstring.expensePerc).textContent =
          data.percentage + '%';
      } else {
        document.querySelector(DOMstring.expensePerc).textContent = '---';
      }
    },

    // Delete Items From the UI
    UIdelete: function (SelectorId) {
      var element = document.getElementById(SelectorId);
      element.parentNode.removeChild(element);
    },

    // Display Percentage
    UIdisplayPercentages: function (pers) {
      var fields = document.querySelectorAll(DOMstring.percentage);
      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function (current, index) {
        if (pers[index] > 0) {
          current.textContent = pers[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    // Display Month
    displayMonth: function () {
      var now, months, month, year;

      now = new Date();

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstring.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    // Change the Color of Inputs
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstring.inputType +
          ',' +
          DOMstring.inputDesc +
          ',' +
          DOMstring.inputVal
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstring.inputBtn).classList.toggle('red');
    },
  };
})();

//******************************* */
// GLOBAL APP CONTROLLER MODULE
//******************************* */
var AppController = (function (budgetCtrl, UICtrl) {
  // RECIVE DOM STRING
  var DOM = UICtrl.getDOMstrings();

  // ALL EVENT LISTENER CONTROLLER
  var setupEventListener = function () {
    // Event Listener forkeyboard
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        CtrlAddData();
      }
    });

    // Event Listener For Button
    document.querySelector(DOM.inputBtn).addEventListener('click', CtrlAddData);

    // Event Listener DELEGATION /BUBLING TO DELETE
    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteData);

    // Event Listener To Change color of operator
    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);

    // Event Listener To Change currency
    document
      .querySelector(DOM.setCurrency)
      .addEventListener('click', CtrlCurrency);
  };
  // FUNCTION FOR CONTROL CURRENCY
  var CtrlCurrency = function () {
    var input = UIController.getInput();
    var data = budgetCtrl.addCurrency(input.currency);
    UICtrl.displayBudget(data);
  };

  // FUNCTION FOR CONTROL UPDATE DATA
  var updateBudget = function () {
    // 1)Calculate budget
    budgetCtrl.calculateBudget();
    // 2)Return the budget
    var data = budgetController.getData();
    // 3)Display the budget on the UI
    UICtrl.displayBudget(data);
  };
  // FUNCTION FOR CONTROL PERECENTAGES DATA
  var updatePercentage = function () {
    // 1)Calculate percentages
    budgetController.calculatePercentages();
    // 2)Read percentages from the budget controller
    var percentage = budgetController.getPercentages();
    // 3)Update th UI with the new percentages
    UICtrl.UIdisplayPercentages(percentage);
  };

  // FUNCTION FOR CONTROL DATA
  var CtrlAddData = function () {
    var input, newItem;
    // 1)Get Input Data
    input = UIController.getInput();
    UICtrl.deleteErrorMessage();
    if (input.desc !== '' && !isNaN(input.val) && input.val > 0) {
      // 2)Clear Error Empty Field
      UICtrl.deleteErrorMessage();

      // 3)Add data to the budget controller
      newItem = budgetCtrl.addNewItem(
        input.type,
        input.desc,
        input.val,
        input.currency
      );

      // 4)Add data to the UI controller
      UICtrl.addListItem(newItem, input.type);
      // 5)Clear input Values
      UICtrl.clearFields();
      // 6)Calculate and update data
      updateBudget();
      // 7)Update percentages
      updatePercentage();
    }
    else {
    UICtrl.showErrorMessage();
    }
  };
  // FUNCTION FOR DELETE DATA
  var ctrlDeleteData = function (event) {
    var itemID, splitID, type, ID;
    itemID =
      event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //   Divide inc and id from item ID
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // 1)delete the item from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2)delete the item from UI
      UICtrl.UIdelete(itemID);
      // 3) Update and show new budget
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentage();
    }
  };
  // Run Initial functions
  return {
    init: function () {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        income: 0,
        expense: 0,
        currency: '$',
        budget: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UIController);

AppController.init();
