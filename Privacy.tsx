
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Privacy Policy for DiceTools.online</h1>
      <p className="text-lg text-gray-400 mb-4">
        At DiceTools.online, we are committed to protecting your privacy. This Privacy Policy outlines our practices concerning the collection, use, and disclosure of information when you use our services.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">Information We Do Not Collect</h2>
      <p className="text-lg text-gray-400 mb-4">
        We want to be crystal clear: we do not collect, store, or share any personal information about our users. Most of our tools process data entirely on your device (client-side) or, for more complex tasks, on our servers. In either case, the data you input and the results you receive are not saved or logged by us.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">Information We Collect Automatically</h2>
      <p className="text-lg text-gray-400 mb-4">
        Like most website operators, we may collect non-personally-identifying information that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. Our purpose in collecting this information is to better understand how our visitors use the website so we can improve our services. This information is never linked to your identity.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">Data Security</h2>
      <p className="text-lg text-gray-400 mb-4">
        While we do not store your data, we take the security of our website and your connection to it seriously. We use industry-standard security measures, including SSL encryption, to ensure that any data transmitted between your browser and our server is secure.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">Third-Party Services</h2>
      <p className="text-lg text-gray-400 mb-4">
        Our website may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">Changes to This Privacy Policy</h2>
      <p className="text-lg text-gray-400 mb-4">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-2xl font-bold mb-2 text-blue-300">Contact Us</h2>
      <p className="text-lg text-gray-400">
        If you have any questions about this Privacy Policy, please contact us at 
        <a href="mailto:contact@dicetools.online" className="text-blue-400 hover:underline ml-1">contact@dicetools.online</a>.
      </p>
    </div>
  );
};

export default Privacy;
