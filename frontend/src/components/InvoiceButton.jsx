import axios from 'axios';

const InvoiceButton = ({ vehicleId }) => {
    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/invoices/${vehicleId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${vehicleId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice');
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200 flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 3.414L15.586 7 12 10.586V7h-1a2 2 0 00-2 2v2H7V9a4 4 0 014-4h2.586l-2.293-2.293A1 1 0 0010.586 3H6a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1v-2h-2v2H6V4z" clipRule="evenodd" />
            </svg>
            Invoice
        </button>
    );
};

export default InvoiceButton;
