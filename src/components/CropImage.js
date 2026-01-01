import React, { useState, useRef } from 'react'
import 'react-image-crop/dist/ReactCrop.css'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import { colors } from '../configs';
import { checkSource } from '../Utility/function';
import loadImage from 'blueimp-load-image/js';
import { prepareFirebaseImage } from '../db/firestore';


// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

function CropImage({onClick, onHide,ratio=1, imgSrc}) {
  const [test, setTest] = useState('')
  // const [imgSrc, setImgSrc] = useState('')
  const previewCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const hiddenAnchorRef = useRef(null)
  const blobUrlRef = useRef('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState(ratio)

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      // reader.addEventListener('load', () =>
      //   setImgSrc(reader.result?.toString() || '')
      // )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // const onSelectFile =  (e) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     loadImage(
  //       e.target.files[0],
  //       (img) => {
  //         var base64data = img.toDataURL(`image/jpeg`);
  //         setImgSrc(base64data);
  //         console.log(base64data)
  //       },
  //       { orientation: true, canvas: true }
  //     );
  //     // const reader = new FileReader();
  //     // reader.addEventListener('load', () => setUpImg(reader.result));
  //     // reader.readAsDataURL(e.target.files[0]);
  //   }
  // };

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const drawCanvasWithBackground = (canvas, crop, img) => {
    const ctx = canvas.getContext('2d');
  
    // Set canvas size to the crop dimensions
    canvas.width = crop.width;
    canvas.height = crop.height;
  
    // Fill the canvas with a white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Calculate the scale between the displayed image and the original image
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
  
    // Draw the cropped section of the image
    ctx.drawImage(
      img,
      crop.x * scaleX, // Scaled crop start X
      crop.y * scaleY, // Scaled crop start Y
      crop.width * scaleX, // Scaled crop width
      crop.height * scaleY, // Scaled crop height
      0,
      0,
      canvas.width,
      canvas.height
    );
  };
  
  
  async function onDownloadCropClick() {
    if (!previewCanvasRef.current || !imgRef.current || !completedCrop) {
      throw new Error('Crop canvas or image does not exist');
    }
  
    // Draw the cropped image with a white background
    drawCanvasWithBackground(previewCanvasRef.current, completedCrop, imgRef.current);
  
    // Convert the canvas content to a Blob
    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }
  
      // Create a blob URL
      blobUrlRef.current = URL.createObjectURL(blob);
  
      // Use loadImage to process the blob (if necessary)
      loadImage(
        blobUrlRef.current,
        async (img) => {
          console.log('Processed image');
  
          // Convert the processed image to Base64
          const base64data = img.toDataURL('image/jpeg');
          onClick(base64data);
        },
        { orientation: true, canvas: true }
      );
    });
  }
  


  // async function onDownloadCropClick() {
  //   if (!previewCanvasRef.current) {
  //     throw new Error('Crop canvas does not exist')
  //   }
  //   previewCanvasRef.current.toBlob((blob) => {
  //     if (!blob) {
  //       throw new Error('Failed to create blob')
  //     }
    
  //     blobUrlRef.current = URL.createObjectURL(blob);
  //     loadImage(
  //       blobUrlRef.current,
  //       async (img) => {
  //         console.log('img')
  //         var base64data = img.toDataURL(`image/jpeg`);
  //         onClick(base64data)
  //       },
  //       { orientation: true, canvas: true }
  //     );
  //   })
  // }


  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined)
    } else if (imgRef.current) {
      const { width, height } = imgRef.current
      setAspect(ratio)
      setCrop(centerAspectCrop(width, height, ratio))
    }
  }

  return (
    <div >
      <div className="Crop-Controls">
        <input type="file" accept="image/*" onChange={onSelectFile} />
      </div>
      {!!imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={ratio}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            // style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, maxWidth:'400px' }}
            style={{ maxWidth:'500px', backgroundColor:'white' }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      {!!completedCrop && (
        <>
          <div style={{display:'none'}} >
            <canvas
              ref={previewCanvasRef}
              style={{
                border: '1px solid black',
                objectFit: 'contain',
                width: completedCrop.width,
                height: completedCrop.height,
                backgroundColor:'white'
              }}
            />
          </div>
          <div>
              <Button onClick={onHide} variant="secondary" >close</Button>
              <Button style={{backgroundColor:colors.purpleRed,borderColor:colors.purpleRed,marginLeft:20,marginRight:20}} onClick={onDownloadCropClick} >confirm</Button>
            <a
              ref={hiddenAnchorRef}
              download
              style={{
                position: 'absolute',
                top: '-200vh',
                visibility: 'hidden',
              }}
            >
              Hidden download
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export default  CropImage