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
        getCheckedOutCarts();

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
        $('.tab-link[data-tab="checkin"]').addClass('active');
        $('#checkin').addClass('active-tab');
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


async function getCheckedOutCarts() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost/MiniProjectAPI/api/Cart/checked-out-carts', {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            cartBody.innerHTML = '<tr><td colspan="5" class="text-center">No checked out carts available.</td></tr>';

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
       

        populateCartTable(data);



    } catch (error) {
        console.error('Error fetching pending carts:', error);
    }
}


async function populateCartTable(carts) { 
    const cartBody = document.getElementById('cartBody');
    const token = localStorage.getItem('token');
    const adminId = getUserIdFromToken(token)

    cartBody.innerHTML = ''; 

    if (!carts || carts.length === 0) {
        cartBody.innerHTML = '<tr><td colspan="5" class="text-center">No checked out carts available.</td></tr>';
        return;
    }

    for (const cart of carts) {
        const items = Array.isArray(cart.cartItems) ? cart.cartItems : [];
        const { firstName, lastName,driverLicense ,contactInfo, clientAddress} = await getUserName(cart.userId);
        const {employeeName} = await getAdminName(adminId);

        const itemRows = await Promise.all(items.map(async (item) => {
            const { selectedVehicleId,name, make, model, registration,mileage,extras,imageUrl } = await getVehicleDetails(item.vehicleId);


let formattedstartDate = item.startDate.split('T')[0]; 
let formattedendDate = item.endDate.split('T')[0];


            return `
                <tr onclick="setCheckInForm('${cart.cartId}','${item.cartItemId}','${cart.userId}','${firstName}', '${lastName}', '${driverLicense}','${contactInfo}','${clientAddress}','${selectedVehicleId}','${make}', '${model}', '${registration}', '${mileage}', '${formattedstartDate}','${formattedendDate}','${item.dailyRate}','${item.totalPrice}','${item.pickUpLocation}','${item.dropOffLocation}','${extras}','${employeeName}')">
                    <td>${item.cartItemId}</td>
                    <td><img src="${imageUrl}" alt="${name}" style="width: 50px; height: auto;"></td>
                    <td>${name}</td>
                    <td>${new Date(item.startDate).toLocaleDateString()}</td>
                    <td>${new Date(item.endDate).toLocaleDateString()}</td>
                    <td>${item.status}</td>
                    <td>${item.dailyRate}</td>
                    <td>${item.totalPrice}</td>
                </tr>
            `;
        }));

        const row = `
            <tr>
                <td>${cart.cartId}</td>
                <td>${new Date(cart.createdDate).toLocaleDateString()}</td>
                <td>${firstName} ${lastName}</td>
                <td>${cart.status}</td>
                <td>
                    <button class="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#cartItems${cart.cartId}" aria-expanded="false" aria-controls="cartItems${cart.cartId}">
                        View Cart Items
                    </button>
                    <div class="collapse mt-2" id="cartItems${cart.cartId}">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Cart Items</h5>
                            <button class="btn-close" type="button" data-bs-toggle="collapse" data-bs-target="#cartItems${cart.cartId}" aria-label="Close"></button>
                        </div>
                        <table class="table table-sm table-striped">
                            <thead class="table-light">
                                <tr>
                                    <th>Item</th>
                                    <th>Image</th>
                                    <th>Vehicle</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Item Status</th>
                                    <th>Daily Rate</th>
                                    <th>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows.join('')}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        `;

        cartBody.innerHTML += row;
    }
}

async function getUserName(userId) {
    const token = localStorage.getItem('token');
    try {
        const encodedUserId = encodeURIComponent(userId);

        const response = await fetch(`http://localhost/MiniProjectAPI/api/Auth/${encodedUserId}`, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();
        return { userId: user.userId, firstName: user.firstname, lastName: user.lastname,driverLicense: user.licenseInfo ,contactInfo:user.phoneNumber , clientAddress:user.address}; 

    } catch (error) {
        console.error('Error fetching user name:', error);
        return { firstName: 'Unknown', lastName: 'User' }; 
    }
}

async function getAdminName(adminId) {
    const token = localStorage.getItem('token');
    try {
        const encodedAdmind = encodeURIComponent(adminId);

        const response = await fetch(`http://localhost/MiniProjectAPI/api/Auth/${encodedAdmind}`, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const admin = await response.json();
        return { employeeName: `${admin.firstname} ${admin.lastname}`}; 

    } catch (error) {
        console.error('Error fetching admin name:', error);
        return { employeeName: 'Unknown Admin' };
    }
}

async function getVehicleDetails(vehicleId) {
    const token = localStorage.getItem('token');

    try {
        const vehicleResponse = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${vehicleId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!vehicleResponse.ok) {
            throw new Error(`HTTP error! status: ${vehicleResponse.status}`);
        }
        const vehicleData = await vehicleResponse.json();

        return {
            selectedVehicleId: vehicleId,
            make:vehicleData.make, 
            model:vehicleData.model,
            registration:vehicleData.registration,
            mileage:vehicleData.mileage,
            extras:vehicleData.additionalFeatures,
            name: vehicleData.name, 
            imageUrl: `data:image/jpeg;base64,${vehicleData.carImage}` 
        };
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        return { name: 'Unknown Vehicle', imageUrl: '../images/car13.jpg' }; 
    }
}

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1]; 
    const payload = atob(payloadBase64); 
    const payloadObject = JSON.parse(payload); 

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}

