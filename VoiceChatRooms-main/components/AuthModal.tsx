import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Phone, Apple, Eye, EyeOff, Globe, Shield, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuth: (user: any) => void;
}

export default function AuthModal({ visible, onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'phone'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('+966');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Animation values
  const logoGlow = new Animated.Value(0);
  const logoScale = new Animated.Value(1);
  const lightningOpacity = new Animated.Value(0);
  const starsOpacity = new Animated.Value(0);
  const particleAnimation = new Animated.Value(0);

  useEffect(() => {
    // Lightning glow effect for logo
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    // Subtle scale animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );

    // Lightning flash effect
    const lightningAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ])
    );

    // Twinkling stars
    const starsAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(starsOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(starsOpacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );

    // Floating particles
    const particleAnim = Animated.loop(
      Animated.timing(particleAnimation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: false,
      })
    );

    glowAnimation.start();
    scaleAnimation.start();
    lightningAnimation.start();
    starsAnimation.start();
    particleAnim.start();

    return () => {
      glowAnimation.stop();
      scaleAnimation.stop();
      lightningAnimation.stop();
      starsAnimation.stop();
      particleAnim.stop();
    };
  }, []);

  const handleAuth = () => {
    if (mode === 'login') {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      onAuth({
        id: '1',
        name: 'John Doe',
        email,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        isVip: false,
        level: 1,
      });
    } else if (mode === 'register') {
      if (!name || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      onAuth({
        id: '1',
        name,
        email,
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        isVip: false,
        level: 1,
      });
    } else {
      if (!phone) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      onAuth({
        id: '1',
        name: 'User',
        phone: selectedCountry + phone,
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        isVip: false,
        level: 1,
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    onAuth({
      id: '1',
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: false,
      level: 1,
    });
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset link will be sent to your email');
  };

  const handleGuestLogin = () => {
    try {
      onAuth({
        id: 'guest-' + Date.now(),
        name: 'Guest User',
        username: '@guest',
        email: 'guest@dreamksa.com',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        bio: 'Guest user exploring Dream KSA',
        level: 1,
        points: 0,
        rank: 0,
        isVip: false,
        joinDate: 'Today',
        location: 'Guest',
        isOnline: true,
        lastSeen: 'now',
        coins: {
          gold: 100,
          silver: 50,
          diamonds: 1,
        },
        stats: {
          friends: 0,
          giftsReceived: 0,
          giftsSent: 0,
          roomsCreated: 0,
          timeInVoiceChat: 0,
          achievements: 0,
        },
        isGuest: true,
      });
    } catch (error) {
      console.log('Guest login successful');
    }
  };

  const glowColor = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 215, 0, 0.8)'],
  });

  const particleY = particleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  });

  if (mode === 'login') {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="overFullScreen"
      >
        <LinearGradient
          colors={['#00C851', '#007E33', '#00C851', '#4CAF50']}
          style={styles.container}
        >
          {/* Animated Background Elements */}
          <View style={styles.backgroundElements}>
            {/* Floating Particles */}
            <Animated.View style={[
              styles.particle,
              styles.particle1,
              { transform: [{ translateY: particleY }] }
            ]} />
            <Animated.View style={[
              styles.particle,
              styles.particle2,
              { transform: [{ translateY: particleY }] }
            ]} />
            <Animated.View style={[
              styles.particle,
              styles.particle3,
              { transform: [{ translateY: particleY }] }
            ]} />

            {/* Twinkling Stars */}
            <Animated.View style={[styles.starsContainer, { opacity: starsOpacity }]}>
              <Star size={12} color="#FFD700" style={styles.star1} />
              <Star size={8} color="#FFD700" style={styles.star2} />
              <Star size={10} color="#FFD700" style={styles.star3} />
              <Star size={6} color="#FFD700" style={styles.star4} />
              <Star size={14} color="#FFD700" style={styles.star5} />
            </Animated.View>

            {/* Lightning Effect */}
            <Animated.View style={[styles.lightningContainer, { opacity: lightningOpacity }]}>
              <View style={styles.lightning} />
            </Animated.View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Can't login?</Text>
            </TouchableOpacity>
          </View>

          {/* Animated Logo with Glow Effect */}
          <View style={styles.logoContainer}>
            <Animated.View style={[
              styles.logoBackground,
              {
                transform: [{ scale: logoScale }],
              }
            ]}>
              <Animated.View style={[styles.logoGlow, { backgroundColor: glowColor }]} />
              <Text style={styles.logo}>Dream</Text>
              <Text style={styles.logoKSA}>KSA</Text>
              <View style={styles.logoUnderline} />
              <Text style={styles.logoTagline}>Voice Chat Kingdom</Text>
            </Animated.View>
          </View>

          {/* Login Buttons */}
          <View style={styles.buttonContainer}>
            {/* Google Login */}
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
            >
              <View style={styles.googleButton}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>

            {/* Apple Login */}
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Apple')}
            >
              <View style={styles.appleButton}>
                <Apple size={20} color="#fff" style={styles.appleIcon} />
                <Text style={styles.appleButtonText}>Continue with Apple ID</Text>
              </View>
            </TouchableOpacity>

            {/* Facebook Login */}
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Facebook')}
            >
              <View style={styles.facebookButton}>
                <Text style={styles.facebookIcon}>f</Text>
                <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
              </View>
            </TouchableOpacity>

            {/* Phone Login */}
            <TouchableOpacity 
              style={styles.phoneButtonContainer}
              onPress={() => setMode('phone')}
            >
              <View style={styles.phoneButton}>
                <Phone size={20} color="#00C851" />
              </View>
            </TouchableOpacity>

            {/* Guest Login */}
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={handleGuestLogin}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Features */}
          <View style={styles.featuresContainer}>
            <TouchableOpacity style={styles.featureButton}>
              <Globe size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featureText}>العربية</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton}>
              <Shield size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featureText}>Safe & Secure</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => setRememberMe(!rememberMe)}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By continuing, you agree to Dream KSA{'\n'}
              <Text style={styles.linkText}>Terms of service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Dream KSA v2.4</Text>
          </View>
        </LinearGradient>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#00C851', '#007E33']}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setMode('login')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {mode === 'phone' ? 'Phone Login' : 'Create Account'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.modalContent}>
          {mode === 'phone' ? (
            <View style={styles.form}>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity style={styles.countrySelector}>
                  <Text style={styles.countryCode}>{selectedCountry}</Text>
                  <Text style={styles.countryFlag}>🇸🇦</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone Number"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                <Text style={styles.authButtonText}>Send Verification Code</Text>
              </TouchableOpacity>

              <Text style={styles.phoneNote}>
                We'll send you a verification code via SMS
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <User size={20} color="#fff" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color="#fff" />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#fff" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255,255,255,0.7)" />
                  ) : (
                    <Eye size={20} color="rgba(255,255,255,0.7)" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                <Text style={styles.authButtonText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.switchText}>
                  Already have an account? <Text style={styles.switchLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  particle1: {
    width: 50,
    height: 50,
    left: '20%',
  },
  particle2: {
    width: 30,
    height: 30,
    right: '25%',
  },
  particle3: {
    width: 40,
    height: 40,
    left: '70%',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: 'absolute',
    top: '20%',
    left: '15%',
  },
  star2: {
    position: 'absolute',
    top: '35%',
    right: '20%',
  },
  star3: {
    position: 'absolute',
    top: '60%',
    left: '25%',
  },
  star4: {
    position: 'absolute',
    top: '75%',
    right: '30%',
  },
  star5: {
    position: 'absolute',
    top: '45%',
    left: '80%',
  },
  lightningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lightning: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 2,
    height: 100,
    backgroundColor: '#FFD700',
    transform: [{ translateX: -1 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    flex: 0.4,
    minHeight: 200,
    maxHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoBackground: {
    alignItems: 'center',
    position: 'relative',
    padding: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.3,
    top: -25,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    zIndex: 1,
  },
  logoKSA: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    fontStyle: 'italic',
    marginTop: -5,
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    zIndex: 1,
  },
  logoUnderline: {
    width: 120,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 8,
    zIndex: 1,
  },
  logoTagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginTop: 8,
    zIndex: 1,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 0.5,
    paddingHorizontal: 30,
    paddingBottom: 40,
    justifyContent: 'center',
    gap: 12,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  socialButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 50,
  },
  googleIcon: {
    marginRight: 15,
  },
  googleG: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appleButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 50,
  },
  appleIcon: {
    marginRight: 15,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 50,
  },
  facebookIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 15,
  },
  facebookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  phoneButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  phoneButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  guestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 50,
    justifyContent: 'center',
    marginTop: 5,
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20,
    gap: 30,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    paddingBottom: 20,
    maxWidth: 400,
    alignSelf: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 15,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  checkmark: {
    color: '#00C851',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 10,
    left: 15,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  // Modal styles for phone/register
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  form: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    width: '100%',
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#fff',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
    overflow: 'hidden',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  countryCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  countryFlag: {
    fontSize: 18,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
  },
  authButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  authButtonText: {
    color: '#00C851',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneNote: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 15,
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  switchLink: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});