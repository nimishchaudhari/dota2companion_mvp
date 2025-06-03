import React from 'react';
import { Box, Heading, Text, Button, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
    
    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} maxW="container.md" mx="auto">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="400px"
            borderRadius="lg"
            boxShadow="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Oops! Something went wrong
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </AlertDescription>
            
            <VStack spacing={4}>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  p={4}
                  bg="red.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="red.200"
                  maxW="100%"
                  overflow="auto"
                >
                  <Text fontSize="sm" fontFamily="mono" color="red.800">
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text fontSize="xs" fontFamily="mono" color="red.600" mt={2}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </Box>
              )}
              
              <Button
                colorScheme="teal"
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
              >
                Go to Home
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </VStack>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook to use with functional components
export function useErrorHandler() {
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return setError;
}

// HOC to wrap components with error boundary
export function withErrorBoundary(Component, fallback) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;