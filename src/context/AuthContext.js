import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log("AuthProvider rendered with user:", user);

  // Check for existing token on app launch
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const tokenExpiration = await AsyncStorage.getItem('tokenExpiration');
      
      if (token && tokenExpiration) {
        const expirationDate = new Date(tokenExpiration);
        const now = new Date();
        
        // Check if token is still valid
        if (expirationDate > now) {
          // Token is valid, load user data
          const userData = {
            id: await AsyncStorage.getItem('userId'),
            name: await AsyncStorage.getItem('userName'),
            email: await AsyncStorage.getItem('userEmail'),
            avatarUrl: await AsyncStorage.getItem('userAvatar'),
            token: token,
          };
          setUser(userData);
        } else {
          // Token expired, clear storage
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      // Store token and user data
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      await AsyncStorage.multiSet([
        ['authToken', userData.token],
        ['tokenExpiration', expirationDate.toISOString()],
        ['userId', userData.user.id],
        ['userName', userData.user.name],
        ['userEmail', userData.user.email],
        ['userAvatar', userData.user.avatarUrl || ''],
      ]);

      // Set user in context
      setUser({
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        avatarUrl: userData.user.avatarUrl,
        token: userData.token,
      });

      return true;
    } catch (error) {
      console.error('Error saving auth data:', error);
      return false;
    }
  };

 

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove([
      'authToken',
      'tokenExpiration',
      'userId',
      'userName',
      'userEmail',
      'userAvatar',
    ]);
    console.log("Cleared auth data from storage");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, clearAuthData,checkAuthStatus, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};