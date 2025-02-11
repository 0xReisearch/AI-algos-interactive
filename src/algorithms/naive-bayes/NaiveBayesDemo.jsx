import React, { useState } from 'react';
import { Brain, Calculator, Database, ArrowRight } from 'lucide-react';
import WordDispersionChart from './WordDispersionChart';

const NaiveBayesDemo = () => {
  const [inputText, setInputText] = useState('BTC shows strong support at the current price level');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const trainingData = {
    spam: {
      total: 150,
      examples: [
        "FREE AIRDROP! Claim 1000 tokens now limited time",
        "Exclusive presale access! 100x guaranteed returns",
        "Claim your free NFT! Only 100 spots left",
        "Join whitelist now! Don't miss 1000x gem",
        "Flash mint open! Whitelist closes in 1 hour",
        "Join my channel for daily crypto signals!",
        "METAMASK SUPPORT: DM to fix wallet issues now",
        "Official Ledger Support - Fix sync issues 24/7"
      ],
      wordFreq: {
        'airdrop': 75,
        'free': 85,
        'claim': 90,
        'whitelist': 70,
        'presale': 65,
        'guaranteed': 45,
        'now': 95,
        'limited': 60,
        'nft': 65,
        'tokens': 80,
        'join': 65,
        'channel': 55,
        'signals': 45,
        'support': 85,
        'metamask': 70,
        'ledger': 65,
        'wallet': 75,
        'sync': 50,
        'issues': 80,
        'fix': 85,
        'dm': 90
      }
    },
    ham: {
      total: 150,
      examples: [
        "BTC forming a bullish pattern on the daily timeframe",
        "New ETH L2 solution launches with improved TPS",
        "DEX volume reaches new ATH this quarter",
        "Analyzing the impact of Bitcoin halving on mining",
        "Market analysis: Support levels holding strong"
      ],
      wordFreq: {
        'btc': 80,
        'eth': 75,
        'bitcoin': 70,
        'ethereum': 65,
        'analysis': 60,
        'market': 85,
        'protocol': 55,
        'defi': 70,
        'trading': 75,
        'volume': 50,
        'resistance': 45,
        'support': 45,
        'bullish': 55,
        'bearish': 50,
        'pattern': 40,
        'chart': 45,
        'timeframe': 35,
        'layer': 40,
        'scaling': 35,
        'tps': 30,
        'governance': 40,
        'upgrade': 45,
        'mainnet': 50,
        'development': 55,
        'audit': 40,
        'security': 45,
        'implementation': 35,
        'consensus': 30,
        'network': 60,
        'chain': 55
      }
    }
  };

  const calculateWordProbabilities = (word) => {
    const spamCount = trainingData.spam.wordFreq[word] || 0;
    const hamCount = trainingData.ham.wordFreq[word] || 0;
    const spamProb = (spamCount + 1) / (trainingData.spam.total + 2);
    const hamProb = (hamCount + 1) / (trainingData.ham.total + 2);
    return { spamProb, hamProb };
  };

  const words = inputText.toLowerCase().split(/\s+/);
  const wordProbs = words.map(word => ({
    word,
    ...calculateWordProbabilities(word)
  }));

  const priorSpam = 0.5;
  const priorHam = 0.5;
  
  const spamProb = wordProbs.reduce((acc, { spamProb }) => acc * spamProb, priorSpam);
  const hamProb = wordProbs.reduce((acc, { hamProb }) => acc * hamProb, priorHam);
  
  const total = spamProb + hamProb;
  const finalSpamProb = (spamProb / total * 100).toFixed(2);
  const finalHamProb = (hamProb / total * 100).toFixed(2);

  return (
    <div className="w-full bg-gray-900 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">Naive Bayes Algorithm Explorer</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-grow p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            placeholder="Enter text to classify..."
          />
          <button
            onClick={() => setIsAnimating(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Analyze
          </button>
        </div>
      </div>

        <div className="grid grid-cols-3 gap-6">
          <div className={`bg-gray-800 p-6 rounded-lg text-white border border-gray-700 transition-all duration-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Database className="text-green-400" />
              <h2 className="text-xl font-bold">Training Data</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-400 mb-2">Spam Examples</h3>
                <div className="h-[400px] overflow-y-auto">
                  <ul className="space-y-2">
                    {trainingData.spam.examples.map((ex, i) => (
                      <li key={i} className="p-2 bg-gray-700 rounded text-sm">{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-green-400 mb-2">Ham Examples</h3>
                <div className="h-[400px] overflow-y-auto">
                  <ul className="space-y-2">
                    {trainingData.ham.examples.map((ex, i) => (
                      <li key={i} className="p-2 bg-gray-700 rounded text-sm">{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gray-800 p-6 rounded-lg text-white border border-gray-700 transition-all duration-500 delay-300 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="text-purple-400" />
              <h2 className="text-xl font-bold">Word Analysis</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Word</div>
                <div className="font-medium text-red-400">P(word|Spam)</div>
                <div className="font-medium text-green-400">P(word|Ham)</div>
                {wordProbs.map(({ word, spamProb, hamProb }) => (
                  <React.Fragment key={word}>
                    <div className="bg-gray-700 p-2 rounded">{word}</div>
                    <div className="bg-gray-700 p-2 rounded text-red-400">{(spamProb * 100).toFixed(2)}%</div>
                    <div className="bg-gray-700 p-2 rounded text-green-400">{(hamProb * 100).toFixed(2)}%</div>
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <div className="text-center font-medium mb-2">Bayes Theorem</div>
                <div className="text-sm text-center text-gray-300">
                  P(Spam|Words) = [P(Spam) × ∏ P(Word<sub>i</sub>|Spam)] / P(Words)
                </div>
                <div className="text-sm text-center text-gray-300 mt-1">
                  where P(Words) = P(Spam) × P(Words|Spam) + P(Ham) × P(Words|Ham)
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gray-800 p-6 rounded-lg text-white border border-gray-700 transition-all duration-500 delay-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="text-orange-400" />
              <h2 className="text-xl font-bold">Classification</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">{finalSpamProb}%</div>
                  <div className="text-sm text-gray-300">Spam Probability</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{finalHamProb}%</div>
                  <div className="text-sm text-gray-300">Ham Probability</div>
                </div>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="text-lg font-medium mb-2">Final Classification:</div>
                <div className="text-2xl font-bold text-center">
                  {finalSpamProb > finalHamProb ? (
                    <span className="text-red-400">SPAM</span>
                  ) : (
                    <span className="text-green-400">HAM</span>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <div className="font-medium mb-2">Calculation Details:</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-red-400">Spam Score:</span>
                    <div className="bg-gray-700 p-2 rounded mt-1">
                      {priorSpam} × {wordProbs.map(w => (w.spamProb * 100).toFixed(2) + '%').join(' × ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-400">Ham Score:</span>
                    <div className="bg-gray-700 p-2 rounded mt-1">
                      {priorHam} × {wordProbs.map(w => (w.hamProb * 100).toFixed(2) + '%').join(' × ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WordDispersionChart trainingData={trainingData} inputText={inputText} />
      </div>
    </div>
  );
};

export default NaiveBayesDemo;