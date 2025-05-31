// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import { auth } from '../firebase';

// function EventDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [event, setEvent] = useState(null);
//   const [photos, setPhotos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({});
//   const [shareInfo, setShareInfo] = useState(null);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [statistics, setStatistics] = useState(null);

//   const fetchEventDetails = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get(`/events/${id}`);
//       setEvent(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Fetch error details:', error);
//       setError(error.response?.data?.message || 'Failed to fetch event details');
//       setLoading(false);
//     }
//   }, [id]);

//   const fetchEventAndPhotos = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError('');

//       // Fetch event details
//       await fetchEventDetails();

//       // Fetch photos separately
//       const photosResponse = await axiosInstance.get(`/photos/event/${id}`);
//       setPhotos(photosResponse.data || []);
//     } catch (error) {
//       console.error('Fetch error details:', error);
//       if (error.response?.status === 404) {
//         setError(`Event not found: ${error.response.data?.message}`);
//         setTimeout(() => navigate('/events'), 2000);
//       } else if (error.response?.status === 401) {
//         setError('Please login to view this event');
//         setTimeout(() => navigate('/login'), 2000);
//       } else {
//         setError(`Failed to load event details: ${error.response?.data?.message || error.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [id, navigate, fetchEventDetails]);

//   const fetchStatistics = useCallback(async () => {
//     try {
//       const response = await axiosInstance.get(`/events/${id}/statistics`);
//       setStatistics(response.data.statistics);
//     } catch (error) {
//       console.error('Error fetching statistics:', error);
//       // Only show error if it's not a 403 (unauthorized) error
//       if (error.response?.status !== 403) {
//         setError('Failed to load event statistics. Please try again.');
//       }
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchEventAndPhotos();
//   }, [fetchEventAndPhotos]);

//   useEffect(() => {
//     if (event?.creator === auth.currentUser?.uid) {
//       fetchStatistics();
//     }
//   }, [event, fetchStatistics]);

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setSelectedFiles(files);
//   };

//   const handleUpload = async () => {
//     if (selectedFiles.length === 0) {
//       setError('Please select files to upload');
//       return;
//     }

//     setUploading(true);
//     setError('');
//     const newUploadProgress = {};

//     try {
//       // Upload files sequentially
//       for (let i = 0; i < selectedFiles.length; i++) {
//         const file = selectedFiles[i];
//         const formData = new FormData();
//         formData.append('photo', file);
//         formData.append('eventId', id);

//         // Update progress for this file
//         newUploadProgress[file.name] = 0;
//         setUploadProgress({ ...newUploadProgress });

//         const response = await axiosInstance.post('/photos/upload', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           },
//           onUploadProgress: (progressEvent) => {
//             const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             newUploadProgress[file.name] = progress;
//             setUploadProgress({ ...newUploadProgress });
//           }
//         });

//         setPhotos(prevPhotos => [...prevPhotos, response.data]);
//       }

//       setSelectedFiles([]);
//       // Refresh statistics after upload
//       if (event?.creator === auth.currentUser?.uid) {
//         fetchStatistics();
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       setError('Failed to upload photos. Please try again.');
//     } finally {
//       setUploading(false);
//       setUploadProgress({});
//     }
//   };

//   const removeSelectedFile = (fileName) => {
//     setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
//   };

//   const handleShare = async () => {
//     try {
//       const response = await axiosInstance.post(`/events/${id}/share`);
//       setShareInfo(response.data);
//       setShowShareModal(true);
//     } catch (error) {
//       console.error('Share error:', error);
//       setError('Failed to generate share link. Please try again.');
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     alert('Copied to clipboard!');
//   };

//   const handleDownload = async (photoUrl, photoId) => {
//     try {
//       // Track the download
//       await axiosInstance.post(`/events/${id}/photos/${photoId}/download`);
      
//       // Create a temporary link element
//       const link = document.createElement('a');
//       link.href = photoUrl;
//       link.download = `photo-${Date.now()}.jpg`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       // Refresh statistics
//       fetchStatistics();
//     } catch (error) {
//       console.error('Download error:', error);
//     }
//   };

//   const handleDeletePhoto = async (photoId) => {
//     if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       console.log('Attempting to delete photo with ID:', photoId);
//       setLoading(true);
      
//       const response = await axiosInstance.delete(`/photos/${photoId}`);
//       console.log('Delete response:', response.data);
      
