import axios from 'axios';
import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,SafeAreaView,KeyboardAvoidingView,Platform,ScrollView,Alert,ActivityIndicator} from 'react-native';
import BaseUrl from '../../constant/Baseurl';

const Icon = ({ name, size = 24, color = '#000', style }) => {
  const icons = {
    message: '💬',
    lock: '🔒',
    email: '📧',
    eye: '👁️',
    eyeOff: '🙈',
    google: '🔴',
    facebook: '🔵',
    apple: '⚫',
    check: '✅',
    loading: '⏳',
    user: '👤',
  };

  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
        },
        style,
      ]}
    >
      {icons[name] || '❓'}
    </Text>
  );
};

const RegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return false;
    }

    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long');
      return false;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long',
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms & Conditions');
      return false;
    }

    return true;
  };

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    try {
      if (!validateForm()) return;
      setIsLoading(true);

      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };

      const { data } = await axios.post(
        `${BaseUrl}/auth/register`,
        registrationData,
      );
      console.log('Registration successful:', data);
      setFormData({ name: '', email: '', password: '', confirmPassword: ''});
      setIsLoading(false);
      navigation.navigate('Login');
      console.log('Registering user with data:', registrationData);
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        'An error occurred during registration. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const handleSocialRegister = provider => {
    Alert.alert('Social Registration', `Creating account with ${provider}...`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="message" size={40} color="#007AFF" />
            </View>
            <Text style={styles.title}>Join ChatApp</Text>
            <Text style={styles.subtitle}>
              Create your account and start chatting
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Icon
                name="user"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={value => handleInputChange('name', value)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Icon
                name="email"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={value => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={value => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Icon
                  name={showPassword ? 'eyeOff' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={value =>
                  handleInputChange('confirmPassword', value)
                }
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Icon
                  name={showConfirmPassword ? 'eyeOff' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>
                Password must contain:
              </Text>
              <View style={styles.requirementItem}>
                <Text
                  style={[
                    styles.requirementText,
                    formData.password.length >= 6 && styles.requirementMet,
                  ]}
                >
                  • At least 6 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text
                  style={[
                    styles.requirementText,
                    formData.password === formData.confirmPassword &&
                      formData.confirmPassword.length > 0 &&
                      styles.requirementMet,
                  ]}
                >
                  • Passwords must match
                </Text>
              </View>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              disabled={isLoading}
            >
              <View
                style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
              >
                {acceptTerms && <Icon name="check" size={14} color="#fff" />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.registerButtonText}>
                    Creating Account...
                  </Text>
                </View>
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or sign up with</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Registration Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => handleSocialRegister('Google')}
                disabled={isLoading}
              >
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => handleSocialRegister('Facebook')}
                disabled={isLoading}
              >
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={() => handleSocialRegister('Apple')}
                disabled={isLoading}
              >
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Login Redirect */}
            <View style={styles.loginRedirectContainer}>
              <Text style={styles.loginRedirectText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={styles.loginRedirectLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#007AFF20',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 15,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    paddingRight: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 15,
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#999',
  },
  requirementMet: {
    color: '#28a745',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  dividerText: {
    color: '#999',
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
    gap: 8,
  },
  googleButton: {
    borderColor: '#DB443720',
  },
  facebookButton: {
    borderColor: '#4267B220',
  },
  appleButton: {
    borderColor: '#00000020',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loginRedirectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginRedirectText: {
    color: '#666',
    fontSize: 15,
  },
  loginRedirectLink: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default RegistrationScreen;
