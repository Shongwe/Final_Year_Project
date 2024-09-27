document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager' && userRole !== 'Admin') {
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

async function displaySearchResults(vehicles) {
    console.log("In displaySearchResults function");

    const carLists = document.getElementById('search-results');
    const clearSearchButton = document.getElementById('clear-search'); 
    
    if (!carLists) {
        console.error("No search results container found in the DOM.");
        return;
    }
    
    carLists.innerHTML = ''; 

    if (vehicles.length > 0) {
        clearSearchButton.style.display = 'block'; 
    } else {
        clearSearchButton.style.display = 'none'; 
    }

    const token = localStorage.getItem('token'); 
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    for (const vehicle of vehicles) {
        console.log("Processing vehicle:", vehicle);

        try {
            const imageResponse = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${vehicle.registration}/image`, { headers });
            let imageUrl = '';

            if (imageResponse.ok) {
                imageUrl = URL.createObjectURL(await imageResponse.blob());
            } else {
                imageUrl = '../images/car13.jpg'; 
            }

            const carCard = document.createElement('div');
            carCard.className = 'car-card';

            carCard.innerHTML = `
                <img src="${imageUrl}" alt="${vehicle.name}" style="width: 100%; height: auto;">
                <h3>${vehicle.name}</h3>
                <p>${vehicle.description}</p>
                <p>Daily Rate: R${vehicle.dailyRate}</p>
                <button class="rent-button" data-vehicle-id="${vehicle.id}">Rent Now</button>
            `;

            carCard.addEventListener('click', (event) => {
                window.location.href = `single_car.html?registration=${encodeURIComponent(vehicle.registration)}`;
            });

            const rentButton = carCard.querySelector('.rent-button');
            rentButton.addEventListener('click', (event) => {
                event.stopPropagation();
                addToCart(vehicle); 
            });

            carLists.appendChild(carCard); 
        } catch (error) {
            console.error('Error fetching vehicle image:', error);
        }
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


$(document).ready(function () {
    var activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        $('.tab-link').removeClass('active');
        $('.tab-content').removeClass('active-tab');
        $('.tab-link[data-tab="' + activeTab + '"]').addClass('active');
        $('#' + activeTab).addClass('active-tab');
    }
    else{
        $('.tab-link[data-tab="reports"]').addClass('active');
        $('#reports').addClass('active-tab');
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

