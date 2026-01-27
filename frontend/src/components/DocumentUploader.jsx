import { useState, useEffect } from 'react';
import {
    getDocumentsByVehicle,
    uploadDocuments,
    downloadDocument,
    deleteDocument
} from '../services/vehicleService';

const DocumentUploader = ({ vehicleId }) => {
    const [documents, setDocuments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (vehicleId) {
            fetchDocuments();
        }
    }, [vehicleId]);

    const fetchDocuments = async () => {
        try {
            const data = await getDocumentsByVehicle(vehicleId);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }

        setUploading(true);
        try {
            await uploadDocuments(vehicleId, selectedFiles);
            alert('Documents uploaded successfully!');
            setSelectedFiles([]);
            document.getElementById('fileInput').value = '';
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading documents:', error);
            alert('Error uploading documents');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await deleteDocument(id);
                fetchDocuments();
            } catch (error) {
                console.error('Error deleting document:', error);
                alert('Error deleting document');
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Upload Section */}
            <div className="card bg-blue-50">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Upload Documents</h3>
                <div className="space-y-3">
                    <input
                        id="fileInput"
                        type="file"
                        className="input"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    />
                    <p className="text-xs text-gray-500">
                        Accepted: PDF, Images, Word, Excel (Max 10MB per file)
                    </p>
                    {selectedFiles.length > 0 && (
                        <div className="text-sm text-gray-600">
                            {selectedFiles.length} file(s) selected
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                        className="btn btn-primary"
                    >
                        {uploading ? 'Uploading...' : 'Upload Files'}
                    </button>
                </div>
            </div>

            {/* Documents List */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Uploaded Documents ({documents.length})
                </h3>

                {documents.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        No documents uploaded yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3 flex-1">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{doc.original_filename}</div>
                                        <div className="text-xs text-gray-500">
                                            {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => downloadDocument(doc.id)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Download"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentUploader;
