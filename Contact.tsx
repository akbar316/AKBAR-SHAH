
import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Contact Us</h1>
      <p className="text-lg text-gray-400 mb-4">
        We'd love to hear from you! Whether you have a question, a suggestion, or just want to say hi, please don't hesitate to get in touch.
      </p>
      <h2 className="text-2xl font-bold mb-2 text-blue-300">Email</h2>
      <p className="text-lg text-gray-400 mb-4">
        You can reach us by email at:
        <a href="mailto:contact@dicetools.online" className="text-blue-400 hover:underline ml-2">contact@dicetools.online</a>
      </p>
      <h2 className="text-2xl font-bold mb-2 text-blue-300">Feedback</h2>
      <p className="text-lg text-gray-400">
        We are always looking for ways to improve our tools. If you have any feedback, please let us know. We appreciate your input!
      </p>
    </div>
  );
};

export default Contact;
