// Constante modal (objeto) utilizando 2 funções para abrir e fechar a modal
/* const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        // Fechar o modal
        // Remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    }
} */

// Constante modal (objeto) utilizando uma única função (toggle) para abrir e fechar a modal
const Modal = {
    open_close_Modal() {
        var modal = document.querySelector('.modal-overlay');
        modal.classList.toggle('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    },
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },
    
    // somar as entradas
    incomes() { 
        let income = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        
        return income;
    },

    // somar as saídas
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        
        return expense;
    },

    // entradas - saídas
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },  

    innerHTMLTransaction(transaction, index) { 
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount); 

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>       
        `

        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100;
        
        return value;
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + value;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        
        /* if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        } */

        message = [];

        if(description.trim() === "") {
            message.push('Descrição');
            console.log(message)
            //throw new Error("Por favor, preencha todos os campos");
        } 
        if(amount.trim() === "") {
            message.push('Valor');
            console.log(message)
            //throw new Error("Por favor, preencha todos os campos");
        } 
        if(date.trim() === "") {
            message.push('Data');
            //throw new Error("Por favor, preencha todos os campos");
        }

        if(message.length === 3) {
            throw new Error("Por favor, preencha todos os campos");
        } else if(message.length < 3 && message.length != 0) {
            if(message.length == 1) {
                message = message.toLocaleString();
                throw new Error('Por favor, preencha o campo: ' + message);
            } else {
                message = message.toLocaleString();
                throw new Error('Por favor, preencha os campos: ' + message);
            }
        } else if(message.length == 0){
            console.log(message);
            console.log('Todos os campos foram preenchidos');
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            // verificar se todas as informações foram preenchidas
            //Form.validateFields();

            // formatar os dados para salvar
            const transaction = Form.formatValues();

            // salvar
            Transaction.add(transaction);

            // apagar os dados do formulário
            Form.clearFields();

            // modal feche
            Modal.open_close_Modal();
        } catch (error) {
            alert(error.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    },
}

App.init();