export const exportToExcel = () => {
    window.open('http://localhost:5000/api/export/excel', '_blank');
};

export const exportToCSV = () => {
    window.open('http://localhost:5000/api/export/csv', '_blank');
};

export const createBackup = () => {
    window.open('http://localhost:5000/api/export/backup', '_blank');
};
