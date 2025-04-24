import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/functions'; // Import Firebase Functions SDK

// Make sure Firebase is initialized somewhere, for example in firebase.js
// If you're using Firebase Authentication or other Firebase features, make sure to initialize them too.

const SendEmailForm = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSendEmail = async () => {
    const sendEmail = firebase.functions().httpsCallable('sendCustomEmail');

    try {
      const result = await sendEmail({
        to,         // Get email address from state
        subject,    // Get subject from state
        message,    // Get message from state
      });

      console.log('Email sent:', result.data);
      setStatus('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('Error sending email: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Send Email</h2>
      <input
        type="email"
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendEmail}>Send Email</button>
      <p>{status}</p>
    </div>
  );
};

export default SendEmailForm;