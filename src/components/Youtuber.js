import React from "react";
import ReactPlayer from 'react-player'

function Youtuber({ url="https://www.youtube.com/watch?v=m32wUYMDJi0"}) {

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
            <ReactPlayer
                url={url}
                controls
                width="100%"
                height="100%"
            />
        </div>
      <div>
    </div>
    </div>
  );
}

export default Youtuber;