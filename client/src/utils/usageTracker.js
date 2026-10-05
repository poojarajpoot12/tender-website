const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const trackUsage = async (actionType) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/api/usage/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ actionType }),
    });
  } catch (err) {
    console.error(`Failed to track usage for ${actionType}:`, err);
  }
};