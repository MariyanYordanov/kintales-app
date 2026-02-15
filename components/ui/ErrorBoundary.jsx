import { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <Text className="font-sans-bold text-2xl text-text-primary mb-2">
            Oops!
          </Text>
          <Text className="font-sans text-base text-text-secondary text-center mb-6">
            Something went wrong. Please try again.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-primary px-6 py-3 rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text className="font-sans-semibold text-base text-white">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
