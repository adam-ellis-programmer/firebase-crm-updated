import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandsClapping, faImage } from '@fortawesome/free-solid-svg-icons'

import { doc, setDoc, serverTimestamp, FieldPath } from 'firebase/firestore'
import { db } from '../../firebase.config'
import { useParams, useNavigate } from 'react-router-dom'

import { useAuthStatusTwo } from '../../hooks/useAuthStatusTwo'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { getAgent } from '../../crm context/CrmAction'

const NewSignupForm = () => {
  const { uid } = useParams()
  const { loggedIn, checkingStatus, loggedInUser, claims } = useAuthStatusTwo()
  const [agentData, setAgentData] = useState(null)
  // console.log(claims?.claims.orgName)
  useEffect(() => {
    const getData = async () => {
      const res = await getAgent(claims?.claims?.agentId)
      console.log(res)
      setAgentData(res?.data) 
    }

    if (claims?.claims) {
      getData()
    }

    return () => {}
  }, [claims?.claims])

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: 'Mellisa Harper',
    email: 'mellisa123@gmail.com',
    phone: '07777777654',
    company: 'none',
    address: '1 London Bridge',
    image: null,
    orgName: '',
    agentId: '',
  })

  const [alertState, setAlertState] = useState({
    show: false,
    text: '',
  })
  const [isDragging, setIsDragging] = useState(false)

  const { name, email, phone, company, address, image, orgId } = formData

  useEffect(() => {
    if (claims?.claims?.orgId && claims?.claims?.orgName) {
      setFormData((prev) => ({
        ...prev,
        orgId: claims.claims.orgId,
        orgName: claims.claims.orgName,
        agentId: claims.claims.orgId,
      }))
    }
  }, [claims?.claims?.orgId, claims?.claims?.orgName])

  useEffect(() => {
    // Cleanup function to revoke the object URL when the component is unmounted
    return () => {
      if (image) {
        //  URLs stay in the browser's memory until we explicitly remove them.
        URL.revokeObjectURL(image.preview)
      }
    }
  }, [image])

  const onMutate = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleDrop = (e) => {
    //    const files = Array.from(e.dataTransfer.files)
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      // initial render image will be null so we check
      // we can just use a ? and opt chaining
      if (image) {
        URL.revokeObjectURL(image.preview) // Revoke the previous URL
      }

      const previewURL = URL.createObjectURL(file)
      // console.log('Preview URL:', previewURL)
      setFormData((prevData) => ({
        ...prevData,
        image: { file, preview: previewURL },
      }))
    }
  }

  const handleFileSelect = (e) => {
    // const files = Array.from(e.target.files)
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      // initial render image will be null so we check
      // we can just use a ? and opt chaining
      if (image) {
        URL.revokeObjectURL(image.preview) // Revoke the previous URL
      }

      const previewURL = URL.createObjectURL(file)
      // console.log('Preview URL:', previewURL)
      setFormData((prevData) => ({
        ...prevData,
        image: { file, preview: previewURL },
      }))
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const uploadImg = (id, file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage()
      const filePath = `profilePictures/${id}/profile-pic`

      // Create the file metadata
      /** @type {any} */
      const metadata = {
        contentType: 'image/jpeg',
      }

      // Upload file and metadata to the object 'images/mountains.jpg'
      const storageRef = ref(storage, filePath)
      const uploadTask = uploadBytesResumable(storageRef, file, metadata)

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ' + progress + '% done')
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused')
              break
            case 'running':
              console.log('Upload is running')
              break
          }
        },
        (error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break
            case 'storage/canceled':
              // User canceled the upload
              break

            // ...

            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break
          }
          reject(error)
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve({ path: filePath, url: downloadURL })
            console.log('File available at', downloadURL)
          })
        }
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // if the agent has not got manager permission
    if (claims.claims.roleLevel < 2) {
      console.log('you are not authorized to sign up new customers! ')
      return
    }

    function checkEmail(email) {
      // [^\s@] allow any char but space and @ Symbal
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      const check = regex.test(email)
      return check
    }

    if (!email || !name || !company) {
      setAlertState((prevState) => ({
        ...prevState,
        show: true,
        text: 'please provide name, email, & company',
      }))
      resetAlert()
      return
    }

    if (!checkEmail(email)) {
      setAlertState((prevState) => ({
        ...prevState,
        show: true,
        text: 'email is invalid',
      }))
      resetAlert()
      return
    }

    if (!address) {
      setAlertState((prevState) => ({
        ...prevState,
        show: true,
        text: 'please provide an address',
      }))

      resetAlert()
      return
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEO_KEY}`
    )

    const geocodeData = await response.json()
    let geoLocation = {}
    let formattedAddress
    geoLocation.lat = geocodeData.results[0]?.geometry.location.lat ?? 0
    geoLocation.lng = geocodeData.results[0]?.geometry.location.lng ?? 0
    formattedAddress =
      geocodeData.status === 'ZERO_RESULTS'
        ? undefined
        : geocodeData.results[0]?.formatted_address

    const id = crypto.randomUUID()
    let urlData = {} // Initialize urlData as an empty object

    // Set the default URL if no image is provided
    urlData.url = process.env.REACT_APP_PROFILE_URL

    // if user uploads img
    if (image?.file) urlData = await uploadImg(id, image?.file)

    delete formData.image
    const userData = {
      ...formData,
      geoLocation,
      formattedAddress,
      phone: formattNumber(),
      urlData,
      progress: 0,
      orgId,
      signUpagent: loggedInUser.displayName,
      agentUid: loggedInUser.uid,
      dateOfSignUp: new Date().toLocaleString('en-GB'),
      timestamp: serverTimestamp(),
      reportsTo: agentData?.reportsTo,
      custId: id,
      docAccessLevel: claims?.claims?.roleLevel,
    }
    const stats = {
      name,
      email,
      custId: id,
      amountSpent: 0,
      numberOfOrders: 0,
      rating: 0,
      orgId,
      points: 0,
      goldCustomer: false,
      company,
      // timestamp: serverTimestamp(),
      signUpagent: loggedInUser.displayName,
      agentUid: loggedInUser.uid,
    }

    try {
      await setDoc(doc(db, 'customers', id), userData)
      await setDoc(doc(db, 'stats', id), stats)
      resetState()
      navigate(`/data/${loggedInUser.uid}}`)
    } catch (error) {
      console.log(error)
    }
  }

  function resetState() {
    setFormData((prevState) => ({
      ...prevState,
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      image: null,
    }))
  }

  function resetAlert() {
    setTimeout(() => {
      setAlertState((prevState) => ({
        ...prevState,
        show: false,
        text: '',
      }))
    }, 2000)
  }

  function formattNumber() {
    const n = phone
    // Check if 11 digits first
    const nRegex = /^(?=\d{11}$)(\d{5})(\d{3})(\d{2})/
    const formatted = n.replace(nRegex, '($1)-$2-$3')
    return formatted
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='sign-up-form-group'>
        <input
          name='name'
          onChange={onMutate}
          className='signup-input'
          type='text'
          placeholder='enter name'
          value={name}
        />
      </div>

      <div className='sign-up-form-group'>
        <input
          name='email'
          onChange={onMutate}
          className='signup-input'
          type='text'
          placeholder='enter email'
          value={email}
        />
      </div>

      <div className='sign-up-form-group'>
        <input
          name='company'
          onChange={onMutate}
          className='signup-input'
          type='text'
          placeholder='enter company'
          value={company}
        />
      </div>

      <div className='sign-up-form-group'>
        <input
          name='phone'
          onChange={onMutate}
          className='signup-input'
          type='text'
          placeholder='enter phone'
          value={phone}
        />
      </div>

      {/* alert */}
      {alertState.show && (
        <div className='new-cusotmer-alert'>
          <p>{alertState.text}</p>
        </div>
      )}
      {/* alert */}

      <div className='sign-up-form-group text-area-group'>
        <textarea
          name='address'
          onChange={onMutate}
          className='address-input'
          placeholder='enter address'
          value={address}
        ></textarea>

        {image && (
          <div className='image-container'>
            <img src={image.preview} alt='preview' className='image-preview' />
          </div>
        )}
      </div>

      <div className='sign-up-form-group'>
        <div
          className={`img-drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type='file'
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id='fileInput'
          />
          <label htmlFor='fileInput' className='img-drop-label'>
            <FontAwesomeIcon className='img-icon' icon={faImage} />
          </label>
          <span>Drag & drop or click to upload an image</span>
        </div>
      </div>

      <button className='new-signup-btn' type='submit'>
        Submit
      </button>
    </form>
  )
}

export default NewSignupForm
