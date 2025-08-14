// pages/_error.js
import React from 'react';

function ErrorPage({ statusCode }) {
  return (
    <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#111827', color: '#f9fafb' }}>
      <h1>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</h1>
      <p>This is a custom error page.</p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;