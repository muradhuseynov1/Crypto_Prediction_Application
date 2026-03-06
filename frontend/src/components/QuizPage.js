import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Checkbox,
  FormControlLabel,
  Button,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LockIcon from '@mui/icons-material/Lock';

const COLORS = {
  chart: '#00E099',
  cutoff: '#ef4444',
  prediction: '#3b82f6',
  average: '#facc15',
  actual: '#f97316',
};

function formatTimestamp(ts) {
  const d = new Date(ts);
  const mon = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${mon} ${day} ${hh}:${mm}`;
}

export default function Quiz() {
  const chartRef = useRef(null);
  const { user } = useAuth();
  const CHART_MARGIN = { top: 20, right: 30, bottom: 30, left: 60 };

  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [chartData, setChartData] = useState([]);
  const [cutoffTs, setCutoffTs] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [result, setResult] = useState(null);
  const [showAverage, setShowAverage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  const fetchQuizData = useCallback(async (symbol) => {
    setLoading(true);
    setPrediction(null);
    setResult(null);
    setLocked(false);
    try {
      const resp = await axios.get(`/api/quiz-data/${symbol}`);
      const { candles, cutoff_timestamp } = resp.data;
      const mapped = candles.map((c) => ({
        timestamp: c.timestamp,
        close: c.close,
        volume: c.volume,
      }));
      setChartData(mapped);
      setCutoffTs(cutoff_timestamp);
    } catch {
      setChartData([]);
      setSnackbar({ open: true, message: 'Failed to load quiz data. Check your API keys.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizData(selectedCrypto);
  }, [selectedCrypto, fetchQuizData]);

  const [yMin, yMax] = useMemo(() => {
    if (!chartData.length) return [0, 1];
    const vals = chartData.map((d) => d.close);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = (hi - lo) * 0.1;
    return [lo - pad, hi + pad];
  }, [chartData]);

  const xDomain = useMemo(() => {
    if (!chartData.length) return [0, 1];
    const start = chartData[0].timestamp;
    const end = chartData[chartData.length - 1].timestamp;
    const span = end - start;
    return [start, end + span * 0.15];
  }, [chartData]);

  const averagePrice = useMemo(() => {
    if (!showAverage || !chartData.length) return null;
    return chartData.reduce((sum, d) => sum + d.close, 0) / chartData.length;
  }, [chartData, showAverage]);

  const handleWrapperClick = (e) => {
    if (locked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const plotW = rect.width - CHART_MARGIN.left - CHART_MARGIN.right;
    const plotH = rect.height - CHART_MARGIN.top - CHART_MARGIN.bottom;

    if (
      offsetX < CHART_MARGIN.left ||
      offsetX > CHART_MARGIN.left + plotW ||
      offsetY < CHART_MARGIN.top ||
      offsetY > CHART_MARGIN.top + plotH
    ) return;

    const [xMin, xMax] = xDomain;
    const ts = xMin + ((offsetX - CHART_MARGIN.left) / plotW) * (xMax - xMin);

    if (ts <= cutoffTs) return;

    const price = yMax - ((offsetY - CHART_MARGIN.top) / plotH) * (yMax - yMin);
    setPrediction({ timestamp: ts, price });
    setResult(null);
  };

  const handleSubmitPrediction = async () => {
    if (!prediction || !user) return;

    setSubmitting(true);
    try {
      const res = await axios.post('/api/predict', {
        user_id: user.user_id,
        crypto_symbol: selectedCrypto,
        predicted_price: prediction.price,
      });
      setResult(res.data);
      setLocked(true);
      setSnackbar({
        open: true,
        message: `You earned ${res.data.points_earned} points! Total: ${res.data.total_points}`,
        severity: res.data.points_earned > 50 ? 'success' : 'warning',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to submit prediction.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewRound = () => {
    fetchQuizData(selectedCrypto);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const point = payload[0].payload;
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(19, 26, 48, 0.95)',
          border: '1px solid #1F2A3D',
          borderRadius: 1,
          p: 1,
          pointerEvents: 'none',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {formatTimestamp(point.timestamp)}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          Close: ${point.close?.toFixed(2)}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <SportsEsportsIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight={700}>
          Prediction Game
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        The chart shows recent price history with the last 6 hours hidden.
        Click to the right of the red cutoff line to predict where the price is now.
      </Typography>

      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Crypto</InputLabel>
            <Select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              label="Crypto"
              disabled={locked}
            >
              {['BTC', 'ETH', 'BNB', 'XRP', 'SOL'].map((sym) => (
                <MenuItem key={sym} value={sym}>
                  {sym}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={showAverage}
                onChange={(e) => setShowAverage(e.target.checked)}
                sx={{
                  color: 'text.secondary',
                  '&.Mui-checked': { color: COLORS.average },
                }}
              />
            }
            label={
              <Typography color="text.secondary">Show Average</Typography>
            }
          />
        </Grid>

        <Grid item xs={12} sm={4} display="flex" alignItems="center" justifyContent="flex-end">
          {cutoffTs > 0 && (
            <Chip
              label={`Data up to: ${formatTimestamp(cutoffTs)}`}
              variant="outlined"
              sx={{ color: 'text.secondary', borderColor: COLORS.cutoff }}
            />
          )}
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper sx={{ p: 2, mb: 3, height: 500, position: 'relative' }} elevation={4}>
        {locked && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <LockIcon sx={{ fontSize: 16, color: COLORS.cutoff }} />
            <Typography variant="caption" color={COLORS.cutoff} fontWeight={600}>
              LOCKED — Click "New Round" to play again
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            width: '100%',
            height: '100%',
            cursor: locked ? 'not-allowed' : 'crosshair',
            opacity: loading ? 0.4 : 1,
            transition: 'opacity 0.3s',
          }}
          onClick={handleWrapperClick}
        >
          <ResponsiveContainer>
            <LineChart
              ref={chartRef}
              data={chartData}
              margin={CHART_MARGIN}
            >
              <CartesianGrid stroke="#1F2A3D" />
              <XAxis
                dataKey="timestamp"
                domain={xDomain}
                type="number"
                scale="time"
                tick={{ fill: '#7A8A99', fontSize: 11 }}
                tickFormatter={formatTimestamp}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: '#7A8A99', fontSize: 11 }}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend wrapperStyle={{ color: '#E1E8F1' }} />
              <Line
                type="monotone"
                dataKey="close"
                stroke={COLORS.chart}
                dot={false}
                name="Price"
                strokeWidth={2}
              />
              <ReferenceLine
                x={cutoffTs}
                stroke={COLORS.cutoff}
                strokeDasharray="5 5"
                label={{
                  position: 'top',
                  value: 'Hidden →',
                  fill: COLORS.cutoff,
                  fontSize: 12,
                }}
              />
              {showAverage && averagePrice != null && (
                <ReferenceLine
                  y={averagePrice}
                  stroke={COLORS.average}
                  strokeDasharray="3 3"
                  label={{
                    position: 'right',
                    value: `Avg $${averagePrice.toFixed(2)}`,
                    fill: '#E1E8F1',
                  }}
                />
              )}
              {prediction && (
                <ReferenceDot
                  x={prediction.timestamp}
                  y={prediction.price}
                  r={8}
                  fill={COLORS.prediction}
                  stroke="#fff"
                  strokeWidth={2}
                  label={{
                    position: 'top',
                    value: `$${prediction.price.toFixed(2)}`,
                    fill: '#E1E8F1',
                  }}
                />
              )}
              {result && (
                <ReferenceLine
                  y={result.actual_price}
                  stroke={COLORS.actual}
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  label={{
                    position: 'right',
                    value: `Actual $${result.actual_price.toFixed(2)}`,
                    fill: COLORS.actual,
                    fontWeight: 700,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Prediction & Result */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={4}>
        {!user && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Please log in to submit your prediction and earn points.
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography color="text.primary" sx={{ flex: 1 }}>
            {locked
              ? `Round complete! You predicted $${prediction?.price.toFixed(2)} — actual was $${result?.actual_price?.toFixed(2)}`
              : prediction
                ? `Your Prediction: $${prediction.price.toFixed(2)}`
                : 'Click on the chart (to the right of the red cutoff line) to predict the current price.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {prediction && user && !locked && (
              <Button
                variant="contained"
                onClick={handleSubmitPrediction}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Prediction'}
              </Button>
            )}
            {locked && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNewRound}
              >
                New Round
              </Button>
            )}
            {!locked && prediction && (
              <Button
                variant="outlined"
                onClick={() => { setPrediction(null); setResult(null); }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={result.points_earned > 50 ? 'success' : 'warning'}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body1">
                <strong>Your Prediction:</strong> ${prediction?.price.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                <strong>Actual Price:</strong> ${result.actual_price?.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                <strong>Points Earned:</strong> {result.points_earned} / 100
              </Typography>
              <Typography variant="body1">
                <strong>Total Points:</strong> {result.total_points}
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
