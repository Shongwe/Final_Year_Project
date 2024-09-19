document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

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
        const invoiceItems = data.cartItems;

        const tableBody = document.getElementById('invoice-items');

        invoiceItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.vehicleName || 'N/A'}</td>
                <td>${item.vehicleRegistration || 'N/A'}</td>
                <td>${new Date(item.startDate).toLocaleDateString()}</td>
                <td>${new Date(item.endDate).toLocaleDateString()}</td>
                <td>${item.dailyRate.toFixed(2)}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById('download-pdf').addEventListener('click', () => {
            generatePDF(invoiceItems);
        });

    } catch (error) {
        console.error('Error loading invoice:', error);
    }
});


function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1]; 
    const payload = atob(payloadBase64); 
    const payloadObject = JSON.parse(payload); 

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}

async function generatePDF(invoiceItems) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Invoice', 10, 10);

    let y = 20;
    doc.setFontSize(12);

    const headers = ['Item', 'Vehicle', 'Start Date', 'End Date', 'Daily Rate', 'Total Price'];
    doc.text(headers, 10, y);
    y += 10;

    invoiceItems.forEach(item => {
        doc.text([
            item.vehicleName || 'N/A',
            item.vehicleRegistration || 'N/A',
            new Date(item.startDate).toLocaleDateString(),
            new Date(item.endDate).toLocaleDateString(),
            item.dailyRate.toFixed(2),
            item.totalPrice.toFixed(2)
        ], 10, y);
        y += 10;
    });

    doc.save('invoice.pdf');
}
