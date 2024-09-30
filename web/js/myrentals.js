document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager' && userRole !== 'Admin' && userRole !== 'User') {
        window.location.href = '../pages/index.html';
    } else {
        validateToken(token);
        setupAccountIcons();
    }

    const searchIcon = document.getElementById('search-icon');
    const clearSearchButton = document.getElementById('clear-search');
    
    searchIcon.addEventListener('click', async function(event) {
        event.preventDefault();
        var searchForm = document.getElementById('search-form');
        searchForm.classList.toggle('active');
    
        if (searchForm.classList.contains('active')) {
            console.log("Search form activated");
            document.getElementById('search-input').focus();
        } else {
            const searchInput = document.getElementById('search-input').value.trim();
            if (searchInput !== '') {
                console.log(`Searching for: ${searchInput}`);
    
                const token = localStorage.getItem('token'); 
    
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };
    
                try {
                    const response = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/search?keyword=${encodeURIComponent(searchInput)}`, { headers });
                    
                    console.log("Fetching results...");
    
                    if (!response.ok) {
                        throw new Error('Failed to fetch search results');
                    }
    
                    const vehicles = await response.json();
                    console.log("Search results fetched", vehicles);
                    
                    displaySearchResults(vehicles);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    alert('Failed to load search results.');
                }
            } else {
                alert('Please enter a search keyword.');
            }
        }
    });

    document.getElementById('search-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchIcon.click(); 
        }
    });

    clearSearchButton.addEventListener('click', function() {
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-input').value = ''; 
        clearSearchButton.style.display = 'none'; 
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    const invoiceContainer = document.getElementById('invoice-items');
    const doneButton = document.getElementById('done-btn');

    invoiceContainer.innerHTML = `<div class="text-center">Loading invoice data...</div>`;

    try {
        const response = await fetch(`http://localhost/MiniProjectAPI/api/Cart/${userId}/carts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch invoice data.');
        }

        const data = await response.json();
        const carts = data.cartItems;

        if (carts.length === 0) {
            invoiceContainer.innerHTML = `<div class="text-center">No pending carts found.</div>`;
            return;
        }

        invoiceContainer.innerHTML = '';  
        carts.forEach((cart, cartIndex) => {
            const cartWrapper = document.createElement('div'); 
            cartWrapper.classList.add('mb-5'); 
            
            const cartHeader = document.createElement('h3');
            const formattedDate = formatDate(cart.createdDate);

            cartHeader.innerHTML = `Cart created on : ${formattedDate} Cart status: <span style="color: ${getStatusColor(cart.status)};">${cart.status}</span>`;
            cartWrapper.appendChild(cartHeader); 
            
            const table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-bordered', 'mb-4');

            const tableHead = document.createElement('thead');
            tableHead.classList.add('thead-dark');

            tableHead.innerHTML = `
                <tr>
                    <th>Item</th>
                    <th>Vehicle</th>
                    <th>Registration</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Daily Rate</th>
                    <th>Total Price</th>
                </tr>
            `;
            table.appendChild(tableHead);

            const tableBody = document.createElement('tbody');
            const rentalPromises = []; 

            cart.cartItems.forEach((item, itemIndex) => {
                if(item != null) {
                    const fetchRentalIdPromise = fetch(`http://localhost/MiniProjectAPI/api/Rental/by-date-and-vehicle?startDate=${new Date(item.startDate).toISOString()}&endDate=${new Date(item.endDate).toISOString()}&vehicleId=${item.vehicleId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to fetch rental ID for vehicle ID: ${item.vehicleId}`);
                            }
                            return response.json(); 
                        })
                        .then(rentalData => {
                            console.log(`Rental ID for vehicle ${item.vehicleId}: ${rentalData.rentalId}`); 
                            return rentalData.rentalId; 
                        })
                        .catch(error => {
                            console.error('Error fetching rental ID:', error);
                        });
                    
                    rentalPromises.push(fetchRentalIdPromise); 
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${itemIndex + 1}</td>
                    <td>${item.vehicleName}</td>
                    <td>${item.vehicleRegistration}</td>
                    <td>${new Date(item.startDate).toLocaleDateString()}</td>
                    <td>${new Date(item.endDate).toLocaleDateString()}</td>
                    <td>${item.dailyRate.toFixed(2)}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });

            table.appendChild(tableBody);
            cartWrapper.appendChild(table);  

            Promise.all(rentalPromises)
            .then(rentalIds => {
              //  console.log('All rental IDs fetched successfully:', rentalIds);
                
                const rentalIdArray = rentalIds.map(rental => rental.rentalId);
                console.log('Extracted Rental IDs:', rentalIdArray);
            })
            .catch(error => {
                console.error('Error fetching rental IDs:', error);
            });

            if (cart.status === "Checked In") {
                const paymentButton = document.createElement('button');
                paymentButton.classList.add('btn', 'btn-success');
                paymentButton.innerText = 'Make Payment';
                paymentButton.addEventListener('click', () => {
                    makePayment(cart.rentalId); 
                });
                cartWrapper.appendChild(paymentButton);
            }

            invoiceContainer.appendChild(cartWrapper);  
        });

    } catch (error) {
        console.error('Error loading invoice:', error);
        invoiceContainer.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                Failed to load invoice data. Please try again later.
            </div>`;
    }

    doneButton.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
});



async function makePayment(rentalId) {
    const paymentDetails = {
        AmountPaid: 100, 
        PaymentMethod: "Credit Card" 
    };


    try {
        const response = await fetch(`http://localhost/MiniProjectAPI/api/Cart/payment/${rentalId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(paymentDetails)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Payment made successfully.");
        } else {
            alert(`Payment failed: ${result}`);
        }
    } catch (error) {
        console.error("Error during payment :", error);
        alert("An error occurred while processing the payment.");
    }
}

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1];
    const payload = atob(payloadBase64);
    const payloadObject = JSON.parse(payload);

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}


