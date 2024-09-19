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

    document.getElementById('search-icon').addEventListener('click', function(event) {
        event.preventDefault();
        var searchForm = document.getElementById('search-form');
        searchForm.classList.toggle('active');

        if (searchForm.classList.contains('active')) {
            document.getElementById('search-input').focus();
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
        iconContainer.innerHTML = `<a href="../pages/profile.html" class="ml-3">
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

$(document).ready(function () {
    $('.tab-link[data-tab="profile"]').addClass('active');
    $('#profile').addClass('active-tab');

    $('.tab-link').on('click', function (e) {
        var href = $(this).attr('href');
        
        if (href === "" || href === "#") {
            e.preventDefault();
            $('.tab-link').removeClass('active');
            $('.tab-content').removeClass('active-tab');
            $(this).addClass('active');
            var tab = $(this).data('tab');
            $('#' + tab).addClass('active-tab');
        }
    });
});

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1]; 
    const payload = atob(payloadBase64); 
    const payloadObject = JSON.parse(payload); 

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}

const token = localStorage.getItem('token'); 
if (token) {
    const userId = getUserIdFromToken(token);
    if (userId) {
        fetchUserData(userId, token);
    } else {
        console.error('User ID not found in token.');
    }
} else {
    console.error('Token not found in localStorage.');
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

function populateForm(data) {
    document.getElementById('firstname').value = data.firstname || '';
    document.getElementById('lastname').value = data.lastname || '';
    document.getElementById('phoneNumber').value = data.phoneNumber || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('licenseInfo').value = data.licenseInfo || '';
    document.getElementById('userName').value = data.userName || '';
}
/* Customers should be able to view and update their profile information.*/
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    var updatedUser = {
        firstname: document.getElementById('firstname').value,
        lastname: document.getElementById('lastname').value,
        address: document.getElementById('address').value,
        licenseInfo: document.getElementById('licenseInfo').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        userName: document.getElementById('userName').value
    };

    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);
    const encodedUserId = encodeURIComponent(userId);
    console.log(userId);
    console.log(encodedUserId);
    fetch(`http://localhost/MiniProjectAPI/api/Auth/user/${encodedUserId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerText = "Profile updated successfully!";
    })
    .catch(error => {
        document.getElementById('message').innerText = "Error updating profile.";
        console.error('Error updating user:', error);
    });
});