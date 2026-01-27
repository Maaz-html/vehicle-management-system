import { useState, useEffect } from 'react';
import {
    getDocumentsByVehicle,
    deleteDocument
} from '../services/vehicleService';
import config from '../config';

const DocumentUploader = ({ vehicleId, readOnly = false }) => {
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
            const fd = new FormData();
            fd.append('vehicle_id', vehicleId);
            selectedFiles.forEach(file => fd.append('documents', file));

            await uploadDocuments(fd);
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

    const getFileUrl = (doc) => {
        if (!doc) return '';
        if (doc.url) return doc.url; // Use URL from backend (Supabase)
        if (!doc.file_path) return '';

        // Fallback for old local files if any
        const baseUrl = config.API_URL.replace(/\/api$/, '');
        return `${baseUrl}/uploads/${doc.file_path}`;
    };

    const [previewDoc, setPreviewDoc] = useState(null);

    return (
        <div className="space-y-4">
            {/* Upload Section */}
            {!readOnly && (
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
            )}

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
                                    <div className="flex-1 cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                                        <div className="font-medium text-gray-800 hover:text-blue-600">
                                            {doc.original_filename || 'Document ' + doc.id}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatFileSize(doc.file_size || 0)} • {new Date(doc.uploaded_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="text-gray-600 hover:text-blue-600"
                                        title="Preview"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => window.open(getFileUrl(doc), '_blank')}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Download"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                    {!readOnly && (
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{previewDoc.original_filename || 'Preview'}</h3>
                            <button onClick={() => setPreviewDoc(null)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
                            {previewDoc.original_filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img src={getFileUrl(previewDoc)} alt="Preview" className="max-w-full max-h-full object-contain" />
                            ) : previewDoc.original_filename?.match(/\.pdf$/i) ? (
                                <iframe src={getFileUrl(previewDoc)} className="w-full h-[60vh]" title="PDF Preview"></iframe>
                            ) : (
                                <div className="text-center">
                                    <p className="mb-4 text-gray-600">Preview not available for this file type.</p>
                                    <button onClick={() => window.open(getFileUrl(previewDoc), '_blank')} className="btn btn-primary">
                                        Download to View
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUploader;


