import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const Popup = ({ type, message, clear }) => {
  useEffect(() => {
    if (message) {
      Swal.fire({
        icon: type,
        title: type === 'error' ? 'Oops!' : 'Success!',
        text: message,
        confirmButtonColor: '#7C3AED',
        background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
        color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
        customClass: {
          popup: 'beautiful-popup'
        }
      }).then(() => {
        if (clear) clear('');
      });
    }
  }, [message, type, clear]);

  return null;
};

export default Popup;
