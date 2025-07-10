# TextAnalyzer

A modern web application for comprehensive document analysis and text insights. Upload PDF, DOCX, or TXT files to get detailed analytics including word statistics, readability scores, sentiment analysis, and visual data representations.

## Features

### 📊 Basic Analytics
- Word count, character count, and document structure analysis
- Reading time estimation and readability scoring
- Sentence and paragraph statistics

### 📈 Visual Analytics
- Interactive word frequency charts
- Word length distribution histograms
- Sentence complexity trends

### 🧠 Advanced Analysis
- Sentiment analysis with confidence scores
- Keyword extraction and topic modeling
- Writing style assessment
- Document complexity indicators

### 🎨 User Experience
- Drag-and-drop file upload interface
- Real-time analysis progress tracking
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **File Processing**: pdf-parse, mammoth, papaparse
- **Text Analysis**: NLP models *(have yet to decide which ones to use)*
- **Charts**: Chart.js / Recharts
- **Deployment**: Vercel *(probably, might be different)*

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/textanalyzer.git
cd textanalyzer
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze/       # Document analysis endpoint
│   │   └── upload/        # File upload handler
│   ├── components/        # React components
│   │   ├── upload/        # File upload components
│   │   ├── analysis/      # Analysis result components
│   │   └── charts/        # Chart components
│   ├── lib/               # Utility functions
│   │   ├── textAnalysis.ts # Core analysis logic
│   │   ├── fileProcessing.ts # File parsing utilities
│   │   └── calculations.ts # Statistical calculations
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── docs/                  # Documentation
```

## API Endpoints

- `POST /api/upload` - Handle file uploads
- `POST /api/analyze` - Process document analysis
- `GET /api/analysis/:id` - Retrieve analysis results

## Supported File Formats

- **PDF**: Text extraction from PDF documents
- **DOCX**: Microsoft Word document processing
- **TXT**: Plain text file analysis

## Roadmap

- [ ] Batch document analysis
- [ ] Export analysis results (PDF, CSV)
- [ ] Document comparison features
- [ ] Multi-language support
- [ ] API rate limiting and authentication
- [ ] Real-time collaborative analysis


---
