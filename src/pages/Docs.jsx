import { useEffect, useState, useRef, useMemo } from 'react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import { useAuthStatusTwo } from '../hooks/useAuthStatusTwo'
import { getAgent, getDocument, getDocumentsByCustId } from '../crm context/CrmAction'
import DocInfo from '../components/DocInfo'
import { canViewpage } from './view data dash/canView'
import RestricedAccessPage from './view data dash/RestricedAccessPage'
import Loader from '../assets/Loader'

const Docs = () => {
  const { claims } = useAuthStatusTwo()

  const cachedClaims = useMemo(() => {
    // Only memoize when claims are available
    if (!claims) return null

    return claims
  }, [claims])
  //

  const fileInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [documents, setDocuments] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadedFileURL, setUploadedFileURL] = useState(null)
  const { uid } = useParams()

  useEffect(() => {
    window.scrollTo({
      top: 0,
    })

    const getDocData = async () => {
      if (!uid) return
      try {
        const data = await getDocumentsByCustId(uid)
        const customer = await getDocument(uid, 'customers')
        setCustomer(customer)
        setDocuments(data)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
      }
    }

    getDocData()
    return () => {}
  }, [uid])

  // ==========================
  // only set authorized when we have all the data
  // ==========================
  useEffect(() => {
    if (claims && documents && customer) {
      const canView = canViewpage(claims)
      setIsAuthorized(canView)
    }
    return () => {}
  }, [claims, documents, customer])

  const handleButtonClick = () => {
    // Trigger the file input click
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Reset states when a new file is selected
      setUploadProgress(0)
      setUploadError(null)
      setUploadedFileURL(null)
    }
  }

  const uploadFileToFirebase = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const storage = getStorage()

      // Create a unique file path using timestamp and original filename
      const timestamp = new Date().getTime()
      const fileExtension = selectedFile.name.split('.').pop()
      const fileName = `${timestamp}-${selectedFile.name}`

      const storagePath = `/documents/${customer?.custId}/${fileName}`

      // Create storage reference
      const storageRef = ref(storage, storagePath)

      // Start upload task
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          // Dividing these gives you a fraction (e.g., 0.45 for 45% complete)
          // Multiplying by 100 converts to a percentage value
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          // Handle errors
          console.error('Upload failed:', error)
          setUploadError('Upload failed: ' + error.message)
          setIsUploading(false)
        },
        async () => {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          setUploadedFileURL(downloadURL)
          setIsUploading(false)

          // Store metadata in Firestore
          await saveDocumentMetadata(
            downloadURL,
            selectedFile.name,
            fileExtension,
            storagePath
          )
        }
      )
    } catch (error) {
      console.error('Error starting upload:', error)
      setUploadError('Error starting upload: ' + error.message)
      setIsUploading(false)
    }
  }

  const saveDocumentMetadata = async (url, fileName, fileType, storagePath) => {
    try {
      const db = getFirestore()
      await addDoc(collection(db, 'documents'), {
        name: fileName,
        type: fileType,
        url: url,
        uploadedAt: new Date(),
        size: selectedFile.size,
        custId: uid,
        accessLevel: cachedClaims?.claims?.roleLevel,
        pdfImg:
          'https://firebasestorage.googleapis.com/v0/b/crm---v1.appspot.com/o/misc%2Fsmall-pdf.png?alt=media&token=8fe91137-6c1c-4c37-8171-34fb868eb41e',
        storagePath,
      })
      console.log('Document metadata saved to Firestore')
    } catch (error) {
      console.error('Error saving metadata:', error)
      setUploadError('File uploaded but metadata could not be saved.')
    }
  }

  // display loader to stop flash
  if (isLoading) return <Loader />

  if (!isAuthorized) return <RestricedAccessPage />

  return (
    <div className="page-contaimer docs-page-grid">
      <div className="docs-page-grid-item">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="file-input-hidden"
          accept=".pdf,.doc,.docx"
        />

        <p className="document-page-name-p">
          Documents for <span>{customer?.name}</span>
        </p>

        <div className="docs-page-btn-wrap">
          <button onClick={handleButtonClick} className="upload-button">
            <span className="button-icon">+</span>
            Upload Document
          </button>
        </div>

        {selectedFile && (
          <div className="selected-file">
            Selected: {selectedFile.name}
            <div className="file-actions">
              <button
                onClick={uploadFileToFirebase}
                disabled={isUploading}
                className="upload-action-button"
              >
                {isUploading ? 'Uploading...' : 'Upload to Firebase'}
              </button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(uploadProgress)}% Uploaded</div>
          </div>
        )}

        {uploadError && <div className="upload-error">Error: {uploadError}</div>}

        {uploadedFileURL && (
          <div className="upload-success">
            Upload successful!
            <a
              href={uploadedFileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              View Document
            </a>
          </div>
        )}
      </div>
      <div className="docs-page-grid-item">
        {documents?.map((doc, i) => {
          return <DocInfo key={i} data={doc} />
        })}
      </div>
    </div>
  )
}

export default Docs
