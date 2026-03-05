import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import QuizIcon from '@mui/icons-material/Quiz';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SecurityIcon from '@mui/icons-material/Security';

const features = [
  {
    icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
    title: 'Live Charts',
    description: 'Real-time cryptocurrency charts with OHLC data, MACD indicators, and price history for BTC, ETH, BNB, XRP & SOL.',
    color: '#00E099',
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    title: 'AI Predictions',
    description: 'LSTM neural network trained on news sentiment and technical indicators to predict 60-minute price returns.',
    color: '#00B4D8',
  },
  {
    icon: <QuizIcon sx={{ fontSize: 40 }} />,
    title: 'Prediction Game',
    description: 'Test your market intuition by predicting future prices on interactive charts and earn points for accuracy.',
    color: '#FF66CC',
  },
  {
    icon: <NewspaperIcon sx={{ fontSize: 40 }} />,
    title: 'Sentiment Analysis',
    description: 'FinBERT-powered sentiment analysis on crypto news headlines to gauge market mood in real time.',
    color: '#FFAA00',
  },
  {
    icon: <LeaderboardIcon sx={{ fontSize: 40 }} />,
    title: 'Leaderboard',
    description: 'Compete with other traders on the prediction leaderboard and see who has the best market instincts.',
    color: '#0099FF',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Binance Integration',
    description: 'Direct integration with Binance API for accurate, real-time market data across multiple trading pairs.',
    color: '#F0B90B',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 14 },
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -200,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,224,153,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3.5rem' },
              background: 'linear-gradient(135deg, #FFFFFF 20%, #00E099 50%, #00B4D8 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Predict the Future of Crypto
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.7,
            }}
          >
            AI-powered cryptocurrency analysis platform combining LSTM predictions,
            FinBERT sentiment analysis, and real-time market data.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/charts')}
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Explore Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/quiz')}
              sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Play Prediction Game
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}
        >
          Features
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}
        >
          Everything you need for crypto analysis and prediction
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(19, 26, 48, 0.6)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px rgba(${feature.color === '#00E099' ? '0,224,153' :
                        feature.color === '#FF66CC' ? '255,102,204' :
                          feature.color === '#00B4D8' ? '0,180,216' :
                            feature.color === '#FFAA00' ? '255,170,0' :
                              feature.color === '#0099FF' ? '0,153,255' :
                                '240,185,11'
                      }, 0.15)`,
                    borderColor: feature.color,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
