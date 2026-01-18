import { useRef, useState } from 'react'
import './FileUploader.css'

function FileUploader({ label, accept, file, onFileSelect, onFileRemove }) {
    const inputRef = useRef(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && isValidFile(droppedFile)) {
            onFileSelect(droppedFile)
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && isValidFile(selectedFile)) {
            onFileSelect(selectedFile)
        }
    }

    const isValidFile = (file) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        const maxSize = 10 * 1024 * 1024 // 10MB

        if (!validTypes.includes(file.type)) {
            alert('PDF, JPG, PNG 파일만 업로드 가능합니다.')
            return false
        }

        if (file.size > maxSize) {
            alert('파일 크기는 10MB 이하여야 합니다.')
            return false
        }

        return true
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (file) {
        return (
            <div className="file-preview">
                <div className="file-info">
                    <div className="file-icon">
                        {file.type === 'application/pdf' ? 'PDF' : 'IMG'}
                    </div>
                    <div className="file-details">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button className="remove-btn" onClick={onFileRemove}>
                    X
                </button>
            </div>
        )
    }

    return (
        <div
            className={`file-uploader ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <div className="upload-icon">+</div>
            <p className="upload-label">{label}</p>
            <p className="upload-hint">클릭하거나 파일을 여기에 드래그하세요</p>
            <p className="upload-formats">PDF, JPG, PNG (최대 10MB)</p>
        </div>
    )
}

export default FileUploader
