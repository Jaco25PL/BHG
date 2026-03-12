import './globals.css';

export const metadata = {
  title: 'AI Safety Demo — Medical Chatbot Bias & Harm Evaluation',
  description: 'QA demonstration of bias, harm, and guardrails in LLM-based medical chatbots using DeepEval.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
