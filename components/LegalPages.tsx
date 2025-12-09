
import React from 'react';
import { ArrowLeft, Shield, Mail, FileText, CheckCircle, Lock, Server, Users } from 'lucide-react';

interface LegalPageProps {
  pageId: string;
  onBack: () => void;
}

export const LegalPageContainer: React.FC<LegalPageProps> = ({ pageId, onBack }) => {
  
  const renderContent = () => {
    switch (pageId) {
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <ContactUs />;
      case 'terms':
        return <TermsOfService />;
      case 'privacy':
        return <PrivacyPolicy />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 min-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700">
          <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {renderContent()}
      </div>
    </div>
  );
};

const AboutUs = () => (
  <div className="space-y-8">
    <div className="border-b border-gray-800 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">About Dicetools</h1>
      <p className="text-xl text-gray-400 leading-relaxed">
        We are building the web's most powerful, private, and accessible suite of digital utilities.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-3">
        <div className="w-12 h-12 bg-cyan-900/20 rounded-lg flex items-center justify-center text-cyan-400">
          <Shield size={24} />
        </div>
        <h3 className="text-lg font-bold text-white">Privacy First</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          We believe your data belongs to you. That's why 99% of our tools (PDF, Image, Text) run entirely in your browser. Your files are never uploaded to our servers.
        </p>
      </div>
      <div className="space-y-3">
        <div className="w-12 h-12 bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-400">
          <Server size={24} />
        </div>
        <h3 className="text-lg font-bold text-white">Client-Side Power</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          By leveraging modern WebAssembly and HTML5 technologies, we deliver desktop-class performance without the lag of server-side processing.
        </p>
      </div>
      <div className="space-y-3">
        <div className="w-12 h-12 bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-400">
          <Users size={24} />
        </div>
        <h3 className="text-lg font-bold text-white">For Everyone</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Whether you are a student calculating GPA, a developer formatting JSON, or a designer cropping images, Dicetools is free and accessible to all.
        </p>
      </div>
    </div>

    <div className="bg-gray-950/50 rounded-xl p-6 border border-gray-800">
      <h3 className="text-white font-bold mb-4">Our Mission</h3>
      <p className="text-gray-400 leading-relaxed">
        The internet is full of tools that are either expensive, riddled with ads, or insecure. Our mission is to provide a clean, professional, and safe alternative. We are constantly adding new features and improving existing ones based on user feedback.
      </p>
    </div>
  </div>
);

const ContactUs = () => {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-xl text-gray-400">
          Have a suggestion, found a bug, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="text-cyan-400" size={20}/> Get in touch
          </h3>
          <div className="space-y-6 text-gray-400">
            <p>
              For general inquiries, partnership opportunities, or support, please email us directly or use the form.
            </p>
            <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
              <span className="block text-xs uppercase text-gray-500 mb-1">Email Support</span>
              <a href="mailto:support@dicetools.online" className="text-cyan-400 hover:text-white transition-colors font-medium">
                support@dicetools.online
              </a>
            </div>
            <p className="text-sm">
              We aim to respond to all inquiries within 24-48 hours.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
            <p className="text-gray-400">Thank you for reaching out. We will get back to you shortly.</p>
            <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-green-400 hover:text-white underline">Send another message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input required type="text" className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input required type="email" className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
              <textarea required rows={4} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors resize-none" placeholder="How can we help?" />
            </div>
            <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const TermsOfService = () => (
  <div className="space-y-8 text-gray-300">
    <div className="border-b border-gray-800 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Terms of Service</h1>
      <p className="text-gray-400">Last updated: October 2023</p>
    </div>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
      <p>
        By accessing and using Dicetools.online ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">2. Use License</h2>
      <p>
        Permission is granted to use the tools on Dicetools.online for personal or commercial purposes. This is the grant of a license, not a transfer of title.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-400">
        <li>You may not attempt to reverse engineer any software contained on the website.</li>
        <li>You may not use the materials for any illegal purpose.</li>
        <li>You may not use bots or scripts to scrape data or abuse the tools.</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">3. Disclaimer</h2>
      <p>
        The materials on Dicetools.online are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">4. Limitations</h2>
      <p>
        In no event shall Dicetools.online be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on our website.
      </p>
    </section>
  </div>
);

const PrivacyPolicy = () => (
  <div className="space-y-8 text-gray-300">
    <div className="border-b border-gray-800 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
      <p className="text-gray-400">Your privacy is our priority.</p>
    </div>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock size={20} className="text-green-400"/> Data Processing</h2>
      <p>
        <strong>We do not store your files.</strong>
      </p>
      <p>
        Dicetools operates primarily as a client-side application. When you use tools like our PDF Merger, Image Resizer, or JSON Formatter, the processing happens directly in your web browser. Your files are not uploaded to our servers, ensuring your documents remain private and secure on your device.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">Analytics</h2>
      <p>
        We may use anonymous analytics (like Google Analytics) to understand how users interact with our site to improve the experience. This data does not contain personally identifiable information or the content of your files.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">Cookies</h2>
      <p>
        We use local storage to save your preferences (like dark mode or recent inputs) to enhance your experience. We do not use tracking cookies for advertising purposes.
      </p>
    </section>
  </div>
);
