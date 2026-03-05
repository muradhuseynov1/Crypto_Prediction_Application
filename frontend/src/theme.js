import { createTheme } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: { default: '#0A0F1A', paper: '#131A30' },
        primary: { main: '#00E099' },
        secondary: { main: '#FF66CC' },
        text: { primary: '#E1E8F1', secondary: '#7A8A99' }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h2: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    background: 'linear-gradient(135deg, #00E099 0%, #00B87A 100%)',
                    color: '#0A0F1A',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 8,
                    '&:hover': {
                        background: 'linear-gradient(135deg, #00F0A8 0%, #00C988 100%)',
                        boxShadow: '0 0 20px rgba(0, 224, 153, 0.3)',
                    }
                },
                outlined: {
                    borderColor: '#00E099',
                    color: '#00E099',
                    textTransform: 'none',
                    borderRadius: 8,
                    '&:hover': {
                        borderColor: '#00F0A8',
                        backgroundColor: 'rgba(0, 224, 153, 0.08)',
                    }
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(19, 26, 48, 0.8)',
                        borderRadius: 8,
                        '& fieldset': { borderColor: '#1F2A3D' },
                        '&:hover fieldset': { borderColor: '#00E099' },
                        '&.Mui-focused fieldset': { borderColor: '#00E099' },
                    },
                    '& .MuiInputLabel-root': { color: '#7A8A99' },
                    '& .MuiInputBase-input': { color: '#E1E8F1' },
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 12,
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 12,
                    border: '1px solid rgba(31, 42, 61, 0.6)',
                }
            }
        }
    }
});

export default darkTheme;
