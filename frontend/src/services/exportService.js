import config from '../config';

export const exportToExcel = () => {
    window.open(`${config.API_URL}/export/excel`, '_blank');
};

export const exportToCSV = () => {
    window.open(`${config.API_URL}/export/csv`, '_blank');
};

export const createBackup = () => {
    window.open(`${config.API_URL}/export/backup`, '_blank');
};