//       if (response.data.message === 'Photo deleted successfully') {
//         // Remove the photo from the state
//         setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
//         // Show success message
//         setError('');
//         console.log('Photo successfully removed from state');
//       } else {
//         throw new Error('Failed to delete photo');
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       console.error('Error details:', {
//         status: error.response?.status,
//         message: error.response?.data?.message,
//         photoId
//       });
//       setError(error.response?.data?.message || 'Failed to delete photo. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdatePhoto = async (photoId) => {
//     // You can implement photo update functionality here
//     // For example, opening a modal to edit photo details
//     console.log('Update photo:', photoId);
//   };

//   if (loading) {
//     return (
//       <div className="min-vh-100 bg-light">
//         <div className="d-flex justify-content-center align-items-center min-vh-100">
//           <div className="text-center">
//             <div className="spinner-grow text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger rounded-pill shadow-sm" role="alert">
//           <i className="bi bi-exclamation-circle me-2"></i>
//           {error}
//         </div>
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-info rounded-pill shadow-sm" role="alert">
//           <i className="bi bi-info-circle me-2"></i>
//           Event not found
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-vh-100 bg-light">
//       {loading ? (
//         <div className="d-flex justify-content-center align-items-center min-vh-100">
//           <div className="text-center">
//             <div className="spinner-grow text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         </div>
//       ) : error ? (
//         <div className="container py-5">
//           <div className="alert alert-danger rounded-pill shadow-sm" role="alert">
//             <i className="bi bi-exclamation-circle me-2"></i>
//             {error}
//           </div>
//         </div>
//       ) : !event ? (
//         <div className="container py-5">
//           <div className="alert alert-info rounded-pill shadow-sm" role="alert">
//             <i className="bi bi-info-circle me-2"></i>
//             Event not found
//           </div>
//         </div>
//       ) : (
//         <div className="container-fluid p-0">
//           {/* Hero Section */}
//           <div className="position-relative bg-dark text-white py-5 mb-4">
//             <div className="container">
//               <div className="row align-items-center">
//                 <div className="col-lg-8">
//                   <h1 className="display-4 fw-bold mb-3">{event.name}</h1>
//                   <div className="d-flex align-items-center gap-4 mb-4">
//                     <span className="d-flex align-items-center">
//                       <i className="bi bi-calendar3 me-2"></i>
//                       {new Date(event.date).toLocaleDateString()}
//                     </span>
//                     <span className="d-flex align-items-center">
//                       <i className="bi bi-images me-2"></i>
//                       {photos.length} Photos
//                     </span>
//                   </div>
//                   <p className="lead mb-4">{event.description}</p>
//                   <div className="d-flex gap-3">
//                     <button
//                       className="btn btn-light btn-lg px-4 rounded-pill"
//                       onClick={handleShare}
//                     >
//                       <i className="bi bi-share me-2"></i>
//                       Share Event
//                     </button>
//                     <button
//                       className="btn btn-outline-light btn-lg px-4 rounded-pill"
//                       onClick={() => document.getElementById('photoUpload').click()}
//                     >
//                       <i className="bi bi-cloud-upload me-2"></i>
//                       Upload Photos
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Statistics Section */}
//           {event?.creator === auth.currentUser?.uid && statistics && (
//             <div className="container mb-5">
//               <div className="row g-4">
//                 <div className="col-md-4">
//                   <div className="card border-0 bg-white rounded-4 shadow-sm h-100">
//                     <div className="card-body p-4">
//                       <div className="d-flex align-items-center mb-3">
//                         <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
//                           <i className="bi bi-people-fill text-primary fs-4"></i>
//                         </div>
//                         <div>
//                           <h6 className="text-muted mb-1">Total Visitors</h6>
//                           <h3 className="mb-0">{statistics.totalVisitors}</h3>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="card border-0 bg-white rounded-4 shadow-sm h-100">
//                     <div className="card-body p-4">
//                       <div className="d-flex align-items-center mb-3">
//                         <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3">
//                           <i className="bi bi-person-fill text-success fs-4"></i>
//                         </div>
//                         <div>
//                           <h6 className="text-muted mb-1">Unique Visitors</h6>
//                           <h3 className="mb-0">{statistics.uniqueVisitors}</h3>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="card border-0 bg-white rounded-4 shadow-sm h-100">
//                     <div className="card-body p-4">
//                       <div className="d-flex align-items-center mb-3">
//                         <div className="bg-info bg-opacity-10 p-3 rounded-3 me-3">
//                           <i className="bi bi-download text-info fs-4"></i>
//                         </div>
//                         <div>
//                           <h6 className="text-muted mb-1">Total Downloads</h6>
//                           <h3 className="mb-0">{statistics.totalDownloads}</h3>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Photo Upload Section */}
//           <div className="container mb-5">
//             <div className="card border-0 bg-white rounded-4 shadow-sm">
//               <div className="card-body p-4">
//                 <h5 className="mb-4">Upload New Photos</h5>
//                 <div className="mb-4">
//                   <input
//                     id="photoUpload"
//                     type="file"
//                     className="form-control form-control-lg"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     disabled={uploading}
//                     multiple
//                   />
//                 </div>

//                 {/* Selected Files Preview */}
//                 {selectedFiles.length > 0 && (
//                   <div className="mb-4">
//                     <h6 className="mb-3">Selected Files ({selectedFiles.length})</h6>
//                     <div className="selected-files-container">
//                       {selectedFiles.map((file) => (
//                         <div key={file.name} className="selected-file-item mb-3">
//                           <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3">
//                             <div className="d-flex align-items-center">
//                               <i className="bi bi-image text-primary me-3 fs-4"></i>
//                               <div>
//                                 <p className="mb-1">{file.name}</p>
//                                 <small className="text-muted">
//                                   {(file.size / 1024 / 1024).toFixed(2)} MB
//                                 </small>
//                               </div>
//                             </div>
//                             <div className="d-flex align-items-center">
//                               {uploadProgress[file.name] !== undefined && (
//                                 <div className="progress me-3" style={{ width: '100px' }}>
//                                   <div
//                                     className="progress-bar"
//                                     role="progressbar"
//                                     style={{ width: `${uploadProgress[file.name]}%` }}
//                                     aria-valuenow={uploadProgress[file.name]}
//                                     aria-valuemin="0"
//                                     aria-valuemax="100"
//                                   >
//                                     {uploadProgress[file.name]}%
//                                   </div>
//                                 </div>
//                               )}
//                               <button
//                                 className="btn btn-outline-danger btn-sm rounded-pill"
//                                 onClick={() => removeSelectedFile(file.name)}
//                                 disabled={uploading}
//                               >
//                                 <i className="bi bi-x"></i>
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div className="d-flex justify-content-end">
//                   <button
//                     className="btn btn-primary btn-lg px-4 rounded-pill"
//                     onClick={handleUpload}
//                     disabled={selectedFiles.length === 0 || uploading}
//                   >
//                     {uploading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2"></span>
//                         Uploading...
//                       </>
//                     ) : (
//                       <>
//                         <i className="bi bi-cloud-upload me-2"></i>
//                         Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Photo Gallery */}
//           <div className="container mb-5">
//             <div className="card border-0 bg-white rounded-4 shadow-sm">
//               <div className="card-body p-4">
//                 <div className="d-flex justify-content-between align-items-center mb-4">
//                   <h4 className="mb-0">Photo Gallery</h4>
//                   <span className="badge bg-primary rounded-pill">
//                     {photos.length} Photos
//                   </span>
//                 </div>
//                 {photos && photos.length > 0 ? (
//                   <div className="photo-gallery-container">
//                     <div className="row g-4">
//                       {photos.map((photo) => (
//                         <div key={photo._id} className="col-md-4 col-lg-3">
//                           <div className="card border-0 bg-light rounded-4 shadow-sm h-100">
//                             <div className="position-relative">
//                               <img
//                                 src={photo.url}
//                                 className="card-img-top rounded-top-4"
//                                 alt={`From ${event.name}`}
//                                 style={{ height: '250px', objectFit: 'cover' }}
//                               />
//                               <div className="position-absolute top-0 end-0 p-3">
//                                 <span className="badge bg-dark bg-opacity-75 rounded-pill">
//                                   {new Date(photo.createdAt).toLocaleDateString()}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="card-body p-3">
//                               {event?.creator === auth.currentUser?.uid ? (
//                                 <div className="d-flex gap-2">
//                                   <button
//                                     className="btn btn-outline-primary flex-grow-1 rounded-pill"
//                                     onClick={() => handleUpdatePhoto(photo._id)}
//                                   >
//                                     <i className="bi bi-pencil me-2"></i>
//                                     Edit
//                                   </button>
//                                   <button
//                                     className="btn btn-outline-danger flex-grow-1 rounded-pill"
//                                     onClick={() => handleDeletePhoto(photo._id)}
//                                   >
//                                     <i className="bi bi-trash me-2"></i>
//                                     Delete
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <button
//                                   className="btn btn-primary w-100 rounded-pill"
//                                   onClick={() => handleDownload(photo.url, photo._id)}
//                                 >
//                                   <i className="bi bi-download me-2"></i>
//                                   Download
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-5">
//                     <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
//                       <i className="bi bi-images text-muted fs-1"></i>
//                     </div>
//                     <h5 className="text-muted">No photos yet</h5>
//                     <p className="text-muted">Upload your first photo to get started!</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Update the style block */}
//           <style jsx>{`
//             .photo-gallery-container {
//               position: relative;
//               max-height: 800px;
//               overflow-y: auto;
//               padding-right: 10px;
//               margin: 0 -0.5rem;
//             }
//             .photo-gallery-container::-webkit-scrollbar {
//               width: 8px;
//             }
//             .photo-gallery-container::-webkit-scrollbar-track {
//               background: transparent;
//               border-radius: 4px;
//             }
//             .photo-gallery-container::-webkit-scrollbar-thumb {
//               background-color: rgba(0, 0, 0, 0.2);
//               border-radius: 4px;
//             }
//             .photo-gallery-container::-webkit-scrollbar-thumb:hover {
//               background-color: rgba(0, 0, 0, 0.3);
//             }
//             .selected-files-container {
//               max-height: 300px;
//               overflow-y: auto;
//               scrollbar-width: thin;
//               scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
//             }
//             .selected-files-container::-webkit-scrollbar {
//               width: 8px;
//             }
//             .selected-files-container::-webkit-scrollbar-track {
//               background: transparent;
//               border-radius: 4px;
//             }
//             .selected-files-container::-webkit-scrollbar-thumb {
//               background-color: rgba(0, 0, 0, 0.2);
//               border-radius: 4px;
//             }
//             .selected-files-container::-webkit-scrollbar-thumb:hover {
//               background-color: rgba(0, 0, 0, 0.3);
//             }
//             .progress {
//               height: 8px;
//               background-color: #e9ecef;
//             }
//             .progress-bar {
//               background-color: #0d6efd;
//               transition: width 0.3s ease;
//             }
//           `}</style>

//           {/* Share Modal */}
//           {showShareModal && shareInfo && (
//             <div className="modal show d-block" tabIndex="-1">
//               <div className="modal-dialog modal-dialog-centered">
//                 <div className="modal-content border-0 rounded-4 shadow">
//                   <div className="modal-header border-0">
//                     <h5 className="modal-title">Share Event</h5>
//                     <button
//                       type="button"
//                       className="btn-close"
//                       onClick={() => setShowShareModal(false)}
//                     ></button>
//                   </div>
//                   <div className="modal-body">
//                     <div className="text-center mb-4">
//                       <img 
//                         src={shareInfo.qrCode} 
//                         alt="QR Code" 
//                         className="img-fluid rounded-4 shadow-sm"
//                         style={{ maxWidth: '200px' }} 
//                       />
//                     </div>
//                     <div className="mb-4">
//                       <label className="form-label">Share Link</label>
//                       <div className="input-group">
//                         <input
//                           type="text"
//                           className="form-control form-control-lg"
//                           value={shareInfo.shareUrl}
//                           readOnly
//                         />
//                         <button
//                           className="btn btn-primary px-4"
//                           type="button"
//                           onClick={() => copyToClipboard(shareInfo.shareUrl)}
//                         >
//                           <i className="bi bi-clipboard me-2"></i>
//                           Copy
//                         </button>
//                       </div>
//                     </div>
//                     <div className="mb-4">
//                       <label className="form-label">Share Code</label>
//                       <div className="input-group">
//                         <input
//                           type="text"
//                           className="form-control form-control-lg"
//                           value={shareInfo.shareCode}
//                           readOnly
//                         />
//                         <button
//                           className="btn btn-primary px-4"
//                           type="button"
//                           onClick={() => copyToClipboard(shareInfo.shareCode)}
//                         >
//                           <i className="bi bi-clipboard me-2"></i>
//                           Copy
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="modal-footer border-0">
//                     <button
//                       type="button"
//                       className="btn btn-light px-4 rounded-pill"
//                       onClick={() => setShowShareModal(false)}
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default EventDetails; 