import React, { useState, useEffect, useRef } from 'react';
import { Brain, Calculator, Network, ArrowRight } from 'lucide-react';

// Super simple neural network demo - XOR problem
const NNDemo = () => {
  // Use useRef for weights and biases to avoid re-renders during training
  const weightsRef = useRef({
    // Initialize with larger random values to break symmetry
    w1: Math.random() * 2 - 1,
    w2: Math.random() * 2 - 1,
    w3: Math.random() * 2 - 1,
    w4: Math.random() * 2 - 1,
    w5: Math.random() * 2 - 1,
    w6: Math.random() * 2 - 1
  });
  
  const biasesRef = useRef({
    b1: Math.random() * 2 - 1,
    b2: Math.random() * 2 - 1,
    b3: Math.random() * 2 - 1
  });
  
  // State for UI updates
  const [weights, setWeights] = useState({...weightsRef.current});
  const [biases, setBiases] = useState({...biasesRef.current});
  const [iteration, setIteration] = useState(0);
  const [error, setError] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [predictions, setPredictions] = useState([0, 0, 0, 0]);
  const [rawOutputs, setRawOutputs] = useState([0.5, 0.5, 0.5, 0.5]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Sigmoid activation function for hidden layer
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  
  // Step function for output layer - true binary output
  const step = (x) => x >= 0.5 ? 1 : 0;
  
  // Forward pass with sigmoid for hidden layer and binary output
  const forward = (x1, x2, applyStep = false) => {
    const w = weightsRef.current;
    const b = biasesRef.current;
    
    // Hidden layer - always use sigmoid
    const h1 = sigmoid(w.w1 * x1 + w.w2 * x2 + b.b1);
    const h2 = sigmoid(w.w3 * x1 + w.w4 * x2 + b.b2);
    
    // Output layer - sigmoid for training, step function for prediction
    const sigmoidOutput = sigmoid(w.w5 * h1 + w.w6 * h2 + b.b3);
    const output = applyStep ? step(sigmoidOutput) : sigmoidOutput;
    
    return { h1, h2, sigmoidOutput, output };
  };
  
  // XOR training data
  const trainingData = [
    { inputs: [0, 0], target: 0 },
    { inputs: [0, 1], target: 1 },
    { inputs: [1, 0], target: 1 },
    { inputs: [1, 1], target: 0 }
  ];
  
  // Train for multiple iterations at once
  const trainBatch = () => {
    const learningRate = 0.5; // Higher learning rate for faster convergence
    const batchSize = 20; // Process more examples per batch
    
    for (let batch = 0; batch < batchSize; batch++) {
      let totalError = 0;
      
      // For each training example
      trainingData.forEach(example => {
        const { inputs, target } = example;
        const [x1, x2] = inputs;
        
        // Forward pass - use sigmoid for training (no step function)
        const { h1, h2, sigmoidOutput } = forward(x1, x2, false);
        
        // Calculate error
        const outputError = target - sigmoidOutput;
        totalError += Math.pow(outputError, 2); // Use squared error
        
        // Backpropagation
        // Output layer gradient
        const outputGradient = outputError * sigmoidOutput * (1 - sigmoidOutput);
        
        // Hidden layer gradients
        const h1Gradient = outputGradient * weightsRef.current.w5 * h1 * (1 - h1);
        const h2Gradient = outputGradient * weightsRef.current.w6 * h2 * (1 - h2);
        
        // Update weights with momentum
        weightsRef.current.w1 += learningRate * h1Gradient * x1;
        weightsRef.current.w2 += learningRate * h1Gradient * x2;
        weightsRef.current.w3 += learningRate * h2Gradient * x1;
        weightsRef.current.w4 += learningRate * h2Gradient * x2;
        weightsRef.current.w5 += learningRate * outputGradient * h1;
        weightsRef.current.w6 += learningRate * outputGradient * h2;
        
        // Update biases
        biasesRef.current.b1 += learningRate * h1Gradient;
        biasesRef.current.b2 += learningRate * h2Gradient;
        biasesRef.current.b3 += learningRate * outputGradient;
      });
      
      // Update error for the last batch
      if (batch === batchSize - 1) {
        setError(Math.sqrt(totalError / 4)); // RMSE
      }
    }
    
    // Update UI state after batch
    setWeights({...weightsRef.current});
    setBiases({...biasesRef.current});
    setIteration(prev => prev + batchSize);
    
    // Update predictions - use step function for binary output
    const newPredictions = [];
    const newRawOutputs = [];
    
    trainingData.forEach(example => {
      const { inputs } = example;
      const [x1, x2] = inputs;
      const { sigmoidOutput, output } = forward(x1, x2, true);
      newPredictions.push(output); // Binary output (0 or 1)
      newRawOutputs.push(Math.round(sigmoidOutput * 100) / 100); // Raw sigmoid output for reference
    });
    
    setPredictions(newPredictions);
    setRawOutputs(newRawOutputs);
    
    // Stop training if error is small enough or max iterations reached
    if (error < 0.05 || iteration >= 2000) {
      setIsTraining(false);
    }
  };
  
  // Start training
  const startTraining = () => {
    // Reset weights with larger random values for better initialization
    weightsRef.current = {
      w1: (Math.random() * 2 - 1) * 2,
      w2: (Math.random() * 2 - 1) * 2,
      w3: (Math.random() * 2 - 1) * 2,
      w4: (Math.random() * 2 - 1) * 2,
      w5: (Math.random() * 2 - 1) * 2,
      w6: (Math.random() * 2 - 1) * 2
    };
    
    biasesRef.current = {
      b1: (Math.random() * 2 - 1) * 2,
      b2: (Math.random() * 2 - 1) * 2,
      b3: (Math.random() * 2 - 1) * 2
    };
    
    setWeights({...weightsRef.current});
    setBiases({...biasesRef.current});
    setIteration(0);
    setError(1);
    setIsTraining(true);
    setPredictions([0, 0, 0, 0]);
    setRawOutputs([0.5, 0.5, 0.5, 0.5]);
    setIsAnimating(true);
  };
  
  // Run training
  useEffect(() => {
    if (isTraining) {
      const timer = setTimeout(() => {
        trainBatch();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isTraining, iteration, error]);
  
  return (
    <div className="w-full bg-gray-900 p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Neural Network: Brain in Code</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">How Neural Networks Work</h2>
          <p className="text-gray-300 mb-4">
            This is a minimal neural network that learns the XOR logic operation. XOR returns 1 when inputs are different, and 0 when they are the same.
            Neural networks learn by adjusting weights and biases through backpropagation to minimize error.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-white font-bold">Input</p>
              <p className="text-gray-300">0, 0</p>
              <p className="text-gray-300">0, 1</p>
              <p className="text-gray-300">1, 0</p>
              <p className="text-gray-300">1, 1</p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-white font-bold">Expected Output</p>
              <p className="text-gray-300">0</p>
              <p className="text-gray-300">1</p>
              <p className="text-gray-300">1</p>
              <p className="text-gray-300">0</p>
            </div>
          </div>
          <p className="text-gray-300">
            The network has 2 input neurons, 2 hidden neurons, and 1 output neuron. It uses sigmoid activation for hidden layers and a step function for binary output.
          </p>
          
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <div className="text-center font-medium mb-2 text-white">Key Neural Network Formulas</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-center text-gray-300 mb-2">
                  <span className="font-medium">Sigmoid Activation:</span>
                </div>
                <div className="text-sm text-center text-gray-300">
                  σ(x) = 1 / (1 + e<sup>-x</sup>)
                </div>
              </div>
              <div>
                <div className="text-sm text-center text-gray-300 mb-2">
                  <span className="font-medium">Weight Update Rule:</span>
                </div>
                <div className="text-sm text-center text-gray-300">
                  w<sub>new</sub> = w<sub>old</sub> + η × gradient × input
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <button
            onClick={startTraining}
            disabled={isTraining}
            className={`px-6 py-3 rounded-lg text-white ${isTraining ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isTraining ? 'Training...' : 'Start Training'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`bg-gray-800 p-6 rounded-lg text-white border border-gray-700 transition-all duration-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-blue-400" />
              <h2 className="text-xl font-bold">Network Architecture</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Network Structure</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <span className="text-blue-400">Input Layer:</span> 2 neurons (x₁, x₂)</li>
                  <li>• <span className="text-green-400">Hidden Layer:</span> 2 neurons (h₁, h₂)</li>
                  <li>• <span className="text-red-400">Output Layer:</span> 1 neuron (y)</li>
                  <li>• <span className="text-purple-400">Total Parameters:</span> 6 weights + 3 biases = 9</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Activation Functions</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <span className="text-green-400">Hidden Layer:</span> Sigmoid</li>
                  <li>• <span className="text-red-400">Output Layer:</span> Sigmoid (training) / Step (prediction)</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Training Parameters</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <span className="text-yellow-400">Learning Rate:</span> 0.5</li>
                  <li>• <span className="text-yellow-400">Batch Size:</span> 20 iterations</li>
                  <li>• <span className="text-yellow-400">Error Metric:</span> RMSE (Root Mean Square Error)</li>
                  <li>• <span className="text-yellow-400">Stop Condition:</span> Error &lt; 0.05 or 2000 iterations</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className={`bg-gray-800 p-6 rounded-lg text-white border border-gray-700 transition-all duration-500 delay-200 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="text-purple-400" />
              <h2 className="text-xl font-bold">Network State</h2>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white mb-1">{iteration}</div>
                  <div className="text-sm text-gray-300">Iterations</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white mb-1">{error.toFixed(4)}</div>
                  <div className="text-sm text-gray-300">Error (RMSE)</div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="font-bold text-white mb-2">Weights:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="bg-gray-700 p-2 rounded text-sm">
                      <span>{key}: {value.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="font-bold text-white mb-2">Biases:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(biases).map(([key, value]) => (
                    <div key={key} className="bg-gray-700 p-2 rounded text-sm">
                      <span>{key}: {value.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Backpropagation Process</h3>
                <ol className="space-y-2 text-gray-300 text-sm list-decimal pl-4">
                  <li>Forward pass to compute outputs</li>
                  <li>Calculate error (target - output)</li>
                  <li>Compute output layer gradients</li>
                  <li>Propagate gradients to hidden layer</li>
                  <li>Update weights and biases</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className={`bg-gray-800 p-6 rounded-lg text-white border border-gray-700 transition-all duration-500 delay-400 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="text-green-400" />
              <h2 className="text-xl font-bold">Predictions</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="font-medium">Input</div>
                <div className="font-medium">Expected</div>
                <div className="font-medium">Raw Output</div>
                <div className="font-medium">Binary</div>
                
                {trainingData.map((example, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-gray-700 p-2 rounded">
                      <p className="text-gray-300">{example.inputs.join(', ')}</p>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <p className="text-gray-300">{example.target}</p>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <p className="text-gray-300">{rawOutputs[index]}</p>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <p className={`${predictions[index] === example.target ? 'text-green-400' : 'text-red-400'}`}>
                        {predictions[index]}
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-medium text-white mb-2">Forward Pass Calculation</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>1. Hidden layer neurons (h₁, h₂):</p>
                  <p className="pl-4">h₁ = σ(w₁·x₁ + w₂·x₂ + b₁)</p>
                  <p className="pl-4">h₂ = σ(w₃·x₁ + w₄·x₂ + b₂)</p>
                  <p>2. Output neuron (y):</p>
                  <p className="pl-4">y = σ(w₅·h₁ + w₆·h₂ + b₃)</p>
                  <p>3. Binary prediction:</p>
                  <p className="pl-4">prediction = (y ≥ 0.5) ? 1 : 0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`bg-gray-800 p-6 rounded-lg mt-6 transition-all duration-500 delay-600 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Network className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Network Visualization</h2>
          </div>
          <div className="flex justify-center">
            <svg width="500" height="300" className="border border-gray-700 rounded-lg">
              {/* Input Layer */}
              <circle cx="100" cy="100" r="20" fill="#60A5FA" />
              <circle cx="100" cy="200" r="20" fill="#60A5FA" />
              <text x="100" y="105" textAnchor="middle" fill="white">x₁</text>
              <text x="100" y="205" textAnchor="middle" fill="white">x₂</text>
              
              {/* Hidden Layer */}
              <circle cx="250" cy="100" r="20" fill="#34D399" />
              <circle cx="250" cy="200" r="20" fill="#34D399" />
              <text x="250" y="105" textAnchor="middle" fill="white">h₁</text>
              <text x="250" y="205" textAnchor="middle" fill="white">h₂</text>
              
              {/* Output Layer */}
              <circle cx="400" cy="150" r="20" fill="#F87171" />
              <text x="400" y="155" textAnchor="middle" fill="white">y</text>
              
              {/* Connections */}
              <line x1="120" y1="100" x2="230" y2="100" stroke="white" strokeOpacity="0.5" strokeWidth={Math.abs(weights.w1) * 3} />
              <line x1="120" y1="200" x2="230" y2="100" stroke="white" strokeOpacity="0.5" strokeWidth={Math.abs(weights.w2) * 3} />
              <line x1="120" y1="100" x2="230" y2="200" stroke="white" strokeOpacity="0.5" strokeWidth={Math.abs(weights.w3) * 3} />
              <line x1="120" y1="200" x2="230" y2="200" stroke="white" strokeOpacity="0.5" strokeWidth={Math.abs(weights.w4) * 3} />
              <line x1="270" y1="100" x2="380" y2="150" stroke="white" strokeOpacity="0.5" strokeWidth={Math.abs(weights.w5) * 3} />
              <line x1="270" y1="200" x2="380" y2="150" stroke="white" strokeOpacity="0.5" strokeWidth={Math.abs(weights.w6) * 3} />
              
              {/* Weight labels */}
              <text x="175" y="85" textAnchor="middle" fill="#D1D5DB" fontSize="12">w₁: {weights.w1.toFixed(2)}</text>
              <text x="175" y="135" textAnchor="middle" fill="#D1D5DB" fontSize="12">w₂: {weights.w2.toFixed(2)}</text>
              <text x="175" y="165" textAnchor="middle" fill="#D1D5DB" fontSize="12">w₃: {weights.w3.toFixed(2)}</text>
              <text x="175" y="215" textAnchor="middle" fill="#D1D5DB" fontSize="12">w₄: {weights.w4.toFixed(2)}</text>
              <text x="325" y="125" textAnchor="middle" fill="#D1D5DB" fontSize="12">w₅: {weights.w5.toFixed(2)}</text>
              <text x="325" y="175" textAnchor="middle" fill="#D1D5DB" fontSize="12">w₆: {weights.w6.toFixed(2)}</text>
              
              {/* Bias labels */}
              <text x="250" y="80" textAnchor="middle" fill="#D1D5DB" fontSize="12">b₁: {biases.b1.toFixed(2)}</text>
              <text x="250" y="220" textAnchor="middle" fill="#D1D5DB" fontSize="12">b₂: {biases.b2.toFixed(2)}</text>
              <text x="400" y="130" textAnchor="middle" fill="#D1D5DB" fontSize="12">b₃: {biases.b3.toFixed(2)}</text>
            </svg>
          </div>
          <div className="mt-4 text-gray-300 text-sm">
            <p className="text-center">Line thickness represents weight magnitude. Weights and biases are updated during training.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NNDemo; 