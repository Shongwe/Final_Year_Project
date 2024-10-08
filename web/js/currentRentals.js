document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else {
        const allowedRoles = ['Manager', 'Admin', 'User'];
        if (!allowedRoles.includes(userRole)) {
            window.location.href = '../pages/index.html';
        } else {
            validateToken(token);
            setupAccountIcons();
        }
    }

    document.getElementById('search-icon').addEventListener('click', function(event) {
        event.preventDefault();
        var searchForm = document.getElementById('search-form');
        searchForm.classList.toggle('active');

        if (searchForm.classList.contains('active')) {
            document.getElementById('search-input').focus();
        }
    }); 
});

$(document).ready(function () {
    var activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        $('.tab-link').removeClass('active');
        $('.tab-content').removeClass('active-tab');
        $('.tab-link[data-tab="' + activeTab + '"]').addClass('active');
        $('#' + activeTab).addClass('active-tab');
    }
    else{
        $('.tab-link[data-tab="current"]').addClass('active');
        $('#current').addClass('active-tab');
    }
    
    $('.tab-link').on('click', function (e) {
        var href = $(this).attr('href');
        
        if (href === "" || href === "#") {
            e.preventDefault();
            $('.tab-link').removeClass('active');
            $('.tab-content').removeClass('active-tab');
          
            $(this).addClass('active');
            var tab = $(this).data('tab');
            $('#' + tab).addClass('active-tab');
            localStorage.setItem('activeTab', tab);
        }
        else
        {
            var tab = $(this).data('tab');
            localStorage.setItem('activeTab', tab);
        }
    });
});

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

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1];
    const payload = atob(payloadBase64);
    const payloadObject = JSON.parse(payload);

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}

function fetchUserData(userId, token) {
    const encodedUserId = encodeURIComponent(userId);

    fetch(`http://localhost/MiniProjectAPI/api/Auth/${encodedUserId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        populateForm(data);
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    const invoiceContainer = document.getElementById('invoice-items');

    invoiceContainer.innerHTML = `<div class="text-center">Loading invoice data...</div>`;

    try {
        const response = await fetch(`http://localhost/MiniProjectAPI/api/Cart/${userId}/invoice`, {
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
            downloadButton.disabled = true;
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
            cart.cartItems.forEach((item, itemIndex) => {
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
            invoiceContainer.appendChild(cartWrapper);  
        });

    } catch (error) {
        console.error('Error loading invoice:', error);
        invoiceContainer.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                Failed to load invoice data. Please try again later.
            </div>`;
    } 
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function getStatusColor(status) {
    switch (status) {
        case 'Open': return 'blue';
        case 'Pending': return 'orange';
        case 'Checked Out': return 'green';
        case 'Checked In': return 'gray';
        default: return 'black';
    }
}