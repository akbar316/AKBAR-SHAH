
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Terms of Service for DiceTools.online</h1>

      <p className="text-lg text-gray-400 mb-4">
        Welcome to DiceTools.online! By accessing or using our website and its tools, you agree to comply with and be bound by the following terms and conditions of use. Please read these terms carefully before using our services.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">1. Acceptance of Terms</h2>
      <p className="text-lg text-gray-400 mb-4">
        By using the tools and services provided on DiceTools.online, you are agreeing to these Terms of Service. If you do not agree to these terms, please do not use our services.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">2. Use of Tools</h2>
      <p className="text-lg text-gray-400 mb-4">
        The tools provided on DiceTools.online are for your personal and non-commercial use. You agree not to use our tools for any illegal or unauthorized purpose. You are responsible for any content you create or manipulate using our tools.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">3. Disclaimer of Warranties</h2>
      <p className="text-lg text-gray-400 mb-4">
        The tools on DiceTools.online are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the tools will be error-free, uninterrupted, or free of viruses or other harmful components. We do not make any warranties about the accuracy, reliability, or completeness of the results obtained through our tools.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">4. Limitation of Liability</h2>
      <p className="text-lg text-gray-400 mb-4">
        In no event shall DiceTools.online, its owners, or its affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our tools. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">5. Changes to the Terms of Service</h2>
      <p className="text-lg text-gray-400 mb-4">
        We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms of Service on this page. Your continued use of our services after any such changes constitutes your acceptance of the new Terms of Service.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">6. Contact Us</h2>
      <p className="text-lg text-gray-400">
        If you have any questions about these Terms of Service, please contact us at
        <a href="mailto:contact@dicetools.online" className="text-blue-400 hover:underline ml-1">contact@dicetools.online</a>.
      </p>
    </div>
  );
};

export default Terms;
