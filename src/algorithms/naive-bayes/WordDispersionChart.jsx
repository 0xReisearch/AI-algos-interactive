import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Label } from 'recharts';

const WordDispersionChart = ({ trainingData, inputText }) => {
  const scatterData = useMemo(() => {
    const inputWords = inputText.toLowerCase().split(/\s+/);
    
    return inputWords.map(word => {
      const spamCount = trainingData.spam.wordFreq[word] || 0;
      const hamCount = trainingData.ham.wordFreq[word] || 0;
      const totalCount = spamCount + hamCount;

      const spamProb = (spamCount + 1) / (trainingData.spam.total + 2);
      const hamProb = (hamCount + 1) / (trainingData.ham.total + 2);

      return {
        word,
        spamProb: spamProb * 100,
        hamProb: hamProb * 100,
        frequency: totalCount,
        type: spamProb > hamProb ? 'spam' : 'ham'
      };
    });
  }, [trainingData, inputText]);

  const CustomScatter = (props) => {
    const { cx, cy, payload } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={10} 
        fill={payload.type === 'spam' ? '#EF4444' : '#10B981'} 
        opacity={0.8}
      />
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white border border-gray-700 mt-6">
      <div className="w-full overflow-x-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Word Distribution Analysis</h2>
        </div>
        <div className="flex justify-center">
          <ScatterChart
            width={800}
            height={400}
            margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="spamProb" 
              domain={[0, 100]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            >
              <Label 
                value="Spam Probability" 
                offset={0}
                position="insideBottom"
                fill="#9CA3AF"
              />
            </XAxis>
            <YAxis 
              type="number" 
              dataKey="hamProb" 
              domain={[0, 100]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            >
              <Label 
                value="Ham Probability" 
                angle={-90}
                position="insideLeft"
                fill="#9CA3AF"
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #4B5563',
                borderRadius: '0.375rem',
                color: '#F3F4F6'
              }}
              content={({ payload }) => {
                if (!payload || !payload[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-800 p-3 rounded shadow-lg border border-gray-700">
                    <p className="font-bold text-lg mb-1">{data.word}</p>
                    <p className="text-red-400">Spam Probability: {data.spamProb.toFixed(1)}%</p>
                    <p className="text-green-400">Ham Probability: {data.hamProb.toFixed(1)}%</p>
                    <p className="text-gray-300">Frequency: {data.frequency}</p>
                  </div>
                );
              }}
            />
            <Scatter 
              data={scatterData}
              shape={<CustomScatter />}
            />
          </ScatterChart>
        </div>
        <div className="flex justify-center items-center mt-6 space-x-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-300">Spam indicators</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300">Ham indicators</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordDispersionChart;