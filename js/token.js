const getRefreshToken = () => localStorage.getItem('refresh_token');

// 액세스 토큰 갱신 함수
export async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    console.log(refreshToken);
    const response = await fetch('https://localhost/api/user/token/reissue', {
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
    const newRefreshToken = data.refresh;
    localStorage.setItem('access_token', newAccessToken);
    localStorage.setItem('refresh_token', newRefreshToken);

    return newAccessToken;
  } catch (error) {
      console.error('Error refreshing access token:', error);
    throw error;
  }
};
