document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager') {
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
        iconContainer.innerHTML = `
            <a href="../pages/profile.html" class="ml-3">
                <svg class="icon">
                    <use xlink:href="#user"></use>
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

document.getElementById('changeRoleForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const email = document.getElementById('email').value;
    const role = document.getElementById('roles').value;

    const requestData = { email, newRole: role };
    console.log(requestData);
    document.getElementById('submitBtn').disabled = true;

    try {
        const response = await fetch('http://localhost/MiniProjectAPI/api/Auth/ChangeUserRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        const messageElement = document.getElementById('responseMessage');
        if (response.ok ) {
            messageElement.style.color = 'green';
            messageElement.textContent = 'Role changed successfully!';
        } else {
            messageElement.style.color = 'red';
            messageElement.textContent = result.message || 'Failed to change role.';
        }
    } catch (error) {
        console.error('Error:', error);
        const messageElement = document.getElementById('responseMessage');
        messageElement.style.color = 'red';
        messageElement.textContent = 'Error occurred while changing role.';
    } finally {
        document.getElementById('submitBtn').disabled = false;
    }
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
        $('.tab-link[data-tab="role"]').addClass('active');
        $('#role').addClass('active-tab');
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
