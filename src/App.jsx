import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import NaiveBayesDemo from './algorithms/naive-bayes/NaiveBayesDemo';
import KNNDemo from './algorithms/k-nearest-neighbor/KNNDemo';
import KMeansColorDemo from './algorithms/k-mean-clustering/KMMDemo';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
          <img 
            src={`${import.meta.env.BASE_URL}REI_logo.png`} 
            alt="AI Algorithms" 
            className="h-8 w-8" 
          />
            <Link to="/" className="text-white text-xl font-bold">AI Algorithms Interactive</Link>
          </div>
        </nav>
        
        <Routes>
          <Route exact path="/" element={
            <div className="max-w-7xl mx-auto p-6">
              <h1 className="text-3xl font-bold text-white mb-8">Interactive AI/ML Algorithms</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="naive-bayes" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-2">Naive Bayes Classifier</h2>
                  <p className="text-gray-300">Interactive demonstration of text classification using Naive Bayes algorithm.</p>
                </Link>
                <Link to="knn" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-2">K-Nearest Neighbors</h2>
                  <p className="text-gray-300">Interactive pattern matching using K-Nearest Neighbors algorithm.</p>
                </Link>
                <Link to="kmeans" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <h2 className="text-xl font-bold text-white mb-2">K-Means Color Clustering</h2>
                  <p className="text-gray-300">Interactive color palette extraction using K-Means clustering algorithm.</p>
                </Link>
              </div>
            </div>
          } />
          <Route path="naive-bayes" element={<NaiveBayesDemo />} />
          <Route path="knn" element={<KNNDemo />} />
          <Route path="kmeans" element={<KMeansColorDemo />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
