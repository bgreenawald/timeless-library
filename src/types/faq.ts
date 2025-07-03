export interface FAQQuestion {
  question: string;
  answer: string;
}

export interface FAQSection {
  title: string;
  questions: FAQQuestion[];
}

export interface FAQData {
  sections: FAQSection[];
} 