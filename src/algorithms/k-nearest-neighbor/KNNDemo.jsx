import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts';
import { Play, SkipForward, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

const songDatabase = [
  { id: 1, name: "Bohemian Rhapsody", artist: "Queen", electronic: 20, acoustic: 70 },
  { id: 2, name: "Strobe", artist: "Deadmau5", electronic: 95, acoustic: 15 },
  { id: 3, name: "Yesterday", artist: "The Beatles", electronic: 5, acoustic: 90 },
  { id: 4, name: "Sandstorm", artist: "Darude", electronic: 100, acoustic: 5 },
  { id: 5, name: "Wonderwall", artist: "Oasis", electronic: 30, acoustic: 85 },
  { id: 6, name: "Blue (Da Ba Dee)", artist: "Eiffel 65", electronic: 90, acoustic: 20 },
  { id: 7, name: "Dust in the Wind", artist: "Kansas", electronic: 10, acoustic: 95 },
  { id: 8, name: "Around the World", artist: "Daft Punk", electronic: 95, acoustic: 10 },
  { id: 9, name: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", electronic: 15, acoustic: 85 },
  { id: 10, name: "Levels", artist: "Avicii", electronic: 85, acoustic: 25 },
  { id: 11, name: "Hotel California", artist: "Eagles", electronic: 25, acoustic: 80 },
  { id: 12, name: "Get Lucky", artist: "Daft Punk", electronic: 75, acoustic: 35 },
  { id: 13, name: "Piano Man", artist: "Billy Joel", electronic: 5, acoustic: 95 },
  { id: 14, name: "Call Me Maybe", artist: "Carly Rae Jepsen", electronic: 60, acoustic: 40 },
  { id: 15, name: "Titanium", artist: "David Guetta", electronic: 90, acoustic: 30 },
  { id: 16, name: "Hallelujah", artist: "Jeff Buckley", electronic: 5, acoustic: 95 },
  { id: 17, name: "Animals", artist: "Martin Garrix", electronic: 95, acoustic: 10 },
  { id: 18, name: "Blackbird", artist: "The Beatles", electronic: 0, acoustic: 100 },
  { id: 19, name: "One More Time", artist: "Daft Punk", electronic: 90, acoustic: 15 },
  { id: 20, name: "Wake Me Up", artist: "Avicii", electronic: 70, acoustic: 45 },
  { id: 21, name: "Sound of Silence", artist: "Simon & Garfunkel", electronic: 5, acoustic: 95 },
  { id: 22, name: "Faded", artist: "Alan Walker", electronic: 85, acoustic: 20 },
  { id: 23, name: "Hey There Delilah", artist: "Plain White T's", electronic: 10, acoustic: 90 },
  { id: 24, name: "In Da Club", artist: "50 Cent", electronic: 70, acoustic: 30 },
  { id: 25, name: "Clarity", artist: "Zedd", electronic: 85, acoustic: 25 },
  { id: 26, name: "Grenade", artist: "Bruno Mars", electronic: 40, acoustic: 60 },
  { id: 27, name: "Lean On", artist: "Major Lazer", electronic: 80, acoustic: 20 },
  { id: 28, name: "Let It Be", artist: "The Beatles", electronic: 10, acoustic: 90 },
  { id: 29, name: "Don't Stop Believin'", artist: "Journey", electronic: 30, acoustic: 70 },
  { id: 30, name: "Summer", artist: "Calvin Harris", electronic: 90, acoustic: 15 }
];

const KNNDemo = () => {
  const [phase, setPhase] = useState('training');
  const [ratedSongs, setRatedSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [remainingSongs, setRemainingSongs] = useState([]);
  const [testSong, setTestSong] = useState(null);
  const [k, setK] = useState(3);
  const [animationStep, setAnimationStep] = useState(0);
  const [nearestNeighbors, setNearestNeighbors] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    resetDemo();
  }, []);

  const resetDemo = () => {
    console.log('Resetting demo...');
    const shuffled = [...songDatabase].sort(() => Math.random() - 0.5);
    const test = shuffled.pop();
    setTestSong(test);
    setRemainingSongs(shuffled);
    setCurrentSong(shuffled[0]);
    setRatedSongs([]);
    setPhase('training');
    setAnimationStep(0);
    setNearestNeighbors([]);
    setPrediction(null);
  };

  const handleRate = (rating) => {
    if (!currentSong) return;
    
    const newRatedSongs = [...ratedSongs, { ...currentSong, rating }];
    setRatedSongs(newRatedSongs);
    
    const newRemaining = remainingSongs.slice(1);
    setRemainingSongs(newRemaining);

    if (newRemaining.length > 0) {
      setCurrentSong(newRemaining[0]);
    }
  };

  const calculateDistances = () => {
    return ratedSongs.map(song => {
      const dx = testSong.electronic - song.electronic;
      const dy = testSong.acoustic - song.acoustic;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { ...song, distance };
    }).sort((a, b) => a.distance - b.distance);
  };

  const startPrediction = () => {
    setPhase('prediction');
    setAnimationStep(0);
    
    const allNeighbors = calculateDistances();
    setNearestNeighbors(allNeighbors);
    
    // Log distances for verification
    console.log('Distances:', allNeighbors.map(n => ({
      name: n.name,
      distance: Math.round(n.distance),
      coordinates: `(${n.electronic}, ${n.acoustic})`,
      rating: n.rating
    })));
    
    // Animate the prediction process
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setAnimationStep(step);
      
      if (step >= 3) {
        clearInterval(timer);
        const kNearest = allNeighbors.slice(0, k);
        const likeNeighbors = kNearest.filter(n => n.rating === 'like');
        const dislikeNeighbors = kNearest.filter(n => n.rating === 'dislike');
        
        // Debug logging
        console.log('K Nearest Songs:', kNearest.map(n => ({
          name: n.name,
          rating: n.rating
        })));
        console.log('Like neighbors:', likeNeighbors.length);
        console.log('Dislike neighbors:', dislikeNeighbors.length);
        
        setPrediction({
          like: likeNeighbors.length / k,
          dislike: dislikeNeighbors.length / k
        });
        setPhase('complete');
      }
    }, 1500);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-white font-bold">{data.name}</p>
        <p className="text-gray-300">Artist: {data.artist}</p>
        <p className="text-gray-300">Electronic: {Math.round(data.electronic)}%</p>
        <p className="text-gray-300">Acoustic: {Math.round(data.acoustic)}%</p>
        {data.distance && (
          <p className="text-gray-300">Distance: {Math.round(data.distance)}</p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-900 p-6 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Interactive KNN Music Recommender</h1>

        {/* Explanation Section */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-white"
          >
            <span className="text-xl font-bold">How it Works</span>
            {showExplanation ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {showExplanation && (
            <div className="mt-4 text-gray-300 space-y-3">
              <p>The K-Nearest Neighbors (KNN) algorithm is a simple but powerful classification method that predicts based on the majority vote of the K closest examples in the dataset.</p>
              
              <p className="font-bold text-white">How to use this demo:</p>
              <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>Rate some songs as "like" or "dislike" to build your training data</li>
                <li>A new song (blue dot) will be selected for prediction</li>
                <li>The algorithm will find the K nearest songs to the target song</li>
                <li>Based on how those K neighbors were rated, it predicts if you'll like or dislike the new song</li>
              </ol>
              
              <p className="font-bold text-white mt-4">The visualization:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Green dots: Songs you liked</li>
                <li>Red dots: Songs you disliked</li>
                <li>Blue dot: Song being predicted</li>
                <li>Blue lines: Connections to K nearest neighbors</li>
              </ul>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="electronic" 
                  domain={[0, 100]} 
                  label={{ value: 'Electronic %', position: 'bottom', fill: '#9CA3AF' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="acoustic" 
                  domain={[0, 100]} 
                  label={{ value: 'Acoustic %', angle: -90, position: 'left', fill: '#9CA3AF' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Rated songs */}
                <Scatter 
                  data={ratedSongs.filter(s => s.rating === 'like')}
                  fill="#22C55E"
                />
                <Scatter 
                  data={ratedSongs.filter(s => s.rating === 'dislike')}
                  fill="#EF4444"
                />
                
                {/* Test song */}
                {phase !== 'training' && testSong && (
                  <Scatter
                    data={[{ ...testSong, name: 'Target Song' }]}
                    fill="#60A5FA"
                    r={8}
                  />
                )}

                {/* Distance visualization */}
                {phase !== 'training' && testSong && (
                  <>
                    {/* Show all distances in gray */}
                    {ratedSongs.map((song, i) => (
                      <Line
                        key={`distance-${i}`}
                        data={[
                          { electronic: testSong.electronic, acoustic: testSong.acoustic },
                          { electronic: song.electronic, acoustic: song.acoustic }
                        ]}
                        stroke="#4B5563"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                      />
                    ))}
                    
                    {/* Highlight k-nearest in blue */}
                    {nearestNeighbors.slice(0, k).map((song, i) => (
                      <Line
                        key={`nearest-${i}`}
                        data={[
                          { electronic: testSong.electronic, acoustic: testSong.acoustic },
                          { electronic: song.electronic, acoustic: song.acoustic }
                        ]}
                        stroke="#60A5FA"
                        strokeWidth={2}
                      />
                    ))}
                  </>
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          {phase === 'training' && currentSong && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Rate This Song</h2>
              <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="text-lg font-bold text-white">{currentSong.name}</p>
                  <p className="text-gray-300">{currentSong.artist}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRate('like')}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-full"
                  >
                    <ThumbsUp className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => handleRate('dislike')}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                  >
                    <ThumbsDown className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="text-gray-400">
                {ratedSongs.length < 3 ? (
                  <p>Rate at least 3 songs to enable prediction</p>
                ) : (
                  <p>Songs rated: {ratedSongs.length} / {remainingSongs.length + ratedSongs.length}</p>
                )}
              </div>
            </div>
          )}

          {phase === 'prediction' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Making Prediction</h2>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg border ${animationStep >= 1 ? 'bg-gray-700 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                  1. Calculating distances...
                  {animationStep >= 1 && nearestNeighbors.slice(0, 5).map((song, i) => (
                    <div key={i} className="mt-1 text-sm opacity-75">
                      • {song.name}: {Math.round(song.distance)} units away
                    </div>
                  ))}
                </div>
                <div className={`p-3 rounded-lg border ${animationStep >= 2 ? 'bg-gray-700 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                  2. Finding {k} nearest neighbors...
                </div>
                <div className={`p-3 rounded-lg border ${animationStep >= 3 ? 'bg-gray-700 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                  3. Taking majority vote...
                </div>
              </div>
            </div>
          )}

          {phase === 'complete' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Prediction Complete!</h2>
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-lg text-white">
                Based on the {k} nearest neighbors for {testSong.name} by {testSong.artist}:
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Like probability:</span>
                    <span className="text-green-400 font-bold">{Math.round(prediction.like * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Dislike probability:</span>
                    <span className="text-red-400 font-bold">{Math.round(prediction.dislike * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-gray-300">
                <h3 className="font-bold mb-2">Nearest Neighbors:</h3>
                <ul className="space-y-2">
                  {nearestNeighbors.slice(0, k).map((song, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                      <span>{song.name} - {song.artist}</span>
                      <span className={`px-2 py-1 rounded ${
                        song.rating === 'like' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {song.rating}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white mb-2">K Neighbors</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max={Math.min(15, ratedSongs.length)}
                  value={k}
                  onChange={(e) => setK(Math.min(Math.max(1, parseInt(e.target.value) || 1), Math.min(15, ratedSongs.length)))}
                  className="w-20 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                />
                <div className="text-gray-400">
                  Using {k} nearest {k === 1 ? 'neighbor' : 'neighbors'}
                </div>
              </div>
            </div>
            
            <div className="border-l border-gray-700 pl-6">
              <h3 className="text-white font-bold mb-2">KNN Formula</h3>
              <div className="text-gray-300 space-y-2">
                <p>Distance calculation:</p>
                <code className="block bg-gray-700 p-2 rounded">
                  distance = √[(x₂-x₁)² + (y₂-y₁)²]
                </code>
                <p className="text-sm">where (x₁,y₁) is the target song and (x₂,y₂) is a rated song</p>
                <p className="mt-4">Prediction:</p>
                <code className="block bg-gray-700 p-2 rounded">
                  prediction = majority_vote(k_nearest_neighbors)
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end mt-6 space-x-4">
            {phase === 'training' && (
              <>
                <button
                  onClick={resetDemo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Randomize Songs</span>
                </button>

                {ratedSongs.length >= 3 && (
                  <button
                    onClick={startPrediction}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Calculate Prediction</span>
                  </button>
                )}
              </>
            )}
            {phase !== 'training' && (
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center space-x-2"
              >
                <SkipForward className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KNNDemo;