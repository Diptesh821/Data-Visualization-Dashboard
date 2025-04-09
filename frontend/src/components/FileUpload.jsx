import React, { useState } from 'react';

const FileUpload = ({ endpoint, fieldName, onUploadSuccess, showBusinessNameInput }) => {
  const [file, setFile] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || (showBusinessNameInput && !businessName)) {
      setError('Please select a file and enter business name');
      return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);
    if (showBusinessNameInput) {
      formData.append('business_name', businessName);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onUploadSuccess(result);
      setFile(null);
      setBusinessName('');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit}>
        {showBusinessNameInput && (
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="mb-3">
          <input type="file" onChange={handleFileChange} className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary">Upload CSV</button>
      </form>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
};

export default FileUpload;
