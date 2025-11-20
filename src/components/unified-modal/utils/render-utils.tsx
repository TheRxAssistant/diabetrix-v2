import React from 'react';

/**
 * Renders HTML content safely with proper line breaks
 */
export const renderHtmlContent = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      <span dangerouslySetInnerHTML={{ __html: line }} />
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

/**
 * Formats a service name for display
 */
export const formatServiceName = (service: string): string => {
  const serviceMap: Record<string, string> = {
    doctor: 'Find a Doctor',
    insurance: 'Insurance Assistance',
    pharmacy: 'Find a Pharmacy',
    learn: 'Learn About Diabetrix',
    chat: 'Chat with Concierge',
  };
  return serviceMap[service] || service;
};

/**
 * Gets service-specific redirect message
 */
export const getServiceRedirectMessage = (service: string): string => {
  const messages: Record<string, string> = {
    doctor: 'finding you a doctor',
    insurance: 'getting you insurance assistance',
    pharmacy: 'finding a pharmacy near you',
    learn: 'learning about Diabetrix',
    chat: 'connecting you with our concierge',
  };
  return messages[service] || 'your request';
};

