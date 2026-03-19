const https = require('https');

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { topic } = req.query;

  if (!topic) {
    res.status(400).json({ error: 'Missing topic parameter' });
    return;
  }

  const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&pageSize=2&apiKey=${NEWS_API_KEY}`;

  https.get(apiUrl, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);

        if (json.articles && json.articles.length > 0) {
          const articles = json.articles.slice(0, 2).map((article) => ({
            title: article.title,
            source: article.source.name,
            url: article.url,
            description: article.description,
          }));
          res.status(200).json({ success: true, articles });
        } else {
          res.status(200).json({
            success: true,
            articles: [
              {
                title: `Latest news on ${topic}`,
                source: 'News Network',
                url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
              },
            ],
          });
        }
      } catch (e) {
        res.status(500).json({ success: false, error: 'Parse error' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ success: false, error: err.message });
  });
};
