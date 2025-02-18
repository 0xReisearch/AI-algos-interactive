import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, Pause, RotateCcw, ImageIcon, Link } from 'lucide-react';
import _ from 'lodash';

const KMeansColorDemo = () => {
  const [phase, setPhase] = useState('input');
  const [imageUrl, setImageUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [k, setK] = useState(5);
  const [pixels, setPixels] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize canvas on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = 400;  // Default width
      canvas.height = 300; // Default height
      ctx.fillStyle = '#1f2937'; // Match background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  const colorDistance = (color1, color2) => {
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
    );
  };

  const initializeCentroids = (pixelData) => {
    const newCentroids = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * pixelData.length);
      newCentroids.push({ ...pixelData[randomIndex] });
    }
    setCentroids(newCentroids);
    return newCentroids;
  };

  const assignToClusters = (points, centers) => {
    const newClusters = Array(centers.length).fill().map(() => []);
    
    points.forEach(pixel => {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      centers.forEach((centroid, index) => {
        const distance = colorDistance(pixel, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = index;
        }
      });
      
      newClusters[clusterIndex].push(pixel);
    });
    
    setClusters(newClusters);
    return newClusters;
  };

  const updateCentroids = (currentClusters) => {
    const newCentroids = currentClusters.map((cluster, idx) => {
      if (cluster.length === 0) {
        const randomIndex = Math.floor(Math.random() * pixels.length);
        newCentroids[index] = { ...pixels[randomIndex] };
      }
      
      const sum = cluster.reduce((acc, pixel) => ({
        r: acc.r + pixel.r,
        g: acc.g + pixel.g,
        b: acc.b + pixel.b
      }), { r: 0, g: 0, b: 0 });
      
      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length)
      };
    });

    // Handle empty clusters
    newCentroids.forEach((centroid, index) => {
      if (centroid === null) {
        const randomIndex = Math.floor(Math.random() * pixels.length);
        newCentroids[index] = { ...pixels[randomIndex] };
      }
    });

    setCentroids(newCentroids);
    return newCentroids;
  };

  const hasConverged = (oldCentroids, newCentroids) => {
    const threshold = 1;
    return oldCentroids.every((oldCentroid, i) => 
      colorDistance(oldCentroid, newCentroids[i]) < threshold
    );
  };

  const iterate = () => {
    setIteration(prev => prev + 1);
    
    const newClusters = assignToClusters(pixels, centroids);
    const newCentroids = updateCentroids(newClusters);
    
    if (hasConverged(centroids, newCentroids) || iteration > 50) {
      setIsRunning(false);
      setPhase('complete');
    }
  };

  const processImage = async (url) => {
    setError('');
    try {
      const img = new Image();
      
      // Create a promise to handle image loading
      const loadImage = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Set crossOrigin before setting src
      img.crossOrigin = "anonymous";

      if (url.startsWith('http')) {
        // Use a CORS proxy for external URLs
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        img.src = proxyUrl;
      } else {
        img.src = url;
      }
      
      // Wait for image to load
      const loadedImg = await loadImage;
      
      // Get canvas and context
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Calculate dimensions
      const maxSize = 300;
      let width = loadedImg.width;
      let height = loadedImg.height;
      
      if (width > height && width > maxSize) {
        height = Math.round((maxSize * height) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((maxSize * width) / height);
        height = maxSize;
      }
      
      // Set canvas size and draw image
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(loadedImg, 0, 0, width, height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height);
      
      // Sample pixels
      const sampledPixels = [];
      const skipFactor = Math.max(1, Math.ceil((width * height) / 1000));
      
      for (let y = 0; y < height; y += skipFactor) {
        for (let x = 0; x < width; x += skipFactor) {
          const i = (y * width + x) * 4;
          sampledPixels.push({
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2]
          });
        }
      }
      
      setPixels(sampledPixels);
      setPhase('processing');
      initializeCentroids(sampledPixels);
      setIsRunning(true);
      
    } catch (error) {
      if (url.startsWith('http')) {
        setError('Failed to load image. Try downloading and uploading it directly.');
      } else {
        setError('An error occurred while processing the image. Please try another image.');
      }
      setPhase('input');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        processImage(e.target.result);
      };
      
      reader.onerror = (error) => {
        setError('Error reading file. Please try another.');
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput && urlInput.trim()) {
      setImageUrl(urlInput);
      processImage(urlInput);
    } else {
      setError('Please enter a valid URL');
    }
  };

  const resetDemo = () => {
    setPhase('input');
    setImageUrl('');
    setUrlInput('');
    setPixels([]);
    setCentroids([]);
    setClusters([]);
    setIteration(0);
    setIsRunning(false);
    setError('');
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    let timer;
    if (isRunning && phase === 'processing') {
      timer = setInterval(iterate, 500);
    }
    return () => clearInterval(timer);
  }, [isRunning, centroids, pixels, phase]);

  return (
    <div className="w-full bg-gray-900 p-6 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Interactive K-Means Color Clustering - Color Palette Extraction
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              {phase === 'input' ? 'Upload or Link an Image' : 'Image Processing'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Hidden canvas for image processing - KEEP THIS! */}
              <canvas
                ref={canvasRef}
                className={`${phase === 'input' ? 'hidden' : 'flex-1'} rounded-lg border border-gray-700 w-full h-auto object-contain`}
              />

              {phase === 'input' && (
                <>
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center justify-center space-x-2 mx-auto mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Choose File</span>
                    </button>
                    <p className="text-gray-400">or</p>
                  </div>

                  {/* URL Input */}
                  <form onSubmit={handleUrlSubmit} className="flex space-x-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Paste image URL here"
                      className="flex-grow px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Link className="w-5 h-5" />
                      <span>Load URL</span>
                    </button>
                  </form>

                  {/* K Selection */}
                  <div className="mt-4">
                    <label className="block text-white mb-2">
                      Number of Colors (K)
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={k}
                      onChange={(e) => setK(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-gray-400 text-center">K = {k}</div>
                  </div>
                </>
              )}

              {/* Results */}
              {(phase === 'processing' || phase === 'complete') && (
                <div className="space-y-6">
                  <div className="flex gap-6">
                    {/* Color Clusters */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-2">
                        Color Clusters (Iteration {iteration})
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {clusters.map((cluster, i) => (
                          <div key={i} className="bg-gray-700 p-4 rounded-lg">
                            <div
                              className="w-full h-12 rounded mb-2"
                              style={{
                                backgroundColor: centroids[i] 
                                  ? rgbToHex(centroids[i].r, centroids[i].g, centroids[i].b)
                                  : '#000'
                              }}
                            />
                            <div className="text-gray-300 text-sm">
                              {cluster.length} pixels
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    {phase === 'processing' && (
                      <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          isRunning
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {isRunning ? (
                          <>
                            <Pause className="w-5 h-5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Continue</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={resetDemo}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Start Over</span>
                    </button>
                  </div>

                  {/* Final Palette */}
                  {phase === 'complete' && (
                    <div className="mt-6">
                      <h3 className="text-white font-bold mb-2">Final Color Palette</h3>
                      <div className="flex space-x-2">
                        {centroids.map((color, i) => (
                          <div key={i} className="flex-1">
                            <div
                              className="w-full h-20 rounded-lg mb-2"
                              style={{
                                backgroundColor: rgbToHex(color.r, color.g, color.b)
                              }}
                            />
                            <div className="text-gray-400 text-center text-sm">
                              {rgbToHex(color.r, color.g, color.b)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Educational Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg mt-6">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">How K-Means Clustering Works</h2>
          </div>
          <div className="p-6 text-gray-300 space-y-4">
            <p>This demo uses K-Means clustering to automatically extract a color palette from your image - similar to how you might sample colors at a paint store. It analyzes all the pixels and finds the {k} most representative colors that capture the image's overall color scheme.</p>
            
            <p className="text-sm text-gray-400">The process works in iterations:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>First, it randomly selects {k} initial colors from the image as starting points</li>
              <li>Each pixel in the image is grouped with the color it's most similar to</li>
              <li>Each group's average color becomes the new representative color</li>
              <li>This process repeats until the colors stabilize (usually in 2-5 iterations)</li>
            </ol>

            <p className="text-sm text-gray-400 mt-4">The final palette shows the most dominant colors in your image. The number of pixels in each cluster indicates how prevalent that color is in the image.</p>

            <div className="bg-gray-700 p-4 rounded-lg mt-4">
              <h4 className="text-white font-bold mb-2">Color Distance Formula</h4>
              <code className="text-sm">
                distance = √[(R₂-R₁)² + (G₂-G₁)² + (B₂-B₁)²]
              </code>
              <p className="text-sm mt-2">
                Where (R₁,G₁,B₁) and (R₂,G₂,B₂) are the RGB values of two colors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMeansColorDemo;