import React from "react";
import {
  Modal,
} from "react-bootstrap";
import { FooterButton, InputArea } from "../components";
import { colors } from "../configs";

const { white, dark  } = colors;

function Modal_Note({
  backdrop=true, // true/false/static
  animation=true,
  show,
  onHide,
  centered=true,
  current,
  submit,
  setCurrent,
}) {
    const { imageUrls = [], content = '' } = current;

    function confirm(){
      submit()
    };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Convert each file to a Promise
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result?.toString() || "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    // Wait for all FileReaders to finish
    Promise.all(readers).then((results) => {
      // results = array of base64 strings
      setCurrent({ ...current, imageUrls: [...(imageUrls || []), ...results] });
    });
  };

  function deleteImage(url){
    const ok = window.confirm("คุณต้องการลบรูปภาพนี้ใช่หรือไม่?");
    if (!ok) return;
    const filteredImages = imageUrls.filter(img => img !== url);
    setCurrent({ ...current, imageUrls: filteredImages });
  }


  return (
    <Modal
      backdrop={backdrop}
      animation={animation}
      show={show}
      onHide={onHide}
      centered={centered}
       className="loading-screen"
       fullscreen
    >
      <Modal.Header closeButton>
        <h2><b>รายละเอียด อื่นๆ</b></h2>
      </Modal.Header>
      <Modal.Body  >
        <InputArea
            name='content'
            placeholder="คำแนะนำ"
            onChange={(event)=>{setCurrent({...current,content:event.target.value})}}
            value={content}
            strict={true}
            rows={8}
        />
      
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="file-upload"
              style={{
                padding: "10px 20px",
                backgroundColor: "#0D8266",
                color: white,
                borderRadius: "8px",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              เลือกรูปภาพ
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
              {imageUrls.map((img, index) => (
                <div key={index} style={{ margin: 10, position:'relative' }}>
                  <img
                    src={img}
                    alt={`upload-${index}`}
                    style={{ width: 150, height: 150, objectFit:'contain' }}
                  />
                  <div onClick={()=>{deleteImage(img)}} style={{position:'absolute',top:10,right:10,zIndex:999}} >
                    <i style={{fontSize:30,color:dark}} class="bi bi-trash3"></i>
                  </div>
                </div>
              ))}
            </div>
      </Modal.Body>
        <FooterButton {...{ onHide, submit:confirm }} />
    </Modal>
  );
};


export default Modal_Note;
