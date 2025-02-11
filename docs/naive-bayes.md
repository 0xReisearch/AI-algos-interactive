# Naive Bayes Text Classifier

An interactive implementation of the Naive Bayes algorithm for text classification, specifically demonstrated through crypto-related spam detection.

## How It Works

### 1. Training Data
The classifier is trained on two types of messages:
- **Spam**: Common crypto scam patterns (airdrops, fake support, urgent claims)
- **Ham**: Legitimate crypto discussions (market analysis, technical updates)

### 2. Probability Calculation
For each word in the input text:
- P(word|Spam): Probability of the word appearing in spam messages
- P(word|Ham): Probability of the word appearing in legitimate messages
- Uses Laplace smoothing to handle unseen words

### 3. Classification Process
1. Tokenizes input text into individual words
2. Calculates individual word probabilities
3. Applies Naive Bayes formula:
   - P(Spam|Words) = P(Spam) × P(Word₁|Spam) × P(Word₂|Spam) × ...
   - P(Ham|Words) = P(Ham) × P(Word₁|Ham) × P(Word₂|Ham) × ...
4. Normalizes probabilities to get final percentages

### 4. Visualization
- Word probability scatter plot showing spam vs ham probabilities
- Real-time probability calculations
- Color-coded classification results

## Implementation Details
- Uses React for UI components
- Recharts for data visualization
- TailwindCSS for styling
- Real-time computation and updates