async function generatePDF(carts) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Invoice', 105, 10, null, null, 'center');

    doc.setFontSize(12);
    let y = 30;

    carts.forEach((cart, cartIndex) => {
        doc.text(`Cart #${cart.cartId}`, 10, y);
        y += 10;

        const headers = ['Item', 'Vehicle', 'Registration', 'Start Date', 'End Date', 'Daily Rate', 'Total Price'];
        headers.forEach((header, i) => {
            doc.text(header, 10 + i * 30, y);
        });
        y += 10;

        cart.cartItems.forEach((item, itemIndex) => {
            const rowData = [
                `${itemIndex + 1}`,
                item.vehicleName,
                item.vehicleRegistration,
                new Date(item.startDate).toLocaleDateString(),
                new Date(item.endDate).toLocaleDateString(),
                item.dailyRate.toFixed(2),
                item.totalPrice.toFixed(2)
            ];

            rowData.forEach((data, i) => {
                doc.text(data, 10 + i * 30, y);
            });
            y += 10;
        });

        y += 10;
    });

    doc.save('invoice.pdf');
}

function formatDate(dateString) {
    if (!dateString) {
        return 'Invalid Date';
    }

    let cleanedDateString;
    if (dateString.includes('.')) {
        cleanedDateString = dateString.split('.')[0];
    } else {
        cleanedDateString = dateString;
    }

    const date = new Date(cleanedDateString);
console.log(date);
    if (isNaN(date.getTime())) {
        return 'Invalid Date'; 
    }

    const options = {
        day: '2-digit', 
        month: 'long', 
        year: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('en-GB', options);
    
    return formattedDate;
}

function getStatusColor(status) {
    if (status === 'Pending') {
      return 'orange';
    } else if (status === 'Open') {
      return 'blue';
    } else if (status === 'Checked Out') {
      return 'red';
    } else if (status === 'Checked In' ) {
      return 'yellow';
    }else if (status === 'Closed') {
        return 'green';
    }
  }

  function setupAccountIcons() {
    const isLoggedIn = !!localStorage.getItem('token');
    const iconContainer = document.getElementById('account-icon-container');

    if (isLoggedIn) {
        iconContainer.innerHTML = `
            <a href="../pages/profile.html" class="ml-3">
                <svg class="icon">
                    <use xlink:href="#user"></use>
                </svg>
            </a>
            <a href="../pages/cart.html" class="ml-3">
                <svg class="icon">
                    <use xlink:href="#cart"></use>
                </svg>
            </a>
            <a href="#" onclick="logout()">
                <svg class="icon">
                    <use href="#logout"></use>
                </svg>
            </a>`;
    } else {
        iconContainer.innerHTML = `
            <a href="../pages/login.html">
                <svg class="icon">
                    <use href="#user"></use>
                </svg>
            </a>`;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}

function validateToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expTime = payload.exp * 1000;
    const currentTime = Date.now();

    if (currentTime > expTime) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '../pages/login.html';
    }
}
