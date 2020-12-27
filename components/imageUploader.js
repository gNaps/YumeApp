import { useState, useEffect } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';


export default function ImageUploader() {

    const [image, setImage] = React.useState('');
    if(typeof window !== 'undefined') {
        React.useEffect(() => {
            if(localStorage.getItem('imageProfile')) {
                setImage(localStorage.getItem('imageProfile'))
            }
        }, [])
    }

  function fileUploader(e) {
    if(e.target.files.length == 0) return;
    var blob = URL.createObjectURL(e.target.files[0]);
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]); 
    
    reader.onloadend = function() {
        var base64data = reader.result;                
        var image = new Image();
        image.src = base64data;
        image.onload = function () {
            var image = base64data.replace('data:image/png;base64,', '')
            var height = this.height;
            var width = this.width;
            if (height > 2000 || width > 2000) {
                alert("Height and Width must not exceed 2000px.");
                e.target.files = [];
            } else {
                const username = cookie.get("user");

                axios
                .put(`${process.env.NEXT_PUBLIC_API_URL}/users/updateimage/${username}`, 
                    {
                        User: {
                            id: parseInt(username)
                        },
                        Image: image
                    }, 
                    { headers: { authorization: 'Bearer ' + cookie.get('jwt') } })
                .then(data => {
                    console.log("data success", data)
                    if (data.status == 204) {
                        setImage(base64data)
                        localStorage.setItem('imageProfile', base64data)
                    }
                })
            }
        }
    }
  }

  function triggerUpload() {
    document.getElementById('uploader_profile_pic').click();
  }

  return (
    <>
        {image && 
            <div>
                <div 
                style={{ width: '100px', borderRadius: '50px',
                        height: '100px',  backgroundImage: 'url('+image+')', 
                        backgroundPosition: 'center', backgroundSize: 'contain'}} 
                onClick={triggerUpload} />
                <input 
                    type='file' 
                    id='uploader_profile_pic' 
                    style={{ display: 'none', width: '0px' }}
                    onClick={fileUploader} /> 
            </div>
            }

        {!image && 
            <div>
                <div style={{ width: '100px', borderRadius: '50px',
                height: '100px',  backgroundColor: '#e2e2e2', display: 'flex', 
                justifyContent: 'center', alignItems: 'center', color: 'white'}} onClick={triggerUpload}>
                    <i class="fas fa-user fa-4x" />
                </div>
                <input 
                    type='file' 
                    id='uploader_profile_pic' 
                    style={{ display: 'none', width: '0px' }}
                    onClick={fileUploader} /> 
            </div>
        }
    </>
  );
}