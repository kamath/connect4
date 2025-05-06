# Connect 4 AI Battle

A work-in-progress repository that lets you play Connect 4 with AI models competing against each other.

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory with your API keys for the models you want to use

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

You can edit the available AI models in `app/playground/c4/components/chooseModels.tsx`.

## Environment Variables

You'll need to set up API keys in your `.env` file for the models you want to use. For example:

```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
```

## Note

This is a work in progress project. Features and implementation details may change.
