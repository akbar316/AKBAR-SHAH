
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">About DiceTools.online</h1>
      <p className="text-lg text-gray-400 mb-4">
        DiceTools.online is your one-stop shop for a wide range of free online tools. We are dedicated to providing high-quality, easy-to-use utilities that can help you with a variety of tasks, from development and design to everyday productivity.
      </p>
      <h2 className="text-2xl font-bold mb-2 text-blue-300">Our Mission</h2>
      <p className="text-lg text-gray-400 mb-4">
        Our mission is to make powerful tools accessible to everyone, for free. We believe that you shouldn't have to pay for expensive software to get things done. Whether you're a student, a professional, or just someone who needs to get a task done, we have a tool for you.
      </p>
      <h2 className="text-2xl font-bold mb-2 text-blue-300">Our Tools</h2>
      <p className="text-lg text-gray-400">
        We offer a variety of tools, including:
      </p>
      <ul className="list-disc list-inside text-lg text-gray-400 ml-4">
        <li>AI Tools: Chat, Code Generator, Prompter, Resume Writer, Summarizer</li>
        <li>Developer Tools</li>
        <li>Image Tools</li>
        <li>PDF Tools</li>
        <li>SEO Tools</li>
        <li>Student Tools</li>
        <li>Text Tools</li>
        <li>And many more!</li>
      </ul>
    </div>
  );
};

export default About;
