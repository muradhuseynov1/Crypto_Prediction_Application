import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
} from '@mui/material';
import axios from 'axios';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get('/api/leaderboard')
            .then((res) => setLeaders(res.data))
            .catch(() => setLeaders([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Box sx={{ p: 3, minHeight: '100vh', maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <LeaderboardIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                <Typography variant="h4" fontWeight={700}>
                    Leaderboard
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Top prediction players ranked by total points earned.
            </Typography>

            {loading ? (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <CircularProgress color="secondary" size={50} />
                </Box>
            ) : leaders.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No predictions yet. Be the first to play!
                    </Typography>
                </Paper>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={4}
                    sx={{ overflow: 'hidden' }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    '& th': {
                                        bgcolor: '#1A2236',
                                        color: '#E1E8F1',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        borderBottom: '2px solid #1F2A3D',
                                    },
                                }}
                            >
                                <TableCell align="center" sx={{ width: 80 }}>
                                    Rank
                                </TableCell>
                                <TableCell>Player</TableCell>
                                <TableCell align="right">Points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaders.map((player, idx) => (
                                <TableRow
                                    key={player.username}
                                    sx={{
                                        '&:nth-of-type(even)': { bgcolor: '#1A2236' },
                                        '&:nth-of-type(odd)': { bgcolor: '#131A30' },
                                        '&:hover': { bgcolor: '#222D42' },
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    <TableCell align="center">
                                        {idx < 3 ? (
                                            <EmojiEventsIcon
                                                sx={{ color: medalColors[idx], fontSize: 28 }}
                                            />
                                        ) : (
                                            <Typography variant="body1" color="text.secondary">
                                                {player.rank || idx + 1}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight={idx < 3 ? 600 : 400}>
                                            {player.username}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={`${player.points.toLocaleString()} pts`}
                                            size="small"
                                            sx={{
                                                bgcolor:
                                                    idx === 0
                                                        ? 'rgba(255,215,0,0.15)'
                                                        : 'rgba(0,224,153,0.12)',
                                                color: idx === 0 ? '#FFD700' : '#00E099',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
