import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-dice-bg text-white">
      <header className="bg-dice-card p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dice-accent">Dicetools</h1>
        <nav>
          <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
          <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Tools</a>
          <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
          <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</a>
        </nav>
      </header>
      <main className="p-8">
        <div className="bg-dice-card p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-dice-accent">Welcome to Dicetools!</h2>
          <p className="text-gray-300">Your one-stop shop for all your digital needs.</p>
        </div>
      </main>
      <footer className="bg-dice-card p-4 text-center text-gray-400">
        <p>&copy; 2024 Dicetools. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
