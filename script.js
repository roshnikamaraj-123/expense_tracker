// Initialize transactions array from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Set default date to today
document.getElementById('date').valueAsDate = new Date();

// Set default time to current time
const now = new Date();
const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
document.getElementById('time').value = timeString;

// Initialize the app
updateSummary();
displayTransactions();

// Form submission
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        paymentMethod: paymentMethod,
        category: category,
        date: date,
        time: time,
        timestamp: new Date(`${date}T${time}`).getTime()
    };
    
    transactions.unshift(transaction); // Add to beginning
    saveTransactions();
    updateSummary();
    displayTransactions();
    
    // Reset form
    this.reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('time').value = timeString;
    document.getElementById('type').value = 'expense';
});

// Filter transactions
document.getElementById('filterType').addEventListener('change', displayTransactions);
document.getElementById('filterPayment').addEventListener('change', displayTransactions);
document.getElementById('clearFilters').addEventListener('click', function() {
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterPayment').value = 'all';
    displayTransactions();
});

// Display transactions
function displayTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    const filterType = document.getElementById('filterType').value;
    const filterPayment = document.getElementById('filterPayment').value;
    
    let filteredTransactions = transactions;
    
    if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
    }
    
    if (filterPayment !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.paymentMethod === filterPayment);
    }
    
    // Sort by timestamp (newest first)
    filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
    
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-transactions">No transactions found. Add your first transaction!</p>';
        return;
    }
    
    transactionsList.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <div class="transaction-details">
                    <span>📅 ${formatDate(transaction.date)}</span>
                    <span>🕒 ${transaction.time}</span>
                    <span>💳 ${transaction.paymentMethod}</span>
                    <span>🏷️ ${transaction.category}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateSummary();
        displayTransactions();
    }
}

// Update summary cards
function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
    document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
    
    // Update balance color based on profit/loss
    const balanceCard = document.querySelector('.balance-card .amount');
    if (balance >= 0) {
        balanceCard.style.color = '#10b981';
    } else {
        balanceCard.style.color = '#ef4444';
    }
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Make deleteTransaction available globally
window.deleteTransaction = deleteTransaction;

