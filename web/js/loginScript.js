
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').textContent = 'Both fields are required.';
        return;
    }

    const requestBody = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost/MiniProjectAPI/api/Auth/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const messageElement = document.getElementById('message');
         if (response.ok) {
         

            const data = await response.json();
            const token = data.message;  
            const role = data.role;
            const expiryDate = data.expiryDate;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('expiryDate', expiryDate);


          if (role === 'Admin') {
                window.location.href = '../pages/admin_dashboard.html';
            } else if (role === 'Manager') {
                window.location.href = '../pages/manager_dashboard.html';
            } else {
                window.location.href = '../pages/dashboard.html';
            }

        }
        else {
            const error = await response.json();
            messageElement.style.color = 'red';
            messageElement.textContent = error.message || 'Failed to login. Please check your credentials.';
        }
    } catch (e) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Error occurred: ' + e.message;
    }
});

