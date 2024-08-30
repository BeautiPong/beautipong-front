const getRefreshToken = () => localStorage.getItem('refresh_token');

// 액세스 토큰 갱신 함수
export async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    const response = await fetch('http://localhost:8000/api/user/token/reissue/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    const newAccessToken = data.access;
    localStorage.setItem('access_token', newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};