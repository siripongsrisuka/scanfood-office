import React from "react";

function PaidFirst() {

  return (
    <div id="google_translate_element" >
      
        <div 
            style={{
                position: 'relative',
                width: '80%',
                height: '90vh', // Sets the height to 70% of the viewport height
                boxShadow: '0 2px 8px rgba(63, 69, 81, 0.16)',
                margin: '0 auto', // Centers the container horizontally
                overflow: 'hidden',
                borderRadius: '8px',
                willChange: 'transform'
            }}
            >
            <iframe
                loading="lazy"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                src="https://www.canva.com/design/DAGR8b9MLF0/afCPbDqrWBHg5fcyb9STWQ/view?embed"
                allowFullScreen
            />
        </div>
      <div>
    </div>
    </div>
  );
}

export default PaidFirst;