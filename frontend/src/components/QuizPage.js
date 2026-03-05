import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Snackbar,
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

const COLORS = {
  chart: '#00E099',
  cutoff: '#ef4444',
  prediction: '#3b82f6',
  average: '#facc15',
};

export default function Quiz() {
  const chartRef = useRef(null);
  const { user } = useAuth();
  const CHART_MARGIN = { top: 20, right: 20, bottom: 30, left: 50 };

  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [chartData, setChartData] = useState([]);
  const [cutoffTimestamp, setCutoffTimestamp] = useState(new Date().toISOString());
  const [prediction, setPrediction] = useState(null);
  const [result, setResult] = useState(null);
  const [showAverage, setShowAverage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const initialCutoff = useMemo(() => {
    if (!chartData.length) return new Date().toISOString();
    const a = chartData[0].timestamp;
    const b = chartData[chartData.length - 1].timestamp;
    return new Date(a + (b - a) * 0.6).toISOString();
  }, [chartData]);

  useEffect(() => {
    if (chartData.length) {
      setCutoffTimestamp(initialCutoff);
      setPrediction(null);
      setResult(null);
    }
  }, [initialCutoff, chartData]);

  useEffect(() => {
    axios
      .get(`/api/charts/${selectedCrypto}`)
      .then((resp) => {
        let data = resp.data;
        if (typeof data === 'string') {
          const clean = data.replace(/\bNaN\b/g, 'null');
          data = JSON.parse(clean);
        }
        setChartData(
          (data.historical_data || []).map((r) => ({
            ...r,
            timestamp: new Date(r.timestamp).getTime(),
          }))
        );
      })
      .catch(() => setChartData([]));
  }, [selectedCrypto]);

  const cutoffTimeNum = new Date(cutoffTimestamp).getTime();

  const displayedData = useMemo(
    () =>
      chartData.map((d) =>
        d.timestamp > cutoffTimeNum ? { ...d, close: null } : d
      ),
    [chartData, cutoffTimeNum]
  );

  const [yMin, yMax] = useMemo(() => {
    if (!chartData.length) return [0, 1];
    const vals = chartData.map((d) => d.close);
    return [Math.min(...vals), Math.max(...vals)];
  }, [chartData]);

  const xDomain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const start = chartData[0].timestamp;
    return [start, cutoffTimeNum + 3600_000];
  }, [chartData, cutoffTimeNum]);

  const averagePrice = useMemo(() => {
    if (!showAverage) return null;
    const valid = chartData.filter((d) => d.timestamp <= cutoffTimeNum);
    if (!valid.length) return null;
    return valid.reduce((sum, d) => sum + d.close, 0) / valid.length;
  }, [chartData, cutoffTimeNum, showAverage]);

  const resetChart = () => {
    setPrediction(null);
    setResult(null);
    setCutoffTimestamp(initialCutoff);
  };

  const handleWrapperClick = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const rect = e.currentTarget.getBoundingClientRect();
    const plotW = rect.width - CHART_MARGIN.left - CHART_MARGIN.right;
    const plotH = rect.height - CHART_MARGIN.top - CHART_MARGIN.bottom;
    if (
      offsetX < CHART_MARGIN.left ||
      offsetX > CHART_MARGIN.left + plotW ||
      offsetY < CHART_MARGIN.top ||
      offsetY > CHART_MARGIN.top + plotH
    )
      return;

    const [xMin, xMax] = xDomain;
    const ts = xMin + ((offsetX - CHART_MARGIN.left) / plotW) * (xMax - xMin);
    if (ts <= cutoffTimeNum) return;

    const price = yMax - ((offsetY - CHART_MARGIN.top) / plotH) * (yMax - yMin);
    setPrediction({ timestamp: ts, price });
    setResult(null);
  };

  const handleSubmitPrediction = async () => {
    if (!prediction || !user) return;

    setSubmitting(true);
    try {
      const res = await axios.post('/api/predict', {
        user_id: user.user_id || 1,
        crypto_symbol: selectedCrypto,
        predicted_price: prediction.price,
        prediction_time: new Date(prediction.timestamp).toISOString(),
      });
      setResult(res.data);
      setSnackbar({
        open: true,
        message: `Prediction submitted! You earned ${res.data.points_earned} points.`,
        severity: res.data.points_earned > 50 ? 'success' : 'warning',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to submit prediction. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active) return null;
    const val = payload?.[0]?.value;
    if (typeof val !== 'number' || label <= cutoffTimeNum) return null;

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
          {new Date(label).toLocaleString()}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          Close: ${val.toFixed(2)}
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
        Select a cryptocurrency, set your cutoff, then click on the right side
        of the chart to predict its future price.
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
            >
              {['BTC', 'ETH', 'BNB', 'XRP', 'SOL'].map((sym) => (
                <MenuItem key={sym} value={sym}>
                  {sym}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Cutoff Time"
            type="datetime-local"
            fullWidth
            value={cutoffTimestamp.slice(0, 16)}
            onChange={(e) => {
              const d = new Date(e.target.value);
              if (!isNaN(d)) setCutoffTimestamp(d.toISOString());
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={4} alignItems="center" display="flex">
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
      </Grid>

      {/* Chart */}
      <Paper sx={{ p: 2, mb: 3, height: 500 }} elevation={4}>
        <Box
          sx={{ width: '100%', height: '100%', cursor: 'crosshair' }}
          onClick={handleWrapperClick}
        >
          <ResponsiveContainer>
            <LineChart
              ref={chartRef}
              data={displayedData}
              margin={CHART_MARGIN}
            >
              <CartesianGrid stroke="#1F2A3D" />
              <XAxis
                dataKey="timestamp"
                domain={xDomain}
                type="number"
                scale="time"
                tick={{ fill: '#7A8A99' }}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: '#7A8A99' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend wrapperStyle={{ color: '#E1E8F1' }} />
              <Line
                type="monotone"
                dataKey="close"
                stroke={COLORS.chart}
                dot={false}
                connectNulls
              />
              <ReferenceLine
                x={cutoffTimeNum}
                stroke={COLORS.cutoff}
                strokeDasharray="5 5"
                label={{
                  position: 'top',
                  value: 'Cutoff',
                  fill: '#E1E8F1',
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
            {prediction
              ? `Your Prediction: $${prediction.price.toFixed(2)} at ${new Date(
                prediction.timestamp
              ).toLocaleString()}`
              : 'Click on the chart (to the right of the cutoff line) to place your prediction.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {prediction && user && !result && (
              <Button
                variant="contained"
                onClick={handleSubmitPrediction}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Prediction'}
              </Button>
            )}
            <Button variant="outlined" onClick={resetChart}>
              Reset
            </Button>
          </Box>
        </Box>

        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={result.points_earned > 50 ? 'success' : 'warning'}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body1">
                <strong>Actual Price:</strong> $
                {result.actual_price?.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                <strong>Points Earned:</strong> {result.points_earned} / 100
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