function formatDateToISO(input) {
    let date;

    if (input instanceof Date) {
        date = input;
    } else if (typeof input === 'string') {
        date = new Date(input);
        
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date string provided. Please provide a valid date string.");
        }
    } else {
        throw new Error("Invalid input provided. Please provide a Date object or a date string.");
    }

    return date.toISOString();
}

document.getElementById('rentalCheckinForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const mileage = document.getElementById('mileage').value;
    const fuelLevel = document.getElementById('fuelLevel').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const vehicleConditionCheck = document.getElementById('vehicleConditionCheck').value;
    const vehicleCondition = document.getElementById('vehicleCondition').value;
    const selectedVehicleId = document.getElementById('selectedVehicleId').value;
    const cartItemId = document.getElementById('cartItemId').value;

    const pickUpLocation = document.getElementById('pickupAddress').value;
    const dropOffLocation = document.getElementById('dropoffAddress').value;
    const clientId = document.getElementById('clientId').value;
    const depositAmount = document.getElementById('depositAmount').value;
    const totalCost = document.getElementById('totalCost').value;
    const extras = document.getElementById('extras').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const dailyRate = document.getElementById('dailyRate').value;
    const driverLicense = document.getElementById('driverLicense').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const vehicleMake = document.getElementById('vehicleMake').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const vehicleReg = document.getElementById('vehicleReg').value;

    if (!mileage || !fuelLevel || !vehicleConditionCheck || !vehicleCondition) {
        alert('Please fill in all required fields.');
        return;
    }

    const pickUpDate = new Date(startDate);
    const dropOffDate = new Date(endDate);

    const formattedPickUpDate = formatDateToISO(pickUpDate);
    const formattedDropOffDate = formatDateToISO(dropOffDate);

const rentalDto ={
    vehicleId: parseInt(selectedVehicleId,10), 
    mileageAtReturn: parseInt(mileage,10), 
    FuelLevelAtReturn:fuelLevel,
    ConditionAtReturn: vehicleConditionCheck, 
    conditionNotes: vehicleCondition,
    pickUpDate: formattedPickUpDate, 
    dropOffDate: formattedDropOffDate,

}

    const token = localStorage.getItem('token');
    console.log(rentalDto);

    try {
        const response = await fetch(`http://localhost/MiniProjectAPI/api/Cart/items/${cartItemId}/checkedin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(rentalDto)
        });

        if (response.ok) {
             
                const cartId = document.getElementById('cartId').value; 

                const cartresponse = await fetch(`http://localhost/MiniProjectAPI/api/Cart/${cartId}/check-in`, {
                    method: 'POST',  
                    headers: {
                        'Content-Type': 'application/json',  
                        'Authorization': `Bearer ${token}`  
                    }
                });

                if (!cartresponse.ok) {
                            const errorData = await response.json();
                    console.error('Error:', errorData);
                    return { success: false, message: errorData.message || 'Failed to check in cart.' };
                }
                const results = await cartresponse.json();
                console.log('Cart checked in successfully:', results);


                $('#checkinModal').modal('hide'); 
                    document.getElementById('rentalCheckinForm').reset(); 


        } else {
            const error = await response.json();
            alert('Error updating rental: ' + error.message);
        }

    } catch (error) {
     //   console.error('Error:', error);
        alert('An error occurred while updating the rental.');
    }
});

function setCheckInForm(cartId,cartItemId,userId,firstName, lastName,driverLicense, contactInfo,clientAddress, selectedVehicleId,vehicleMake,vehicleModel,vehicleReg,mileage,startDate,endDate,dailyRate,totalCost,pickupAddress,dropoffAddress,extras,employeeName ) {
 

    document.getElementById('cartId').value = `${cartId}`;
    document.getElementById('cartItemId').value = `${cartItemId}`;
    document.getElementById('clientId').value = `${userId}`;
    document.getElementById('clientName').value = `${firstName} ${lastName}`;
    document.getElementById('driverLicense').value = `${driverLicense}`; 
    document.getElementById('contactInfo').value = `${contactInfo}`; 
    document.getElementById('clientAddress').value = `${clientAddress}`; 
    document.getElementById('selectedVehicleId').value = `${selectedVehicleId}`; 
    document.getElementById('vehicleMake').value = `${vehicleMake}`;
    document.getElementById('vehicleModel').value = `${vehicleModel}`;
    document.getElementById('vehicleReg').value = `${vehicleReg}`;
    document.getElementById('mileage').value = `${mileage}`;
    document.getElementById('fuelLevel').value = '';
    document.getElementById('startDate').value = `${startDate}`;
    document.getElementById('endDate').value = `${endDate}`;
    document.getElementById('dailyRate').value = `${dailyRate}`;
    document.getElementById('totalCost').value = `${totalCost}`;
    document.getElementById('pickupAddress').value = `${pickupAddress}`;
    document.getElementById('dropoffAddress').value = `${dropoffAddress}`;
    document.getElementById('extras').value = `${extras}`
    document.getElementById('depositAmount').value = (totalCost * 0.3).toFixed(2);
    document.getElementById('vehicleCondition').value ='';
    document.getElementById('employeeName').value = `${employeeName}`

    const checkinModal = new bootstrap.Modal(document.getElementById('checkinModal'));
    checkinModal.show();
}
