import React, { useEffect, useState } from 'react';
import { Layout, MotivationQuote } from '../components';
import { getAllActivesQuotes } from '../services/motivationService';

const Dashboard: React.FC = () => {
  const [quotes, setQuotes] = useState<{ text: string; author?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await getAllActivesQuotes();
        const formatted = data.map((q: any) => ({
          text: q.quote,
          author: q.author || 'Anonymous',
        }));
        setQuotes(formatted);
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <Layout>
      {!loading && quotes.length > 0 && <MotivationQuote quotes={quotes} />}
    </Layout>
  );
};

export default Dashboard;
